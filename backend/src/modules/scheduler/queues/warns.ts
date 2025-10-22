import { Queue } from "bullmq";
import type { Warns } from "#modules/db/schema";

export const warnsQueue = new Queue("warns");

export async function scheduleBan(warn: Warns) {
  if (warn.type === "major" || warn.type === "minor") {
    console.log("This warn is permanent, expiry will not get scheduled");
    return;
  }

  const jobId = `warn:${warn.uuid}`;

  const delay = warn.expiresAt.getTime() - Date.now();

  if (delay <= 0) {
    console.log("Warn expiry time is in the past, not scheduling");
    return;
  }

  await warnsQueue.add("expireWarn", warn, {
    jobId,
    delay,
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 100,
    deduplication: {
      id: warn.uuid,
    },
  });
}
