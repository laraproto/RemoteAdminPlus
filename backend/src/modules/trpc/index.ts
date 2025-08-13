import { Session } from "@modules/auth";
import { users } from "@modules/db";
import { initTRPC } from "@trpc/server";

const t = initTRPC
  .context<{
    session: Session;
    user: typeof users.$inferSelect;
  }>()
  .create();

export const router = t.router;
export const publicProcedure = t.procedure;

export * from "./router";
