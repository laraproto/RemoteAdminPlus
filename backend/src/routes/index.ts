import { Hono } from "hono";
import { cors } from "hono/cors";
import { appRouter } from "#routes/trpc";
import { trpcServer } from "@hono/trpc-server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import sessionMiddleware from "#middleware/sessionMiddleware";
import { orpcRouter } from "#modules/openapi";

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

const orpcHandler = new OpenAPIHandler(orpcRouter, {
  interceptors: [
    onError(async (error) => {
      console.error("OpenAPI Handler Error:", error);
    }),
  ],
});

router.use("/rpc/*", sessionMiddleware, async (c, next) => {
  const { matched, response } = await orpcHandler.handle(c.req.raw, {
    prefix: "/api/rpc",
    context: {
      session: c.get("session")!,
      user: c.get("user")!,
      getSessionToken: () => c.req.header("Authorization"),
    }, // Provide initial context if needed
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

export default router;
