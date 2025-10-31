import { lte } from "drizzle-orm";
import { db, schema } from "../db";

export const handleLinkExpiry = async () => {
  if (!db) {
    console.log("Database not initialized.");
    return;
  }

  const bansQuery = await db
    .delete(schema.accountLinkCodes)
    .where(lte(schema.accountLinkCodes.expiresAt, new Date()))
    .returning();

  console.log(`Deleted ${bansQuery.length} expired link codes.`);
};
