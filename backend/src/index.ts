import { HOSTNAME, PORT } from "#modules/config";
import { Hono } from "hono";
import "#modules/firstrun";
import routes from "#routes/index";

const app = new Hono();

app.route("/", routes);

export default {
  host: HOSTNAME,
  port: PORT,
  fetch: app.fetch,
};
