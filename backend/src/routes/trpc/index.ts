import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@modules/trpc";

export const trpcRouter = new Hono();

trpcRouter.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
  }),
);
