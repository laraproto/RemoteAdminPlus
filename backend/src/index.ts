import { HOSTNAME, PORT } from "#modules/config";
import { Hono } from "hono";
import "#modules/scheduler";
import "#modules/firstrun";
import routes from "#routes/index";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = new Hono();

app.route("/", routes);

export default {
  host: HOSTNAME,
  port: PORT,
  fetch: app.fetch,
};
