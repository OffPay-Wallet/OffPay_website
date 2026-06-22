import type { Collection, Document } from "mongodb";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_STORED_IP_LENGTH = 128;
const MAX_STORED_USER_AGENT_LENGTH = 512;
const DEFAULT_IP_RATE_LIMIT = 1;

export const WAITLIST_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
export const WAITLIST_IP_RATE_LIMIT = parsePositiveInteger(
  process.env.WAITLIST_IP_RATE_LIMIT,
  DEFAULT_IP_RATE_LIMIT
);

export interface WaitlistEntry extends Document {
  email: string;
  createdAt: Date;
  ip: string;
  userAgent: string;
}

export class WaitlistRateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Too many waitlist attempts. Try again later.");
    this.name = "WaitlistRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

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

  const hasIpCreatedAtIndex = indexes.some((index) =>
    hasIndexKey(index, { ip: 1, createdAt: -1 })
  );

  if (!hasIpCreatedAtIndex) {
    await waitlistCollection
      .createIndex({ ip: 1, createdAt: -1 }, { name: "waitlist_ip_created_at" })
      .catch(() => {});
  }
}

export function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

export async function insertUniqueWaitlistEntry(
  waitlistCollection: Collection<WaitlistEntry>,
  entry: WaitlistEntry
) {
  try {
    await waitlistCollection.insertOne(entry);
    return "inserted";
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
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
  const windowStart = getRateLimitWindowStart(now);
  const nextWindowStart = new Date(
    windowStart.getTime() + WAITLIST_RATE_LIMIT_WINDOW_MS
  );
  const recentRegistrations = await waitlistCollection.countDocuments({
    ip,
    createdAt: { $gte: windowStart },
  });

  if (recentRegistrations >= limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((nextWindowStart.getTime() - now.getTime()) / 1000)
    );
    throw new WaitlistRateLimitError(retryAfterSeconds);
  }
}
