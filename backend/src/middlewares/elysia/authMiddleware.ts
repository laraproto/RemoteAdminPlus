import { Elysia } from "elysia";

import * as authSystem from "@modules/auth";
import { db, users } from "@modules/db";
import { Session } from "@modules/auth";

const authMiddleware = <T extends string>(
  config: { prefix?: T; requiresMFA?: boolean } = { requiresMFA: true },
) =>
  new Elysia({
    name: "authGuards",
    seed: config,
  })
    .resolve(async ({ cookie: { session } }) => {
      const sessionToken = session.value ?? "";

      const currentSession: Session | null =
        await authSystem.validateSessionToken(sessionToken);

      let user: typeof users.$inferSelect | undefined;

      if (currentSession !== null) {
        user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, currentSession?.userId),
        });
      }

      return {
        session: currentSession,
        user,
      };
    })
    .as("global");

export default authMiddleware;
