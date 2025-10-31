import { Hono } from "hono";
import { cors } from "hono/cors";
import { appRouter } from "#routes/trpc";
import { trpcServer } from "@hono/trpc-server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import sessionMiddleware from "#middleware/sessionMiddleware";
import { orpcRouter, openAPISpec } from "#modules/openapi";

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
      server: c.get("server"),
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
      server: c.get("server")!,
      getSessionToken: () => c.req.header("Authorization"),
    }, // Provide initial context if needed
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

router.get("/spec.json", (c) => {
  return c.json(openAPISpec);
});

router.get("/panel", (c) => {
  return c.html(`
    <!doctype html>
        <html>
          <head>
            <title>My Client</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" type="image/svg+xml" href="https://orpc.unnoq.com/icon.svg" />
          </head>
          <body>
            <div id="app"></div>

            <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
            <script>
              Scalar.createApiReference('#app', {
                url: '/api/spec.json',
                authentication: {
                  securitySchemes: {
                    bearerAuth: {
                      token: 'default-token',
                    },
                  },
                },
              })
            </script>
          </body>
        </html>
        `);
});

export default router;
