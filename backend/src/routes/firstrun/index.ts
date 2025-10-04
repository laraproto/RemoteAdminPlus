import { Hono } from "hono";

const router = new Hono().basePath("/api/installer");

router.get("/", (c) => c.text("true"));

export default router;
