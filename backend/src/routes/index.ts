import { Elysia } from "elysia";

import { auth as authRouter } from "@routes/auth";

export const routes = new Elysia({ prefix: "/" }).use(authRouter);
