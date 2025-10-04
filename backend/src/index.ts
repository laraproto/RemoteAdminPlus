import { HOSTNAME, PORT } from "#modules/config";
import { Hono } from "hono";
import "#modules/firstrun";
import { firstRunConfig } from "#modules/firstrun";
import firstRunRoutes from "#routes/firstrun";

const app = new Hono();

if (firstRunConfig) {
  const routes = await import("./routes");
  app.route("/", routes.default);
} else {
  app.route("/", firstRunRoutes);
}

export default {
  host: HOSTNAME,
  port: PORT,
  fetch: app.fetch,
};
