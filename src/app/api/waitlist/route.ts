import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { status: "error", error: "Malformed JSON payload request." },
        { status: 200 }
      );
    }

    const { email } = body;

    // 3. Strict NoSQL Injection check & length check
    if (typeof email !== "string") {
      return NextResponse.json(
        { status: "error", error: "Email address must be a string." },
        { status: 200 }
      );
    }

    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail) {
      return NextResponse.json(
        { status: "error", error: "Please enter your email." },
        { status: 200 }
      );
    }

    if (cleanedEmail.length > 254) {
      return NextResponse.json(
        { status: "error", error: "Email address is too long." },
        { status: 200 }
      );
    }

    if (!EMAIL_REGEX.test(cleanedEmail)) {
      return NextResponse.json(
        { status: "error", error: "Please enter a valid email." },
        { status: 200 }
      );
    }

    // 4. Retrieve client details for auditing/analytics and spam prevention
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 5. Connect to MongoDB
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || "offpay";
    const db = client.db(dbName);
    const collection = db.collection("waitlist");

    // Create unique index on email if not exists (runs once per client instance lifecycle)
    await collection.createIndex({ email: 1 }, { unique: true }).catch(() => {});

    // 6. Check if email already registered
    const existing = await collection.findOne({ email: cleanedEmail });
    if (existing) {
      return NextResponse.json(
        { status: "error", error: "Email is already registered." },
        { status: 200 }
      );
    }

    // 7. Insert the waitlist entry
    const newEntry = {
      email: cleanedEmail,
      createdAt: new Date(),
      ip,
      userAgent,
    };

    await collection.insertOne(newEntry);

    const count = await collection.countDocuments().catch(() => 0);

    return NextResponse.json(
      { status: "success", message: "Successfully added to the waitlist!", count },
      { status: 200 }
    );

  } catch (error: any) {
    // 8. Mask internal database exceptions to prevent details leak
    return NextResponse.json(
      { status: "error", error: "An error occurred. Try again." },
      { status: 200 }
    );
  }
}
