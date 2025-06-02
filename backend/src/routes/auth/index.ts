import { Elysia } from "elysia";
import login from "./login";

export const auth = new Elysia({ prefix: "/auth", detail: { hide: true } }).use(
  login,
);
