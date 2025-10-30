import { lte, and, eq, ne } from "drizzle-orm";
import { db, schema } from "../db";

export const handleWarnExpiry = async () => {
  if (!db) {
    console.log("Database not initialized.");
    return;
  }

  const warnsQuery = await db
    .update(schema.playerWarns)
    .set({
      active: false,
    })
    .where(
      and(
        lte(schema.playerWarns.expiresAt, new Date()),
        eq(schema.playerWarns.active, true),
        and(
          ne(schema.playerWarns.type, "major"),
          ne(schema.playerWarns.type, "minor"),
        ),
      ),
    )
    .returning();

  console.log(`Ended ${warnsQuery.length} warns.`);
};
