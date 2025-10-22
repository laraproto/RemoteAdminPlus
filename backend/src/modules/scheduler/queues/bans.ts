import { Queue } from "bullmq";
import type { Bans } from "#modules/db/schema";

export const bansQueue = new Queue("bans");

export async function scheduleBan(ban: Bans) {
  if (ban.type === "permanent") {
    console.log("This ban is permanent, expiry will not get scheduled");
    return;
  }

  const jobId = `ban:${ban.uuid}`;

  const delay = ban.expiresAt.getTime() - Date.now();

  if (delay <= 0) {
    console.log("Ban expiry time is in the past, not scheduling");
    return;
  }

  await bansQueue.add("expireBan", ban, {
    jobId,
    delay,
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 100,
    deduplication: {
      id: ban.uuid,
    },
  });
}
