// Handles all registration

import { Elysia, t } from "elysia";

import * as auth from "@modules/auth";
import { db, users } from "@modules/db";
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
    async ({
      body: { username, password, panelContext },
      cookie: { session },
      status,
      redirect,
    }) => {
      if (!validateUsername(username)) {
        return status(400, {
          message:
            "Invalid username (min 3, max 31 characters, alphanumeric only)",
        });
      }
      if (!validatePassword(password)) {
        return status(400, {
          message: "Invalid password (min 6, max 255 characters)",
        });
      }

      const result = await db.query.users.findFirst({
        where: (users, { eq, or }) =>
          or(eq(users.username, username), eq(users.email, username)),
      });

      if (!result) {
        return status(400, {
          message: "Incorrect username (or email) or password",
        });
      }

      const validPassword = await Bun.password.verify(
        password,
        result.password,
      );
      if (!validPassword) {
        return status(400, {
          message: "Incorrect username (or email) or password",
        });
      }

      const sessionToken = auth.generateSessionToken();
      const sessionData = await auth.createSession(sessionToken, result.id, {
        twoFactorVerified: false,
      });
      session.expires = sessionData.expiresAt;
      session.value = sessionToken;

      if (result.totpSecret)
        return redirect(`${DOMAIN}/auth/mfa?panelContext=${panelContext}`, 302);

      return redirect(
        `${DOMAIN}/auth/callback?panelContext=${panelContext}`,
        302,
      );
    },
    {
      body: t.Object({
        username: t.String({ minLength: 3, maxLength: 31 }),
        password: t.String({ minLength: 6, maxLength: 255 }),
        panelContext: t.Optional(t.Number()),
      }),
      response: {
        302: t.Undefined(),
        400: t.Object({
          message: t.String(),
        }),
      },
    },
  )
  .post(
    "/register",
    async ({
      body: { username, password, email, panelContext },
      cookie: { session },
      status,
      redirect,
    }) => {
      if (!validateUsername(username)) {
        return status(400, {
          message:
            "Invalid username (min 3, max 31 characters, alphanumeric only)",
        });
      }
      if (!validatePassword(password)) {
        return status(400, {
          message: "Invalid password (min 6, max 255 characters)",
        });
      }

      const passwordHash = await Bun.password.hash(password);

      try {
        const newUser = await db
          .insert(users)
          .values({
            username,
            password: passwordHash,
            email,
          })
          .returning({ insertedId: users.id });

        const sessionToken = auth.generateSessionToken();
        const sessionData = await auth.createSession(
          sessionToken,
          newUser[0].insertedId,
          { twoFactorVerified: false },
        );
        session.value = sessionToken;
        session.expires = sessionData.expiresAt;
      } catch (e) {
        console.log(e);
        return status(400, { message: "Something went wrong" });
      }

      return redirect(
        `${DOMAIN}/auth/callback?panelContext=${panelContext}`,
        302,
      );
    },
    {
      body: t.Object({
        username: t.String({ minLength: 12, maxLength: 31 }),
        password: t.String({ minLength: 6, maxLength: 255 }),
        email: t.String({ format: "email", minLength: 3, maxLength: 255 }),
        panelContext: t.Optional(t.Number()),
      }),
      response: {
        302: t.Undefined(),
        400: t.Object({
          message: t.String(),
        }),
      },
    },
  ).get('/register', () => "What");

function validateUsername(username: unknown): username is string {
  return (
    typeof username === "string" &&
    username.length >= 12 &&
    username.length <= 31 &&
    /^[a-z0-9_-]+$/.test(username)
  );
}

function validatePassword(password: unknown): password is string {
  return (
    typeof password === "string" &&
    password.length >= 6 &&
    password.length <= 255
  );
}

export default router;
