import type { Collection, Document } from "mongodb";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_STORED_IP_LENGTH = 128;
const MAX_STORED_USER_AGENT_LENGTH = 512;
const DEFAULT_IP_RATE_LIMIT = 5;
const DEFAULT_EMAIL_RATE_LIMIT = 3;

export const WAITLIST_RATE_LIMIT_COLLECTION = "waitlist_rate_limits";
export const WAITLIST_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
export const WAITLIST_IP_RATE_LIMIT = parsePositiveInteger(
  process.env.WAITLIST_IP_RATE_LIMIT,
  DEFAULT_IP_RATE_LIMIT
);
export const WAITLIST_EMAIL_RATE_LIMIT = parsePositiveInteger(
  process.env.WAITLIST_EMAIL_RATE_LIMIT,
  DEFAULT_EMAIL_RATE_LIMIT
);

export interface WaitlistEntry extends Document {
  email: string;
  createdAt: Date;
  ip: string;
  userAgent: string;
}

export interface WaitlistRateLimitDocument extends Document {
  scope: "ip" | "email";
  key: string;
  windowStart: Date;
  attempts: number;
  expiresAt: Date;
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

export async function ensureWaitlistIndexes(
  waitlistCollection: Collection<WaitlistEntry>,
  rateLimitCollection: Collection<WaitlistRateLimitDocument>
) {
  await waitlistCollection.createIndex(
    { email: 1 },
    { unique: true, name: "waitlist_email_unique" }
  );
  await rateLimitCollection.createIndex(
    { scope: 1, key: 1, windowStart: 1 },
    { unique: true, name: "waitlist_rate_limit_window_unique" }
  );
  await rateLimitCollection.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: "waitlist_rate_limit_ttl" }
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

export async function enforceRateLimit(
  rateLimitCollection: Collection<WaitlistRateLimitDocument>,
  {
    scope,
    key,
    limit,
    now = new Date(),
  }: {
    scope: WaitlistRateLimitDocument["scope"];
    key: string;
    limit: number;
    now?: Date;
  }
) {
  const windowStart = getRateLimitWindowStart(now);
  const nextWindowStart = new Date(
    windowStart.getTime() + WAITLIST_RATE_LIMIT_WINDOW_MS
  );
  const expiresAt = new Date(
    windowStart.getTime() + WAITLIST_RATE_LIMIT_WINDOW_MS * 2
  );

  const updated = await rateLimitCollection.findOneAndUpdate(
    { scope, key, windowStart },
    {
      $inc: { attempts: 1 },
      $setOnInsert: { scope, key, windowStart, expiresAt },
    },
    { upsert: true, returnDocument: "after" }
  );

  if ((updated?.attempts ?? 0) > limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((nextWindowStart.getTime() - now.getTime()) / 1000)
    );
    throw new WaitlistRateLimitError(retryAfterSeconds);
  }
}

export async function enforceWaitlistRateLimits(
  rateLimitCollection: Collection<WaitlistRateLimitDocument>,
  {
    ip,
    email,
  }: {
    ip: string;
    email: string;
  }
) {
  await enforceRateLimit(rateLimitCollection, {
    scope: "ip",
    key: ip,
    limit: WAITLIST_IP_RATE_LIMIT,
  });
  await enforceRateLimit(rateLimitCollection, {
    scope: "email",
    key: email,
    limit: WAITLIST_EMAIL_RATE_LIMIT,
  });
}
