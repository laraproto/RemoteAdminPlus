import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/modules/db/migrations",
  schema: "./src/modules/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: process.env.DATABASE_HINT.startsWith("postgres://")
    ? {
        url: process.env.DATABASE_HINT,
      }
    : {
        host: process.env.DATABASE_HINT,
        database: "remoteadminplus",
      },
});
