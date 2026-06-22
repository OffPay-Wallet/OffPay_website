import assert from "node:assert/strict";
import test from "node:test";
import type { Collection } from "mongodb";
import {
  WAITLIST_RATE_LIMIT_WINDOW_MS,
  WaitlistRateLimitError,
  acquireWaitlistIpRateLimit,
  enforceWaitlistRegistrationLimit,
  ensureWaitlistIndexes,
  getDuplicateKeyField,
  getClientIp,
  getEmailValidationError,
  getRateLimitExpiresAt,
  insertUniqueWaitlistEntry,
  isDuplicateKeyError,
  normalizeEmail,
  releaseWaitlistIpRateLimit,
  sanitizeHeaderValue,
  type WaitlistEntry,
  type WaitlistIpRateLimit,
} from "../waitlist-security";

type RecentRegistrationFilter = {
  ip: string;
  createdAt: { $gte: Date };
};

class InMemoryWaitlistCollection {
  constructor(private documents: WaitlistEntry[] = []) {}

  private findRecentDocuments(filter: RecentRegistrationFilter) {
    return this.documents.filter(
      (document) =>
        document.ip === filter.ip &&
        document.createdAt.getTime() >= filter.createdAt.$gte.getTime()
    );
  }

  async countDocuments(filter: RecentRegistrationFilter) {
    return this.findRecentDocuments(filter).length;
  }

  async findOne(filter: RecentRegistrationFilter) {
    return (
      this.findRecentDocuments(filter).sort(
        (left, right) => left.createdAt.getTime() - right.createdAt.getTime()
      )[0] ?? null
    );
  }
}

class InMemoryRateLimitCollection {
  constructor(private locks: WaitlistIpRateLimit[] = []) {}

  async findOne(filter: { _id: string }) {
    return this.locks.find((lock) => lock._id === filter._id) ?? null;
  }

  async insertOne(document: WaitlistIpRateLimit) {
    if (this.locks.some((lock) => lock._id === document._id)) {
      throw { code: 11000, keyPattern: { _id: 1 } };
    }

    this.locks.push({ ...document });
    return { acknowledged: true, insertedId: document._id };
  }

  async updateOne(
    filter: { _id: string; expiresAt: { $lte: Date } },
    update: { $set: Partial<WaitlistIpRateLimit> }
  ) {
    const lock = this.locks.find(
      (candidate) =>
        candidate._id === filter._id &&
        candidate.expiresAt.getTime() <= filter.expiresAt.$lte.getTime()
    );

    if (!lock) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    Object.assign(lock, update.$set);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(filter: { _id: string; expiresAt: Date }) {
    const beforeCount = this.locks.length;
    this.locks = this.locks.filter(
      (lock) =>
        lock._id !== filter._id ||
        lock.expiresAt.getTime() !== filter.expiresAt.getTime()
    );

    return { deletedCount: beforeCount - this.locks.length };
  }
}

test("enforceWaitlistRegistrationLimit blocks above recent successful registrations", async () => {
  const now = new Date("2026-06-22T06:00:00.000Z");
  const collection = new InMemoryWaitlistCollection([
    {
      email: "first@example.com",
      createdAt: now,
      ip: "198.51.100.10",
      userAgent: "node-test",
    },
    {
      email: "second@example.com",
      createdAt: now,
      ip: "198.51.100.10",
      userAgent: "node-test",
    },
  ]) as unknown as Collection<WaitlistEntry>;

  await assert.rejects(
    () =>
      enforceWaitlistRegistrationLimit(collection, {
        ip: "198.51.100.10",
        limit: 2,
        now,
      }),
    (error) =>
      error instanceof WaitlistRateLimitError &&
      error.retryAfterSeconds > 0
  );
});

test("enforceWaitlistRegistrationLimit ignores older successful registrations", async () => {
  const now = new Date("2026-06-22T06:00:00.000Z");
  const collection = new InMemoryWaitlistCollection([
    {
      email: "old@example.com",
      createdAt: new Date(now.getTime() - WAITLIST_RATE_LIMIT_WINDOW_MS - 1),
      ip: "198.51.100.10",
      userAgent: "node-test",
    },
  ]) as unknown as Collection<WaitlistEntry>;

  await enforceWaitlistRegistrationLimit(collection, {
    ip: "198.51.100.10",
    limit: 1,
    now,
  });
});

test("acquireWaitlistIpRateLimit blocks the same IP until the one-hour cooldown expires", async () => {
  const ip = "198.51.100.10";
  const now = new Date("2026-06-22T06:00:00.000Z");
  const collection =
    new InMemoryRateLimitCollection() as unknown as Collection<WaitlistIpRateLimit>;

  const firstResult = await acquireWaitlistIpRateLimit(collection, { ip, now });
  assert.deepEqual(firstResult, {
    status: "acquired",
    expiresAt: getRateLimitExpiresAt(now),
  });

  const secondResult = await acquireWaitlistIpRateLimit(collection, {
    ip,
    now: new Date(now.getTime() + 5 * 60 * 1000),
  });
  assert.equal(secondResult.status, "limited");
  assert.equal(
    secondResult.status === "limited" && secondResult.retryAfterSeconds,
    55 * 60
  );

  const thirdResult = await acquireWaitlistIpRateLimit(collection, {
    ip,
    now: new Date(now.getTime() + WAITLIST_RATE_LIMIT_WINDOW_MS + 1),
  });
  assert.equal(thirdResult.status, "acquired");
});

test("acquireWaitlistIpRateLimit treats duplicate lock races as rate limits", async () => {
  const ip = "198.51.100.10";
  const now = new Date("2026-06-22T06:00:00.000Z");
  const expiresAt = getRateLimitExpiresAt(now);
  let findCalls = 0;
  const collection = {
    findOne: async () => {
      findCalls += 1;
      return findCalls === 1
        ? null
        : {
            _id: ip,
            createdAt: now,
            expiresAt,
            updatedAt: now,
          };
    },
    insertOne: async () => {
      throw { code: 11000, keyPattern: { _id: 1 } };
    },
  } as unknown as Collection<WaitlistIpRateLimit>;

  const result = await acquireWaitlistIpRateLimit(collection, { ip, now });

  assert.equal(result.status, "limited");
  assert.equal(
    result.status === "limited" && result.retryAfterSeconds,
    WAITLIST_RATE_LIMIT_WINDOW_MS / 1000
  );
});

test("releaseWaitlistIpRateLimit clears an acquired lock for failed inserts", async () => {
  const ip = "198.51.100.10";
  const now = new Date("2026-06-22T06:00:00.000Z");
  const collection =
    new InMemoryRateLimitCollection() as unknown as Collection<WaitlistIpRateLimit>;
  const firstResult = await acquireWaitlistIpRateLimit(collection, { ip, now });

  assert.equal(firstResult.status, "acquired");
  if (firstResult.status !== "acquired") {
    return;
  }

  await releaseWaitlistIpRateLimit(collection, {
    ip,
    expiresAt: firstResult.expiresAt,
  });

  const secondResult = await acquireWaitlistIpRateLimit(collection, {
    ip,
    now: new Date(now.getTime() + 60 * 1000),
  });

  assert.equal(secondResult.status, "acquired");
});

test("ensureWaitlistIndexes propagates index creation failures", async () => {
  const failingWaitlistCollection = {
    indexes: async () => [],
    aggregate: () => ({
      toArray: async () => [],
    }),
    createIndex: async () => {
      throw new Error("index denied");
    },
  } as unknown as Collection<WaitlistEntry>;
  await assert.rejects(
    () => ensureWaitlistIndexes(failingWaitlistCollection),
    /index denied/
  );
});

test("ensureWaitlistIndexes accepts an existing unique email index with any name", async () => {
  let createIndexCalls = 0;
  const waitlistCollection = {
    indexes: async () => [
      { key: { _id: 1 } },
      { key: { email: 1 }, unique: true, name: "email_1" },
      { key: { ip: 1, createdAt: -1 }, name: "waitlist_ip_created_at" },
      {
        key: { ip: 1, ipWindowStart: 1 },
        unique: true,
        name: "waitlist_ip_window_unique",
      },
    ],
    createIndex: async () => {
      createIndexCalls += 1;
      return "created";
    },
  } as unknown as Collection<WaitlistEntry>;

  await ensureWaitlistIndexes(waitlistCollection);

  assert.equal(createIndexCalls, 0);
});

test("ensureWaitlistIndexes repairs email duplicates and replaces obsolete indexes", async () => {
  const droppedIndexes: string[] = [];
  const createdIndexes: Array<{
    key: Record<string, number>;
    options?: Record<string, unknown>;
  }> = [];
  const deletedFilters: Array<Record<string, unknown>> = [];
  const waitlistCollection = {
    indexes: async () => [
      { key: { _id: 1 } },
      { key: { email: 1 }, name: "email_1" },
      { key: { ip: 1 }, unique: true, name: "ip_1" },
    ],
    aggregate: () => ({
      toArray: async () => [{ duplicateIds: ["duplicate-id"] }],
    }),
    deleteMany: async (filter: Record<string, unknown>) => {
      deletedFilters.push(filter);
      return { deletedCount: 1 };
    },
    dropIndex: async (name: string) => {
      droppedIndexes.push(name);
      return { ok: 1 };
    },
    createIndex: async (
      key: Record<string, number>,
      options?: Record<string, unknown>
    ) => {
      createdIndexes.push(options === undefined ? { key } : { key, options });
      return "created";
    },
  } as unknown as Collection<WaitlistEntry>;

  await ensureWaitlistIndexes(waitlistCollection);

  assert.deepEqual(deletedFilters, [
    { _id: { $in: ["duplicate-id"] } },
  ]);
  assert.deepEqual(droppedIndexes, ["email_1", "ip_1"]);
  assert.equal(
    createdIndexes.some(
      (index) =>
        index.key.email === 1 &&
        index.options?.unique === true &&
        index.options?.name === "waitlist_email_unique"
    ),
    true
  );
  assert.equal(
    createdIndexes.some(
      (index) =>
        index.key.ip === 1 &&
        index.key.createdAt === -1 &&
        index.options?.name === "waitlist_ip_created_at"
    ),
    true
  );
  assert.equal(
    createdIndexes.some(
      (index) =>
        index.key.ip === 1 &&
        index.key.ipWindowStart === 1 &&
        index.options?.unique === true &&
        index.options?.name === "waitlist_ip_window_unique"
    ),
    true
  );
});

test("isDuplicateKeyError identifies Mongo duplicate-key failures", () => {
  assert.equal(isDuplicateKeyError({ code: 11000 }), true);
  assert.equal(isDuplicateKeyError({ code: 42 }), false);
});

test("getDuplicateKeyField identifies email and IP duplicate-key failures", () => {
  assert.equal(
    getDuplicateKeyField({ code: 11000, keyPattern: { email: 1 } }),
    "email"
  );
  assert.equal(
    getDuplicateKeyField({ code: 11000, keyPattern: { ip: 1 } }),
    "ip"
  );
  assert.equal(getDuplicateKeyField({ code: 11000 }), "unknown");
});

test("insertUniqueWaitlistEntry reports duplicate emails without a pre-read", async () => {
  const entry: WaitlistEntry = {
    email: "test@example.com",
    createdAt: new Date("2026-06-22T06:00:00.000Z"),
    ip: "198.51.100.10",
    userAgent: "node-test",
  };
  const duplicateCollection = {
    insertOne: async () => {
      throw { code: 11000, keyPattern: { email: 1 } };
    },
  } as unknown as Collection<WaitlistEntry>;

  assert.equal(
    await insertUniqueWaitlistEntry(duplicateCollection, entry),
    "duplicate_email"
  );
});

test("insertUniqueWaitlistEntry reports duplicate IPs without a pre-read", async () => {
  const entry: WaitlistEntry = {
    email: "test@example.com",
    createdAt: new Date("2026-06-22T06:00:00.000Z"),
    ip: "198.51.100.10",
    userAgent: "node-test",
  };
  const duplicateCollection = {
    insertOne: async () => {
      throw { code: 11000, keyPattern: { ip: 1 } };
    },
  } as unknown as Collection<WaitlistEntry>;

  assert.equal(
    await insertUniqueWaitlistEntry(duplicateCollection, entry),
    "duplicate_ip"
  );
});

test("email validation rejects non-string operators and normalizes valid emails", () => {
  assert.equal(
    getEmailValidationError({ $ne: null }),
    "Email address must be a string."
  );
  assert.equal(normalizeEmail("  Test@Example.COM  "), "test@example.com");
  assert.equal(getEmailValidationError("test@example.com"), null);
});

test("client identity helpers use bounded sanitized header values", () => {
  const headers = new Headers({
    "x-forwarded-for": " 198.51.100.10 , 203.0.113.20 ",
    "x-real-ip": "203.0.113.30",
  });

  assert.equal(getClientIp(headers), "198.51.100.10");
  assert.equal(sanitizeHeaderValue("alpha\r\nbeta\tgamma", 10), "alpha beta");
});
