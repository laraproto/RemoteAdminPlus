import * as auth from "#modules/auth";
import { firstRunConfig } from "#modules/firstrun";
import { registrationProcedure, router } from "#modules/trpc/index";
import { db, schema } from "#modules/db";
import { z } from "zod";
import { usernameRegex } from "@remoteadminplus/shared/common/user";

const registrationRouter = router({
  register: registrationProcedure
    .input(
      z.object({
        username: z.string().min(3).max(18).regex(usernameRegex).toLowerCase(),
        password: z.string().min(8).max(128),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!firstRunConfig?.canRegister) {
        return {
          success: false,
          message: "Registrations are disabled",
        };
      }

      const existingUser = await db.query.user.findFirst({
        where: (user, { eq, or }) => or(eq(user.username, input.username)),
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
          })
          .returning({
            uuid: schema.user.uuid,
          });

        // Make typescript happy
        if (!newUser[0]) {
          return {
            success: false,
            message: "An error occurred during registration",
          };
        }

        auth.setSessionUser(ctx.session.id, newUser[0].uuid);

        return {
          success: true,
          redirect: "/panel",
          message: "Registration success, you should be getting redirected now",
        };
      } catch (err) {
        console.error("Error during user registration:", err);
        return {
          success: false,
          message: "An error occurred during registration",
        };
      }
    }),
  login: registrationProcedure
    .input(
      z.object({
        username: z.string().min(3).max(128).toLowerCase(),
        password: z.string().min(8).max(128),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await db.query.user.findFirst({
        where: (user, { or, eq }) => or(eq(user.username, input.username)),
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
