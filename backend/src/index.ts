import app from "@modules/app";
import { PORT, HOSTNAME } from "@modules/config";

app.listen({
  port: PORT,
  hostname: HOSTNAME,
});

console.log(
  `Backend is running at ${app.server?.hostname}:${app.server?.port}`,
);
