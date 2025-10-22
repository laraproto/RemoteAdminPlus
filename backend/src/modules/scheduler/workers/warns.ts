import { Worker } from "bullmq";
import { redis as connection } from "#modules/redis";
import { db, schema } from "#modules/db";
import { lte, eq, and, or } from "drizzle-orm";
import type { Warns } from "#modules/db/schema";

const warnWorker = new Worker<Warns>(
  "warns",
  async (job) => {
    console.log(job.data);

    const warn = await db.query.playerWarns.findFirst({
      where: (warns, { eq }) => eq(warns.uuid, job.data.uuid),
    });

    if (!warn) {
      console.log(
        `[warnsWorker] Warn with UUID ${job.data.uuid} on Job ${job.id} could not be found, assuming it's been deleted`,
      );
      job.updateProgress(100);
      return;
    }

    if (warn.type === "minor" || warn.type === "major") {
      console.log(
        `[warnsWorker] Warn with UUID ${job.data.uuid} was changed to a perm warn in between then and this job being run`,
      );
      job.updateProgress(100);
      return;
    }

    if (job.data.expiresAt.getTime() !== warn.expiresAt.getTime()) {
      console.log(
        `[warnsWorker] Warn with UUID ${job.data.uuid} expiry was changed from ${job.data.expiresAt.toISOString()} to ${warn.expiresAt.toISOString()} since job was created`,
      );
      job.updateProgress(100);
      return;
    }

    const dbUpdate = await db
      .update(schema.playerWarns)
      .set({
        active: false,
      })
      .where(
        and(
          eq(schema.playerWarns.uuid, job.data.uuid),
          lte(schema.playerWarns.expiresAt, new Date()),
          eq(schema.playerWarns.active, true),
          or(
            eq(schema.playerWarns.type, "minor"),
            eq(schema.playerWarns.type, "major"),
          ),
        ),
      )
      .returning();

    if (!dbUpdate[0]) {
      console.log(
        `[warnsWorker] Warns with UUID ${job.data.uuid} was already inactive or has a later expiry`,
      );
      job.updateProgress(100);
      return;
    }
    job.updateProgress(100);
    return dbUpdate[0];
  },
  { connection },
);

warnWorker.on("error", (err) => {
  console.error("Warn worker encountered an error:", err);
});

export default warnWorker;
