import { DATA_DIR, DATABASE_HINT } from "#modules/config.ts";
import { Hono } from "hono";

const router = new Hono().basePath("/api/installer");

router.get("/", (c) => {
  return c.json({
    available: true,
    database_hint: DATABASE_HINT,
    data_dir: DATA_DIR,
  });
});

export default router;
