import { Elysia } from "elysia";

import { auth as authRouter } from "@routes/auth";
import { panel as panelRouter } from "@routes/panel";

export const routes = new Elysia({}).use(authRouter).use(panelRouter);
