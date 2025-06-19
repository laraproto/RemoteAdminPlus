import { Elysia } from "elysia";

import { strictCors } from "@modules/cors";
import login from "./login";
import logout from "./logout";
import { mfa } from "@routes/auth/mfa";

export const auth = new Elysia({ prefix: "/auth", detail: { hide: true } })
  .use(strictCors)
  .use(login)
  .use(logout)
  .use(mfa)
