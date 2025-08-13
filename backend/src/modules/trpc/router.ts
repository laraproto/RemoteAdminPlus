import { publicProcedure, router } from "./index";

export const appRouter = router({
  hello: publicProcedure.query(({ ctx }) => {
    const { user } = ctx;
    const userRedacted = {
      id: user.id,
      username: user.username,
      emailVerified: user.emailVerified,
    };
    return `Hello ${JSON.stringify(userRedacted)}`;
  }),
});

export type AppRouter = typeof appRouter;
