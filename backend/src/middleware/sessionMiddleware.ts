import { createMiddleware } from "hono/factory";
import { getCookie, setCookie } from "hono/cookie";
import * as auth from "#modules/auth";
import type { UserSelectMinimal } from "#modules/db/schema";
import { db } from "#modules/db";

const sessionMiddleware = createMiddleware<{
  Variables: {
    session: auth.Session | null;
    user: UserSelectMinimal | null;
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
  let newlyAssigned: boolean = false;
  if (authCookie === undefined) {
    const sessionToken = auth.generateSessionToken();
    authSession = await auth.createSession(sessionToken);
    setCookie(c, "session", sessionToken, { expires: authSession.expiresAt });
    c.set("session", authSession);
    newlyAssigned = true;
  }

  if (authCookie !== undefined && !newlyAssigned) {
    const validation = await auth.validateSessionToken(authCookie);
    authSession = validation.session;
    user = validation.user;
  }

  if (authSession === null) {
    const sessionToken = auth.generateSessionToken();
    authSession = await auth.createSession(sessionToken);
    setCookie(c, "session", sessionToken, { expires: authSession.expiresAt });
    c.set("session", authSession);
    newlyAssigned = true;
  }

  c.set("session", authSession);
  if (user !== null) c.set("user", user);

  await next();
  return;
});

export default sessionMiddleware;
