import { publicProcedure, router } from "#modules/trpc/index.ts";
import { z } from "zod";
import authedRouter from "#routes/trpc/authed";
import firstrunRouter from "#routes/trpc/firstrun";

export const appRouter = router({
  hello: publicProcedure.input(z.string().nullish()).query(({ input, ctx }) => {
    return `Hello ${input ?? "world"}! Your session is ${JSON.stringify(ctx.session)}`;
  }),
  authed: authedRouter,
  firstrun: firstrunRouter,
});

export type AppRouter = typeof appRouter;
