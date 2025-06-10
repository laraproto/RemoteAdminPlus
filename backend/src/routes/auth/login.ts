// Handles all registration

import { Elysia, t } from "elysia";

import * as auth from "@modules/auth";
import { db } from "@modules/db";
import { DOMAIN } from "@modules/config";

const router = new Elysia()
  .guard({
    beforeHandle: async ({ cookie: { session }, status }) => {
      if (
        session.value !== undefined &&
        (await auth.validateSessionToken(session.value))
      )
        return status(401);
    },
  })
  .post(
    "/login",
    async ({ body: { username, password }, cookie: { session }, status, redirect }) => {
      if (!validateUsername(username)) {
        return status(400, { message: 'Invalid username (min 3, max 31 characters, alphanumeric only)' });
      }
      if (!validatePassword(password)) {
        return status(400, { message: 'Invalid password (min 6, max 255 characters)' });
      }

      const result = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, username),
      })

      if (!result) {
        return status(400, { message: 'Incorrect username or password' });
      }

      const validPassword = await Bun.password.verify(password, result.password);
      if (!validPassword) {
        return status(400, { message: 'Incorrect username or password' });
      }

      const sessionToken = auth.generateSessionToken();
      const sessionData = await auth.createSession(sessionToken, result.id);
      session.expires = sessionData.expiresAt
      session.value = sessionToken;

      return redirect(`${DOMAIN}/auth/callback?panelContext=${"Among Us"}`, 302)
    },
    {
      body: t.Object({
        username: t.String({ minLength: 3, maxLength: 31 }),
        password: t.String({ minLength: 6, maxLength: 255 }),
      }),
      response: {
        302: t.Undefined(),
        400: t.Object({
          message: t.String(),
        }),
      }
    },
  );

function validateUsername(username: unknown): username is string {
  return (
    typeof username === 'string' &&
    username.length >= 3 &&
    username.length <= 31 &&
    /^[a-z0-9_-]+$/.test(username)
  );
}

function validatePassword(password: unknown): password is string {
  return (
    typeof password === 'string' &&
    password.length >= 6 &&
    password.length <= 255
  );
}

export default router;
