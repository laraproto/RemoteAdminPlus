import { Elysia } from "elysia";
import { query } from "@routes/panel/query";

export const panel = new Elysia({ prefix: "/panel" }).use(query);