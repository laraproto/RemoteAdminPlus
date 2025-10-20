import { firstRunConfig } from "#modules/firstrun";
import { registrationProcedure, router } from "#modules/trpc/index";
import { db, schema } from "#modules/db";
import * as auth from "#modules/auth";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const registrationRouter = router({
  register: registrationProcedure
    .input(
      z.object({
        username: z.string().min(3).max(18),
        password: z.string().min(8).max(128),
        email: z.email().min(8).max(128).nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!firstRunConfig?.canRegister) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Open registration is not enabled",
        });
      }

      const existingUser = await db.query.user.findFirst({
        where: (user, { eq, or }) =>
          or(eq(user.username, input.username), eq(user.email, input.email)),
      });

      if (existingUser) {
        return {
          success: false,
          message: "Username or email already in use",
        };
      }

      const password_hashed = await Bun.password.hash(input.password);

      try {
        const newUser = await db
          .insert(schema.user)
          .values({
            username: input.username,
            password: password_hashed,
            email: input.email,
          })
          .returning({
            uuid: schema.user.uuid,
          });

        // Make typescript happy
        if (!newUser[0]) {
          return;
        }

        auth.setSessionUser(ctx.session.id, newUser[0].uuid);

        return {
          success: true,
          redirect: "/panel",
          message: "Registration success, you should be getting redirected now",
        };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to create user, this should never happen, yet it did somehow",
          cause: err,
        });
      }
    }),
  login: registrationProcedure
    .input(
      z.object({
        username: z.string().min(3).max(128),
        password: z.string().min(8).max(128),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await db.query.user.findFirst({
        where: (user, { or, eq }) =>
          or(eq(user.username, input.username), eq(user.email, input.username)),
      });

      if (!user) {
        return {
          success: false,
          message: "Invalid username or password",
        };
      }

      const passwordMatch = await Bun.password.verify(
        input.password,
        user.password,
      );

      console.log(passwordMatch);

      if (!passwordMatch) {
        return {
          success: false,
          message: "Invalid username or password",
        };
      }

      auth.setSessionUser(ctx.session.id, user.uuid);

      return {
        success: true,
        redirect: "/panel",
        message: "Login success, you should be getting redirected now",
      };
    }),
});

export default registrationRouter;
