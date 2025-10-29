import { publicProcedure, router } from "#modules/trpc";
import * as auth from "#modules/auth";
import { z } from "zod";
import authedRouter from "#routes/trpc/authed";
import firstrunRouter from "#routes/trpc/firstrun";
import registrationRouter from "#routes/trpc/registration";
import { firstRunConfig } from "#modules/firstrun";

export const appRouter = router({
  hello: publicProcedure
    .meta({
      route: {
        tags: ["internal"],
      },
    })
    .input(z.string().nullish())
    .query(({ input, ctx }) => {
      return `Hello ${input ?? "world"}! Your session is ${JSON.stringify(ctx.session)}`;
    }),
  session: publicProcedure
    .meta({
      route: {
        tags: ["internal"],
      },
    })
    .mutation(async ({ ctx }) => {
      const authHeader = ctx.getSessionToken();
      if (authHeader && ctx.session) {
        return {
          valid: true,
          session: ctx.session,
          authToken: authHeader,
        };
      }

      const sessionToken = auth.generateSessionToken();
      const session = await auth.createSession(sessionToken);
      return {
        valid: false,
        session,
        authToken: sessionToken,
      };
    }),
  configuration: publicProcedure.query(() => {
    return {
      appName: firstRunConfig?.app_name || "RemoteAdminPlus",
      registrationEnabled: firstRunConfig?.canRegister ?? false,
    };
  }),
  authed: authedRouter,
  firstrun: firstrunRouter,
  registration: registrationRouter,
});

export type AppRouter = typeof appRouter;
