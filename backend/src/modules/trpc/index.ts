import type { Session } from "#modules/auth";
import type { UserSelectMinimal } from "#modules/db/schema";
import { initTRPC, TRPCError } from "@trpc/server";

const t = initTRPC
  .context<{
    session: Session;
    user: UserSelectMinimal | null;
  }>()
  .create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const authedProcedure = publicProcedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx,
  });
});
