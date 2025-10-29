import { HOSTNAME, NODE_ENV, PORT } from "#modules/config";
import { Hono } from "hono";
import "#modules/scheduler";
import "#modules/firstrun";
import "#modules/openapi";
import routes from "#routes/index";
import { appRouter } from "./routes/trpc";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = new Hono();

if (NODE_ENV === "development") {
  const { renderTrpcPanel } = await import("trpc-ui");

  app.all("/panel", (c) =>
    c.html(
      renderTrpcPanel(appRouter, {
        url: "/api/trpc",
        transformer: "superjson",
        meta: {
          title: "bruh",
          description: "bruh",
        },
      }),
    ),
  );
}

app.route("/", routes);

export default {
  host: HOSTNAME,
  port: PORT,
  fetch: app.fetch,
};
