import { publicProcedure, router } from "#modules/trpc";
import { z } from "zod";
import authedRouter from "#routes/trpc/authed";
import firstrunRouter from "#routes/trpc/firstrun";
import registrationRouter from "#routes/trpc/registration";
import { firstRunConfig } from "#modules/firstrun";

export const appRouter = router({
  hello: publicProcedure.input(z.string().nullish()).query(({ input, ctx }) => {
    return `Hello ${input ?? "world"}! Your session is ${JSON.stringify(ctx.session)}`;
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
