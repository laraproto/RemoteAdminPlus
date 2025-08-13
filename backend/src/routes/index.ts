import { Hono } from "hono";
import { trpcRouter } from "./trpc";

const router = new Hono().basePath("/api");

router.route("", trpcRouter);

export default router;
