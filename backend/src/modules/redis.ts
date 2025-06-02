import Redis from "ioredis";

import { REDIS_URL, REDIS_PREFIX } from "@modules/config";

export const redis = new Redis(REDIS_URL, {
  keyPrefix: REDIS_PREFIX,
});
