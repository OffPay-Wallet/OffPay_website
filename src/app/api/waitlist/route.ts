import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { getWaitlistCount } from "@/lib/waitlist-count";
import {
  WaitlistRateLimitError,
  enforceWaitlistRegistrationLimit,
  ensureWaitlistIndexes,
  getClientIp,
  getEmailValidationError,
  getUserAgent,
  insertUniqueWaitlistEntry,
  normalizeEmail,
  type WaitlistEntry,
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

    // Fail closed if the database cannot enforce unique emails and indexed IP limits.
    await ensureWaitlistIndexes(collection);

    const existingEntry = await collection.findOne(
      { email: cleanedEmail },
      { projection: { _id: 1 } }
    );
    if (existingEntry) {
      const count = await collection.countDocuments().catch(() => 0);

      return NextResponse.json(
        {
          status: "success",
          code: "already_registered",
          message: "You're on the waitlist.",
          count,
        },
        { status: 200 }
      );
    }

    try {
      await enforceWaitlistRegistrationLimit(collection, {
        ip,
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

    // 6. Insert the waitlist entry atomically; the unique index handles races.
    const newEntry: WaitlistEntry = {
      email: cleanedEmail,
      createdAt: new Date(),
      ip,
      userAgent,
    };

    const insertResult = await insertUniqueWaitlistEntry(collection, newEntry);
    if (insertResult === "duplicate") {
      const count = await collection.countDocuments().catch(() => 0);

      return NextResponse.json(
        {
          status: "success",
          code: "already_registered",
          message: "You're on the waitlist.",
          count,
        },
        { status: 200 }
      );
    }

    const count = await collection.countDocuments().catch(() => 0);

    return NextResponse.json(
      { status: "success", message: "Successfully added to the waitlist!", count },
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
