import { Elysia } from "elysia";

import { strictCors } from "@modules/cors";
import login from "./login";

export const auth = new Elysia({ prefix: "/auth", detail: { hide: true } }).use(strictCors).use(
  login,
);
