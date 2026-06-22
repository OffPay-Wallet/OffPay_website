import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { getWaitlistCount } from "@/lib/waitlist-count";
import {
  WAITLIST_RATE_LIMIT_WINDOW_MS,
  WaitlistRateLimitError,
  acquireWaitlistIpRateLimit,
  enforceWaitlistRegistrationLimit,
  ensureWaitlistIndexes,
  ensureWaitlistRateLimitIndexes,
  getClientIp,
  getEmailValidationError,
  getRateLimitWindowStart,
  getUserAgent,
  insertUniqueWaitlistEntry,
  normalizeEmail,
  releaseWaitlistIpRateLimit,
  type WaitlistEntry,
  type WaitlistIpRateLimit,
} from "@/lib/waitlist-security";

function waitlistError(
  code: string,
  error: string,
  init: ResponseInit = { status: 200 },
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      status: "error",
      code,
      error,
      ...extra,
    },
    init
  );
}

export async function GET() {
  const count = await getWaitlistCount();
  return NextResponse.json({ count }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    // 1. Validate Content-Type
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return waitlistError(
        "invalid_request",
        "Please submit the form again.",
        { status: 415 }
      );
    }

    // 2. Parse request body safely
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return waitlistError(
        "invalid_request",
        "Please submit the form again.",
        { status: 400 }
      );
    }

    const email =
      typeof body === "object" && body !== null && "email" in body
        ? (body as { email?: unknown }).email
        : undefined;

    // 3. Strict NoSQL Injection check & length check
    const validationError = getEmailValidationError(email);
    if (validationError) {
      return waitlistError("invalid_email", validationError, { status: 400 });
    }

    const cleanedEmail = normalizeEmail(email as string);

    // 4. Retrieve bounded client details for auditing and spam prevention.
    const ip = getClientIp(request.headers);
    const userAgent = getUserAgent(request.headers);

    // 5. Connect to MongoDB
    const client = await getMongoClient();
    const dbName = process.env.MONGODB_DB || "offpay";
    const db = client.db(dbName);
    const collection = db.collection<WaitlistEntry>("waitlist");
    const rateLimitCollection =
      db.collection<WaitlistIpRateLimit>("waitlist_ip_rate_limits");

    // Fail closed if the database cannot enforce unique emails and indexed IP limits.
    await ensureWaitlistIndexes(collection);
    await ensureWaitlistRateLimitIndexes(rateLimitCollection);

    const existingEntry = await collection.findOne(
      { email: cleanedEmail },
      { projection: { _id: 1 } }
    );
    if (existingEntry) {
      const count = await collection.countDocuments().catch(() => 0);

      return waitlistError(
        "already_registered",
        "This email is already on the waitlist.",
        { status: 409 },
        { count }
      );
    }

    const now = new Date();

    try {
      await enforceWaitlistRegistrationLimit(collection, {
        ip,
        now,
      });
    } catch (error: unknown) {
      if (error instanceof WaitlistRateLimitError) {
        return waitlistError(
          "rate_limited",
          "Too many attempts. Please try again soon.",
          { status: 429 },
          { retryAfterSeconds: error.retryAfterSeconds }
        );
      }
      throw error;
    }

    const rateLimitResult = await acquireWaitlistIpRateLimit(
      rateLimitCollection,
      {
        ip,
        now,
      }
    );

    if (rateLimitResult.status === "limited") {
      const count = await collection.countDocuments().catch(() => 0);

      return waitlistError(
        "rate_limited",
        "Too many attempts. Please try again soon.",
        { status: 429 },
        { count, retryAfterSeconds: rateLimitResult.retryAfterSeconds }
      );
    }

    // 6. Insert the waitlist entry atomically; the unique index handles races.
    const newEntry: WaitlistEntry = {
      email: cleanedEmail,
      createdAt: now,
      ip,
      ipWindowStart: getRateLimitWindowStart(now),
      userAgent,
    };

    const insertResult = await insertUniqueWaitlistEntry(
      collection,
      newEntry
    ).catch(async (error: unknown) => {
      await releaseWaitlistIpRateLimit(rateLimitCollection, {
        ip,
        expiresAt: rateLimitResult.expiresAt,
      }).catch(() => {});
      throw error;
    });
    if (insertResult === "duplicate_ip") {
      const count = await collection.countDocuments().catch(() => 0);

      return waitlistError(
        "rate_limited",
        "Too many attempts. Please try again soon.",
        { status: 429 },
        {
          count,
          retryAfterSeconds: Math.ceil(WAITLIST_RATE_LIMIT_WINDOW_MS / 1000),
        }
      );
    }

    if (insertResult === "duplicate" || insertResult === "duplicate_email") {
      await releaseWaitlistIpRateLimit(rateLimitCollection, {
        ip,
        expiresAt: rateLimitResult.expiresAt,
      }).catch(() => {});

      const count = await collection.countDocuments().catch(() => 0);

      return waitlistError(
        "already_registered",
        "This email is already on the waitlist.",
        { status: 409 },
        { count }
      );
    }

    const count = await collection.countDocuments().catch(() => 0);

    return NextResponse.json(
      {
        status: "success",
        message: "Successfully added to the waitlist!",
        count,
        retryAfterSeconds: Math.ceil(WAITLIST_RATE_LIMIT_WINDOW_MS / 1000),
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("waitlist.post.failed", error);

    // 7. Mask internal database exceptions to prevent details leak
    return waitlistError(
      "temporarily_unavailable",
      "We couldn't add you right now. Please try again in a few minutes.",
      { status: 503 }
    );
  }
}
