import { Hono } from "hono";
import { cors } from "hono/cors";
import { appRouter } from "#routes/trpc";
import { trpcServer } from "@hono/trpc-server";
import sessionMiddleware from "#middleware/sessionMiddleware";

const router = new Hono().basePath("/api");

router.use(
  "/trpc/*",
  cors({
    origin: "",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
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
