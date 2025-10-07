import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { firstRunConfig } from "#modules/firstrun";

export let db: ReturnType<typeof drizzle<typeof schema>>;

// @ts-expect-error This is stupid but rather than use ! or ? everywhere we'll just assume db exists, since after first run it should
db = (() => {
  if (!firstRunConfig) {
    console.log(
      "First run configuration is unavailable, database will work post restart",
    );
    return;
  }

  return drizzle(firstRunConfig.database_url, { schema });
})();

export const reconnectDatabase = () => {
  try {
    db = drizzle(firstRunConfig!.database_url, { schema });
  } catch (err) {
    console.log("Connection attempted without first run configuration", err);
  }
};

export * as schema from "./schema";
