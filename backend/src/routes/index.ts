import { Elysia } from "elysia";

import { auth as authRouter } from "@routes/auth";

export const routes = new Elysia({}).use(authRouter);
