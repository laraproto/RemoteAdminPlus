import { invalidateSession } from "#modules/auth/index";
import { authedProcedure, router } from "#modules/trpc/index";
//import { z } from "zod";

const authedRouter = router({
  me: authedProcedure.query(({ ctx }) => ctx.user),
  logout: authedProcedure.mutation(async ({ ctx }) => {
    const result = await invalidateSession(ctx.session.id);
    if (result) {
      return { success: result, redirect: "/" };
    } else {
      return { success: result };
    }
  }),
});

export default authedRouter;
