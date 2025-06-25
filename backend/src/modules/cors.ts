import { cors as corsMiddleware } from "@elysiajs/cors";

import { API_URL, URL } from "@modules/config";

export const strictCors = corsMiddleware({
  origin: [API_URL, URL],
  methods: ["GET", "POST"],
});
