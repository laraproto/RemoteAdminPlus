import Redis from "ioredis";

import { REDIS_URL, REDIS_PASS } from "#modules/config";

export const redis = new Redis(REDIS_URL!, {
  password: REDIS_PASS!,
  maxRetriesPerRequest: null,
});
