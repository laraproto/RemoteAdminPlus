import { adminProcedure, router } from "#modules/trpc/index";
import * as auth from "#modules/auth/index";
import { z } from "zod";

const adminRouter = router({
  createApiKey: adminProcedure
    .input(
      z.object({
        description: z.string().max(255),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const serverToken = auth.generateSessionToken();

      await auth.createServerApiKey(
        serverToken,
        ctx.user.uuid,
        input.description,
      );

      return {
        success: true,
        token: serverToken,
        message:
          "Server API Key created, save it now as it won't be shown again",
      };
    }),
});

export default adminRouter;
