import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import * as auth from "#modules/auth";
import type { UserSelectMinimal, ServerSelect } from "#modules/db/schema";
import { db } from "#modules/db";

const sessionMiddleware = createMiddleware<{
  Variables: {
    session: auth.Session | null;
    user: UserSelectMinimal | null;
    server: ServerSelect | null;
  };
}>(async (c, next) => {
  if (!db) {
    console.log("Database is not available");
    await next();
    return;
  }

  const authHeader = c.req.header("Authorization");
  const authCookie = getCookie(c, "session");

  const authSplit =
    authHeader === undefined ? undefined : authHeader.split(" ", 2);
  const authMethod =
    authSplit?.length !== undefined && authSplit.length > 1
      ? authSplit[0]
      : undefined;
  let authToken: string | undefined;

  if (
    authMethod === undefined &&
    authSplit !== undefined &&
    authSplit[0] !== undefined
  ) {
    authToken = authSplit[0];
  } else if (
    authMethod !== undefined &&
    authSplit !== undefined &&
    authSplit[1] !== undefined
  ) {
    authToken = authSplit[1];
  }

  switch (authMethod) {
    case "Bot": {
      console.log("Attempt to use unimplemented bot authentication route");
      await next();
      return;
    }

    case "Server": {
      if (authToken === undefined) {
        await next();
        return;
      }
      // Server auth
      const server = await auth.validateServerApiKey(authToken);

      if (server === null) {
        await next();
        return;
      }

      c.set("server", server);

      await next();
      return;
    }

    case undefined: {
      if (authToken === undefined) break;
      // No auth method, but auth token is present, this is alternative user auth
      const {
        session: authSession,
        user,
      }: { session: auth.Session | null; user: UserSelectMinimal | null } =
        await auth.validateSessionToken(authToken);

      if (authSession !== null) {
        c.set("session", authSession);
      }

      if (user !== null) {
        c.set("user", user);
      }

      await next();
      return;
    }
  }

  let authSession: auth.Session | null = null;
  let user: UserSelectMinimal | null = null;

  if (authCookie !== undefined) {
    const validation = await auth.validateSessionToken(authCookie);
    authSession = validation.session;
    user = validation.user;
  }

  c.set("session", authSession);
  if (user !== null) c.set("user", user);

  await next();
  return;
});

export default sessionMiddleware;
