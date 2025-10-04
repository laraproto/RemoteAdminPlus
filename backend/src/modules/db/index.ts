import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { firstRunConfig } from "#modules/firstrun";

if (!firstRunConfig) {
  throw new Error(
    "First run configuration not found. Please complete the first run setup.",
  );
}

export const db = drizzle(firstRunConfig.database_url, { schema });

export * as schema from "./schema";
