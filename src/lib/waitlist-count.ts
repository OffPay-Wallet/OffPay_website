import { getMongoClient } from "@/lib/mongodb";

export async function getWaitlistCount() {
  try {
    const client = await getMongoClient();
    const dbName = process.env.MONGODB_DB || "offpay";
    const db = client.db(dbName);
    const collection = db.collection("waitlist");

    return await collection.countDocuments();
  } catch {
    return 0;
  }
}
