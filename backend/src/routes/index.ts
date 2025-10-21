import { Hono } from "hono";
import { appRouter } from "#routes/trpc";
import { trpcServer } from "@hono/trpc-server";
import sessionMiddleware from "#middleware/sessionMiddleware";

const router = new Hono().basePath("/api");

router.use(
  "/trpc/*",
  sessionMiddleware,
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext: (opts, c) => ({
      session: c.get("session"),
      user: c.get("user"),
      getSessionToken: () => c.req.header("Authorization"),
    }),
  }),
);

export default router;
