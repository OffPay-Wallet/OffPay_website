import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
  WAITLIST_RATE_LIMIT_COLLECTION,
  WaitlistRateLimitError,
  enforceWaitlistRateLimits,
  ensureWaitlistIndexes,
  getClientIp,
  getEmailValidationError,
  getUserAgent,
  insertUniqueWaitlistEntry,
  normalizeEmail,
  type WaitlistEntry,
  type WaitlistRateLimitDocument,
} from "@/lib/waitlist-security";

export async function GET() {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || "offpay";
    const db = client.db(dbName);
    const collection = db.collection("waitlist");

    const count = await collection.countDocuments();
    return NextResponse.json({ count }, { status: 200 });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Validate Content-Type
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { status: "error", error: "Invalid Content-Type. Expected application/json." },
        { status: 200 }
      );
    }

    // 2. Parse request body safely
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { status: "error", error: "Malformed JSON payload request." },
        { status: 200 }
      );
    }

    const email =
      typeof body === "object" && body !== null && "email" in body
        ? (body as { email?: unknown }).email
        : undefined;

    // 3. Strict NoSQL Injection check & length check
    const validationError = getEmailValidationError(email);
    if (validationError) {
      return NextResponse.json(
        { status: "error", error: validationError },
        { status: 200 }
      );
    }

    const cleanedEmail = normalizeEmail(email as string);

    // 4. Retrieve bounded client details for auditing and spam prevention.
    const ip = getClientIp(request.headers);
    const userAgent = getUserAgent(request.headers);

    // 5. Connect to MongoDB
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || "offpay";
    const db = client.db(dbName);
    const collection = db.collection<WaitlistEntry>("waitlist");
    const rateLimitCollection = db.collection<WaitlistRateLimitDocument>(
      WAITLIST_RATE_LIMIT_COLLECTION
    );

    // Fail closed if the database cannot enforce unique emails or rate-limit buckets.
    await ensureWaitlistIndexes(collection, rateLimitCollection);

    try {
      await enforceWaitlistRateLimits(rateLimitCollection, {
        ip,
        email: cleanedEmail,
      });
    } catch (error: unknown) {
      if (error instanceof WaitlistRateLimitError) {
        return NextResponse.json(
          {
            status: "error",
            error: error.message,
            retryAfterSeconds: error.retryAfterSeconds,
          },
          { status: 429 }
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
      return NextResponse.json(
        { status: "error", error: "Email is already registered." },
        { status: 200 }
      );
    }

    const count = await collection.countDocuments().catch(() => 0);

    return NextResponse.json(
      { status: "success", message: "Successfully added to the waitlist!", count },
      { status: 200 }
    );

  } catch {
    // 7. Mask internal database exceptions to prevent details leak
    return NextResponse.json(
      { status: "error", error: "An error occurred. Try again." },
      { status: 200 }
    );
  }
}
