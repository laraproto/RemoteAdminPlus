import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { firstRunConfig } from "#modules/firstrun";
import postgres from "postgres";
import { migrate } from "./migrator";

export let db: ReturnType<typeof drizzle<typeof schema>>;

let client: ReturnType<typeof postgres> | undefined = undefined;

const buildDatabaseClient = () => {
  if (firstRunConfig?.database_url.startsWith("postgres://")) {
    return postgres(firstRunConfig?.database_url);
  } else {
    // Assume unix socket, postgres.js has no native connection string replacement for sockets
    return postgres({
      host: firstRunConfig?.database_url,
      database: "remoteadminplus",
    });
  }
};

// @ts-expect-error This is stupid but rather than use ! or ? everywhere we'll just assume db exists, since after first run it should
db = (() => {
  client = buildDatabaseClient();

  if (!firstRunConfig || !client) {
    console.log(
      "First run configuration is unavailable, database will work post restart",
    );
    return;
  }

  const db = drizzle({ client, schema });

  migrate(db);

  return db;
})();

export const reconnectDatabase = () => {
  try {
    client = buildDatabaseClient();

    if (client === undefined) {
      console.log("sql client not created");
      return;
    }

    db = drizzle({ client, schema });
  } catch (err) {
    console.log(
      "Connection attempted but failed due to missing or incorrect first run config",
      err,
    );
  }
};

export * as schema from "./schema";
