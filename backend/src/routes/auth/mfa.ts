import { Elysia } from "elysia";

import authMiddleware from "@middlewares/elysia/authMiddleware";

export const mfa = new Elysia({ prefix: "/mfa", detail: { hide: true } }).use(authMiddleware())