import Redis from "ioredis";

import { REDIS_URL } from "@modules/config";

export const redis = new Redis(REDIS_URL);
