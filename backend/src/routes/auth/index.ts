import { Elysia } from "elysia";

import { strictCors } from "@modules/cors";
import login from "./login";
import logout from "./logout";
import { mfa } from "@routes/auth/mfa";
import me from "@routes/auth/me";

export const auth = new Elysia({ prefix: "/auth", detail: { hide: true } })
  .use(strictCors)
  .use(login)
  .use(logout)
  .use(me)
  .use(mfa)
