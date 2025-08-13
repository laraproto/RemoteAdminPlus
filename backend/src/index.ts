import { HOSTNAME, PORT } from "@modules/config";
import { Hono } from "hono";
import router from "./routes";

const app = new Hono();

app.route("/", router);

export default {
  host: HOSTNAME,
  port: PORT,
  fetch: app.fetch,
};
