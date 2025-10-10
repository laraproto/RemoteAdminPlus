import { firstRunConfig } from "#modules/firstrun";
import { registrationProcedure, router } from "#modules/trpc/index";
import { db } from "#modules/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const registrationRouter = router({
  register: registrationProcedure
    .input(
      z.object({
        username: z.string().min(3).max(32),
        password: z.string().min(8).max(128),
        email: z.email().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!firstRunConfig?.registration_enabled) {
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
      console.log(input);
    }),
});

export default registrationRouter;
