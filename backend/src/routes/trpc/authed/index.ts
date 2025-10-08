import { invalidateSession } from "#modules/auth/index";
import { authedProcedure, router } from "#modules/trpc/index";
//import { z } from "zod";

const authedRouter = router({
  me: authedProcedure.query(({ ctx }) => ctx.user),
  logout: authedProcedure.mutation(async ({ ctx }) =>
    invalidateSession(ctx.session.id),
  ),
});

export default authedRouter;
