import { cors as corsMiddleware } from '@elysiajs/cors';

import { API_DOMAIN, DOMAIN } from "@modules/config";

export const strictCors = corsMiddleware({
  origin: [API_DOMAIN, DOMAIN],
});