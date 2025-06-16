import { Elysia } from "elysia";

import * as authSystem from "@modules/auth";
import { db, users } from "@modules/db";

const authMiddleware = <T extends string>(config: { prefix?: T } = {}) => new Elysia(
  {
    name: 'authGuards',
    seed: config,
  }
).resolve(async ({ cookie: { session }}) => {
  const sessionToken = session.value ?? "";

  const currentSession = await authSystem.validateSessionToken(sessionToken);

  let user: typeof users.$inferSelect | undefined;

  if (currentSession !== null) {
    user = await db.query.users.findFirst({
      where: ( users, { eq }) => eq(users.id, currentSession?.userId),
    })
  }

  return {
    session: currentSession,
    user,
  }
}).as("global");

export default authMiddleware;