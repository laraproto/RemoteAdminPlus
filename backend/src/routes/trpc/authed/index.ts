import { invalidateSession } from "#modules/auth/index.ts";
import { authedProcedure, router } from "#modules/trpc/index.ts";
//import { z } from "zod";

const authedRouter = router({
  me: authedProcedure.query(({ ctx }) => ctx.user),
  logout: authedProcedure.mutation(async ({ ctx }) =>
    invalidateSession(ctx.session.id),
  ),
});

export default authedRouter;
