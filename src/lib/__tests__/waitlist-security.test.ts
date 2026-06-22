import assert from "node:assert/strict";
import test from "node:test";
import type { Collection } from "mongodb";
import {
  WAITLIST_RATE_LIMIT_WINDOW_MS,
  WaitlistRateLimitError,
  enforceRateLimit,
  ensureWaitlistIndexes,
  getClientIp,
  getEmailValidationError,
  insertUniqueWaitlistEntry,
  isDuplicateKeyError,
  normalizeEmail,
  sanitizeHeaderValue,
  type WaitlistEntry,
  type WaitlistRateLimitDocument,
} from "../waitlist-security";

class InMemoryRateLimitCollection {
  private documents = new Map<string, WaitlistRateLimitDocument>();

  async findOneAndUpdate(
    filter: Pick<WaitlistRateLimitDocument, "scope" | "key" | "windowStart">,
    update: {
      $inc: { attempts: number };
      $setOnInsert: Pick<
        WaitlistRateLimitDocument,
        "scope" | "key" | "windowStart" | "expiresAt"
      >;
    }
  ) {
    const documentKey = [
      filter.scope,
      filter.key,
      filter.windowStart.toISOString(),
    ].join(":");
    const existing = this.documents.get(documentKey);
    const document: WaitlistRateLimitDocument = existing ?? {
      ...update.$setOnInsert,
      attempts: 0,
    };

    document.attempts += update.$inc.attempts;
    this.documents.set(documentKey, document);

    return { ...document };
  }
}

test("enforceRateLimit blocks attempts above the configured window limit", async () => {
  const collection =
    new InMemoryRateLimitCollection() as unknown as Collection<WaitlistRateLimitDocument>;
  const now = new Date("2026-06-22T06:00:00.000Z");

  await enforceRateLimit(collection, {
    scope: "ip",
    key: "198.51.100.10",
    limit: 2,
    now,
  });
  await enforceRateLimit(collection, {
    scope: "ip",
    key: "198.51.100.10",
    limit: 2,
    now,
  });

  await assert.rejects(
    () =>
      enforceRateLimit(collection, {
        scope: "ip",
        key: "198.51.100.10",
        limit: 2,
        now,
      }),
    (error) =>
      error instanceof WaitlistRateLimitError &&
      error.retryAfterSeconds > 0
  );
});

test("enforceRateLimit starts a fresh bucket in the next window", async () => {
  const collection =
    new InMemoryRateLimitCollection() as unknown as Collection<WaitlistRateLimitDocument>;
  const now = new Date("2026-06-22T06:00:00.000Z");

  await enforceRateLimit(collection, {
    scope: "email",
    key: "test@example.com",
    limit: 1,
    now,
  });
  await enforceRateLimit(collection, {
    scope: "email",
    key: "test@example.com",
    limit: 1,
    now: new Date(now.getTime() + WAITLIST_RATE_LIMIT_WINDOW_MS),
  });
});

test("ensureWaitlistIndexes propagates index creation failures", async () => {
  const failingWaitlistCollection = {
    createIndex: async () => {
      throw new Error("index denied");
    },
  } as unknown as Collection<WaitlistEntry>;
  const rateLimitCollection = {
    createIndex: async () => "created",
  } as unknown as Collection<WaitlistRateLimitDocument>;

  await assert.rejects(
    () => ensureWaitlistIndexes(failingWaitlistCollection, rateLimitCollection),
    /index denied/
  );
});

test("isDuplicateKeyError identifies Mongo duplicate-key failures", () => {
  assert.equal(isDuplicateKeyError({ code: 11000 }), true);
  assert.equal(isDuplicateKeyError({ code: 42 }), false);
});

test("insertUniqueWaitlistEntry reports duplicate inserts without a pre-read", async () => {
  const entry: WaitlistEntry = {
    email: "test@example.com",
    createdAt: new Date("2026-06-22T06:00:00.000Z"),
    ip: "198.51.100.10",
    userAgent: "node-test",
  };
  const duplicateCollection = {
    insertOne: async () => {
      throw { code: 11000 };
    },
  } as unknown as Collection<WaitlistEntry>;

  assert.equal(await insertUniqueWaitlistEntry(duplicateCollection, entry), "duplicate");
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
