import { lte, and, eq, ne } from "drizzle-orm";
import { db, schema } from "../db";

export const handleBanExpiry = async () => {
  if (!db) {
    console.log("Database not initialized.");
    return;
  }

  const bansQuery = await db
    .update(schema.playerBans)
    .set({
      active: false,
    })
    .where(
      and(
        lte(schema.playerBans.expiresAt, new Date()),
        eq(schema.playerBans.active, true),
        ne(schema.playerBans.type, "permanent"),
      ),
    )
    .returning();

  console.log(`Ended ${bansQuery.length} bans.`);
};
