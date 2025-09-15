import {
  authedProcedure,
  publicProcedure,
  router,
} from "#modules/trpc/index.ts";
import { z } from "zod";

const authedRouter = router({
  me: authedProcedure.query(({ ctx }) => ctx.user),
});

export const appRouter = router({
  hello: publicProcedure.input(z.string().nullish()).query(({ input, ctx }) => {
    return `Hello ${input ?? "world"}! Your session is ${JSON.stringify(ctx.session)}`;
  }),
  authed: authedRouter,
});

export type AppRouter = typeof appRouter;
