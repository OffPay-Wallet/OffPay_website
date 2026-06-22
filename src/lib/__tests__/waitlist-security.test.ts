import assert from "node:assert/strict";
import test from "node:test";
import type { Collection } from "mongodb";
import {
  WAITLIST_RATE_LIMIT_WINDOW_MS,
  WaitlistRateLimitError,
  enforceWaitlistRegistrationLimit,
  ensureWaitlistIndexes,
  getClientIp,
  getEmailValidationError,
  insertUniqueWaitlistEntry,
  isDuplicateKeyError,
  normalizeEmail,
  sanitizeHeaderValue,
  type WaitlistEntry,
} from "../waitlist-security";

class InMemoryWaitlistCollection {
  constructor(private documents: WaitlistEntry[] = []) {}

  async countDocuments(filter: {
    ip: string;
    createdAt: { $gte: Date };
  }) {
    return this.documents.filter(
      (document) =>
        document.ip === filter.ip &&
        document.createdAt.getTime() >= filter.createdAt.$gte.getTime()
    ).length;
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
      createdAt: new Date(now.getTime() - WAITLIST_RATE_LIMIT_WINDOW_MS),
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

test("ensureWaitlistIndexes propagates index creation failures", async () => {
  const failingWaitlistCollection = {
    createIndex: async () => {
      throw new Error("index denied");
    },
  } as unknown as Collection<WaitlistEntry>;
  await assert.rejects(
    () => ensureWaitlistIndexes(failingWaitlistCollection),
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
