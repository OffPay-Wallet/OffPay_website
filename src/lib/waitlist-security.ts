import type { Collection, Document } from "mongodb";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_STORED_IP_LENGTH = 128;
const MAX_STORED_USER_AGENT_LENGTH = 512;
const DEFAULT_IP_RATE_LIMIT = 1;
const DEFAULT_IP_REQUEST_LIMIT = 5;

export const WAITLIST_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
export const WAITLIST_IP_RATE_LIMIT = parsePositiveInteger(
  process.env.WAITLIST_IP_RATE_LIMIT,
  DEFAULT_IP_RATE_LIMIT
);
export const WAITLIST_IP_REQUEST_LIMIT = parsePositiveInteger(
  process.env.WAITLIST_IP_REQUEST_LIMIT,
  DEFAULT_IP_REQUEST_LIMIT
);

export interface WaitlistEntry extends Document {
  email: string;
  createdAt: Date;
  ip: string;
  ipWindowStart?: Date;
  userAgent: string;
}

export interface WaitlistIpRateLimit extends Document {
  _id: string;
  createdAt: Date;
  expiresAt: Date;
  updatedAt: Date;
}

export interface WaitlistIpRequestLimit extends Document {
  _id: string;
  windowStartedAt: Date;
  requestCount: number;
  blockedUntil?: Date;
  updatedAt: Date;
}

export class WaitlistRateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Too many waitlist attempts. Try again later.");
    this.name = "WaitlistRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export type WaitlistIpRateLimitResult =
  | { status: "acquired"; expiresAt: Date }
  | { status: "limited"; expiresAt: Date | null; retryAfterSeconds: number };

function parsePositiveInteger(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getEmailValidationError(email: unknown) {
  if (typeof email !== "string") {
    return "Email address must be a string.";
  }

  const cleanedEmail = normalizeEmail(email);

  if (!cleanedEmail) {
    return "Please enter your email.";
  }

  if (cleanedEmail.length > MAX_EMAIL_LENGTH) {
    return "Email address is too long.";
  }

  if (!EMAIL_REGEX.test(cleanedEmail)) {
    return "Please enter a valid email.";
  }

  return null;
}

export function sanitizeHeaderValue(value: string | null, maxLength: number) {
  if (!value) {
    return "";
  }

  return value.replace(/[\r\n\t]+/g, " ").trim().slice(0, maxLength);
}

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0] ?? null;
  const ip =
    sanitizeHeaderValue(firstForwardedIp, MAX_STORED_IP_LENGTH) ||
    sanitizeHeaderValue(headers.get("x-real-ip"), MAX_STORED_IP_LENGTH);

  return ip || "unknown";
}

export function getUserAgent(headers: Headers) {
  return (
    sanitizeHeaderValue(headers.get("user-agent"), MAX_STORED_USER_AGENT_LENGTH) ||
    "unknown"
  );
}

type WaitlistIndexDescription = {
  name?: string;
  key?: Record<string, number>;
  unique?: boolean;
};

function hasIndexKey(
  index: WaitlistIndexDescription,
  expectedKey: Record<string, number>
) {
  const actualEntries = Object.entries(index.key ?? {});
  const expectedEntries = Object.entries(expectedKey);

  return (
    actualEntries.length === expectedEntries.length &&
    expectedEntries.every(
      ([field, direction]) => index.key?.[field] === direction
    )
  );
}

async function deleteDuplicateWaitlistEmails(
  waitlistCollection: Collection<WaitlistEntry>
) {
  const duplicateGroups = await waitlistCollection
    .aggregate<{ duplicateIds: unknown[] }>([
      { $sort: { email: 1, createdAt: 1, _id: 1 } },
      {
        $group: {
          _id: "$email",
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          _id: { $type: "string" },
          count: { $gt: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          duplicateIds: {
            $slice: ["$ids", 1, { $subtract: ["$count", 1] }],
          },
        },
      },
    ])
    .toArray();
  const duplicateIds = duplicateGroups.flatMap((group) => group.duplicateIds);

  if (duplicateIds.length > 0) {
    await waitlistCollection.deleteMany({
      _id: { $in: duplicateIds },
    } as Document);
  }

  return duplicateIds.length;
}

export async function ensureWaitlistIndexes(
  waitlistCollection: Collection<WaitlistEntry>
) {
  const indexes =
    (await waitlistCollection.indexes()) as WaitlistIndexDescription[];
  const emailIndex = indexes.find((index) => hasIndexKey(index, { email: 1 }));

  if (emailIndex) {
    if (emailIndex.unique !== true) {
      await deleteDuplicateWaitlistEmails(waitlistCollection);

      if (!emailIndex.name) {
        throw new Error("waitlist email index must be named before replacement");
      }

      await waitlistCollection.dropIndex(emailIndex.name);
      await waitlistCollection.createIndex(
        { email: 1 },
        { unique: true, name: "waitlist_email_unique" }
      );
    }
  } else {
    await deleteDuplicateWaitlistEmails(waitlistCollection);
    await waitlistCollection.createIndex(
      { email: 1 },
      { unique: true, name: "waitlist_email_unique" }
    );
  }

  const ipIndex = indexes.find((index) => hasIndexKey(index, { ip: 1 }));

  if (ipIndex?.unique === true) {
    if (!ipIndex.name) {
      throw new Error("waitlist IP index must be named before replacement");
    }

    await waitlistCollection.dropIndex(ipIndex.name);
  }

  const hasIpCreatedAtIndex = indexes.some((index) =>
    hasIndexKey(index, { ip: 1, createdAt: -1 })
  );

  if (!hasIpCreatedAtIndex) {
    await waitlistCollection
      .createIndex({ ip: 1, createdAt: -1 }, { name: "waitlist_ip_created_at" })
      .catch(() => {});
  }

  const hasIpWindowIndex = indexes.some((index) =>
    hasIndexKey(index, { ip: 1, ipWindowStart: 1 })
  );

  if (!hasIpWindowIndex) {
    await waitlistCollection.createIndex(
      { ip: 1, ipWindowStart: 1 },
      {
        unique: true,
        name: "waitlist_ip_window_unique",
        partialFilterExpression: { ipWindowStart: { $exists: true } },
      }
    );
  }
}

export async function ensureWaitlistRateLimitIndexes(
  rateLimitCollection: Collection<WaitlistIpRateLimit>
) {
  await rateLimitCollection.createIndex(
    { expiresAt: 1 },
    {
      expireAfterSeconds: 0,
      name: "waitlist_ip_rate_limit_expires_at",
    }
  );
}

export async function ensureWaitlistRequestLimitIndexes(
  requestLimitCollection: Collection<WaitlistIpRequestLimit>
) {
  await requestLimitCollection.createIndex(
    { blockedUntil: 1 },
    {
      expireAfterSeconds: 0,
      name: "waitlist_ip_request_blocked_until",
    }
  );
}

export function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

export function getDuplicateKeyField(error: unknown) {
  if (!isDuplicateKeyError(error)) {
    return null;
  }

  const duplicateError = error as {
    keyPattern?: Record<string, unknown>;
    message?: string;
  };

  if (duplicateError.keyPattern?.email === 1) {
    return "email";
  }

  if (duplicateError.keyPattern?.ip === 1) {
    return "ip";
  }

  if (duplicateError.message?.includes("waitlist_ip_window_unique")) {
    return "ip";
  }

  if (duplicateError.message?.includes("waitlist_email_unique")) {
    return "email";
  }

  return "unknown";
}

export async function insertUniqueWaitlistEntry(
  waitlistCollection: Collection<WaitlistEntry>,
  entry: WaitlistEntry
) {
  try {
    await waitlistCollection.insertOne(entry);
    return "inserted";
  } catch (error: unknown) {
    const duplicateKeyField = getDuplicateKeyField(error);

    if (duplicateKeyField === "email") {
      return "duplicate_email";
    }

    if (duplicateKeyField === "ip") {
      return "duplicate_ip";
    }

    if (duplicateKeyField === "unknown") {
      return "duplicate";
    }

    throw error;
  }
}

export function getRateLimitWindowStart(now: Date) {
  return new Date(
    Math.floor(now.getTime() / WAITLIST_RATE_LIMIT_WINDOW_MS) *
      WAITLIST_RATE_LIMIT_WINDOW_MS
  );
}

export function getRateLimitExpiresAt(now: Date) {
  return new Date(now.getTime() + WAITLIST_RATE_LIMIT_WINDOW_MS);
}

function getRetryAfterSeconds(expiresAt: Date | undefined, now: Date) {
  return Math.max(
    1,
    Math.ceil(((expiresAt?.getTime() ?? now.getTime()) - now.getTime()) / 1000)
  );
}

export async function enforceWaitlistRegistrationLimit(
  waitlistCollection: Collection<WaitlistEntry>,
  {
    ip,
    limit = WAITLIST_IP_RATE_LIMIT,
    now = new Date(),
  }: {
    ip: string;
    limit?: number;
    now?: Date;
  }
) {
  const windowStart = new Date(now.getTime() - WAITLIST_RATE_LIMIT_WINDOW_MS);
  const recentRegistrations = await waitlistCollection.countDocuments({
    ip,
    createdAt: { $gte: windowStart },
  });

  if (recentRegistrations >= limit) {
    const oldestRecentRegistration = await waitlistCollection.findOne(
      { ip, createdAt: { $gte: windowStart } },
      { sort: { createdAt: 1 }, projection: { createdAt: 1 } }
    );
    const retryAfterMs =
      (oldestRecentRegistration?.createdAt?.getTime() ?? now.getTime()) +
      WAITLIST_RATE_LIMIT_WINDOW_MS -
      now.getTime();
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    throw new WaitlistRateLimitError(retryAfterSeconds);
  }
}

export async function enforceWaitlistRequestLimit(
  requestLimitCollection: Collection<WaitlistIpRequestLimit>,
  {
    ip,
    limit = WAITLIST_IP_REQUEST_LIMIT,
    now = new Date(),
    attempt = 0,
  }: {
    ip: string;
    limit?: number;
    now?: Date;
    attempt?: number;
  }
): Promise<void> {
  const windowStart = new Date(now.getTime() - WAITLIST_RATE_LIMIT_WINDOW_MS);
  const currentRecord = await requestLimitCollection.findOne(
    { _id: ip },
    {
      projection: {
        blockedUntil: 1,
        requestCount: 1,
        windowStartedAt: 1,
      },
    }
  );

  if (currentRecord?.blockedUntil && currentRecord.blockedUntil > now) {
    throw new WaitlistRateLimitError(
      getRetryAfterSeconds(currentRecord.blockedUntil, now)
    );
  }

  if (!currentRecord) {
    try {
      await requestLimitCollection.insertOne({
        _id: ip,
        requestCount: 1,
        windowStartedAt: now,
        updatedAt: now,
      });
      return;
    } catch (error: unknown) {
      if (!isDuplicateKeyError(error) || attempt >= 2) {
        throw error;
      }

      return enforceWaitlistRequestLimit(requestLimitCollection, {
        ip,
        limit,
        now,
        attempt: attempt + 1,
      });
    }
  }

  if (currentRecord.windowStartedAt < windowStart) {
    const resetResult = await requestLimitCollection.updateOne(
      { _id: ip, windowStartedAt: currentRecord.windowStartedAt },
      {
        $set: {
          requestCount: 1,
          updatedAt: now,
          windowStartedAt: now,
        },
        $unset: { blockedUntil: "" },
      }
    );

    if (resetResult.matchedCount === 1) {
      return;
    }

    if (attempt >= 2) {
      throw new WaitlistRateLimitError(1);
    }

    return enforceWaitlistRequestLimit(requestLimitCollection, {
      ip,
      limit,
      now,
      attempt: attempt + 1,
    });
  }

  const incrementResult = await requestLimitCollection.updateOne(
    {
      _id: ip,
      requestCount: { $lt: limit },
      windowStartedAt: currentRecord.windowStartedAt,
    },
    {
      $inc: { requestCount: 1 },
      $set: { updatedAt: now },
    }
  );

  if (incrementResult.matchedCount === 1) {
    return;
  }

  const blockedUntil = getRateLimitExpiresAt(now);
  await requestLimitCollection.updateOne(
    {
      _id: ip,
      requestCount: { $gte: limit },
      windowStartedAt: currentRecord.windowStartedAt,
    },
    {
      $set: { blockedUntil, updatedAt: now },
    }
  );

  const latestRecord = await requestLimitCollection.findOne(
    { _id: ip },
    { projection: { blockedUntil: 1 } }
  );

  throw new WaitlistRateLimitError(
    getRetryAfterSeconds(latestRecord?.blockedUntil ?? blockedUntil, now)
  );
}

export async function acquireWaitlistIpRateLimit(
  rateLimitCollection: Collection<WaitlistIpRateLimit>,
  {
    ip,
    now = new Date(),
  }: {
    ip: string;
    now?: Date;
  }
): Promise<WaitlistIpRateLimitResult> {
  const existingLock = await rateLimitCollection.findOne(
    { _id: ip },
    { projection: { expiresAt: 1 } }
  );

  if (existingLock?.expiresAt && existingLock.expiresAt > now) {
    return {
      status: "limited",
      expiresAt: existingLock.expiresAt,
      retryAfterSeconds: getRetryAfterSeconds(existingLock.expiresAt, now),
    };
  }

  const expiresAt = getRateLimitExpiresAt(now);
  const lockDocument: WaitlistIpRateLimit = {
    _id: ip,
    createdAt: now,
    expiresAt,
    updatedAt: now,
  };

  if (!existingLock) {
    try {
      await rateLimitCollection.insertOne(lockDocument);
      return { status: "acquired", expiresAt };
    } catch (error: unknown) {
      if (!isDuplicateKeyError(error)) {
        throw error;
      }
    }
  } else {
    const updateResult = await rateLimitCollection.updateOne(
      { _id: ip, expiresAt: { $lte: now } },
      {
        $set: { expiresAt, updatedAt: now },
      }
    );

    if (updateResult.matchedCount === 1) {
      return { status: "acquired", expiresAt };
    }
  }

  const activeLock = await rateLimitCollection.findOne(
    { _id: ip },
    { projection: { expiresAt: 1 } }
  );

  return {
    status: "limited",
    expiresAt: activeLock?.expiresAt ?? null,
    retryAfterSeconds: getRetryAfterSeconds(activeLock?.expiresAt, now),
  };
}

export async function releaseWaitlistIpRateLimit(
  rateLimitCollection: Collection<WaitlistIpRateLimit>,
  {
    ip,
    expiresAt,
  }: {
    ip: string;
    expiresAt: Date;
  }
) {
  await rateLimitCollection.deleteOne({ _id: ip, expiresAt });
}
