import Redis from "ioredis";

import { REDIS_URL, REDIS_PREFIX, REDIS_PASS } from "#modules/config";

export const redis = new Redis(REDIS_URL, {
  keyPrefix: REDIS_PREFIX,
  password: REDIS_PASS,
});
