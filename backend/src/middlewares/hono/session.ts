import {
  createSession,
  generateSessionToken,
  Session,
  validateSessionToken,
} from "@modules/auth";
import { db, users } from "@modules/db";
import { createMiddleware } from "hono/factory";
import { getCookie, setCookie } from "hono/cookie";

export const sessionMiddleware = createMiddleware<{
  Variables: {
    session: Session | null;
    user?: typeof users.$inferSelect;
  };
}>(async (c, next) => {
  let sessionCookie = getCookie(c, "session");
  let session: Session | null;
  if (!sessionCookie) {
    const token = generateSessionToken();
    session = await createSession(token);
    sessionCookie = token;
    setCookie(c, "session", token);
  }

  session = await validateSessionToken(sessionCookie);

  if (!session) {
    const token = generateSessionToken();
    session = await createSession(token);
    setCookie(c, "session", token);
  }

  c.set("session", session);

  if (!session.userId) {
    next();
    return;
  }

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, session.userId!),
  });

  if (!user) {
    next();
    return;
  }

  c.set("user", user);
});
