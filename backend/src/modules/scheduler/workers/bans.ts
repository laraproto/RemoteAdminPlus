import { Worker } from "bullmq";
import { redis as connection } from "#modules/redis";
import { db, schema } from "#modules/db";
import { lte, eq, and, not } from "drizzle-orm";
import type { Bans } from "#modules/db/schema";

const banWorker = new Worker<Bans>(
  "bans",
  async (job) => {
    console.log(job.data);

    const ban = await db.query.playerBans.findFirst({
      where: (bans, { eq }) => eq(bans.uuid, job.data.uuid),
    });

    if (!ban) {
      console.log(
        `[bansWorker] Ban with UUID ${job.data.uuid} on Job ${job.id} could not be found, assuming it's been deleted`,
      );
      job.updateProgress(100);
      return;
    }

    if (ban.type === "permanent") {
      console.log(
        `[bansWorker] Ban with UUID ${job.data.uuid} was changed to a perm ban in between then and this job being run`,
      );
      job.updateProgress(100);
      return;
    }

    if (job.data.expiresAt.getTime() !== ban.expiresAt.getTime()) {
      console.log(
        `[bansWorker] Ban with UUID ${job.data.uuid} expiry was changed from ${job.data.expiresAt.toISOString()} to ${ban.expiresAt.toISOString()} since job was created`,
      );
      job.updateProgress(100);
      return;
    }

    const dbUpdate = await db
      .update(schema.playerBans)
      .set({
        active: false,
      })
      .where(
        and(
          eq(schema.playerBans.uuid, job.data.uuid),
          lte(schema.playerBans.expiresAt, new Date()),
          eq(schema.playerBans.active, true),
          not(eq(schema.playerBans.type, "permanent")),
        ),
      )
      .returning();

    if (!dbUpdate[0]) {
      console.log(
        `[bansWorker] Ban with UUID ${job.data.uuid} was already inactive or has a later expiry`,
      );
      job.updateProgress(100);
      return;
    }
    job.updateProgress(100);
    return dbUpdate[0];
  },
  { connection },
);

banWorker.on("error", (err) => {
  console.error("Ban worker encountered an error:", err);
});

export default banWorker;
