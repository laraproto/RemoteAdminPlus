import { firstRunConfig } from "#modules/firstrun/index.js";
import { registrationProcedure, router } from "#modules/trpc/index";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const registrationRouter = router({
  register: registrationProcedure
    .input(
      z.object({
        username: z.string().min(3).max(32),
        password: z.string().min(8).max(128),
        email: z.email().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!firstRunConfig?.registration_enabled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Open registration is not enabled",
        });
      }

      console.log(input);
    }),
});

export default registrationRouter;
