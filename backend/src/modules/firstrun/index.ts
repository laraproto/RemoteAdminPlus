import { Database } from "bun:sqlite";
import { DATA_DIR } from "#modules/config.ts";
// @ts-expect-error for some reason it's giving ts 2307 despite the module declaration
import firstrun from "./firstrun.sql" with { type: "text" };

class FirstRunConfiguration {
  database_url: string;

  constructor(p_database_url: string) {
    this.database_url = p_database_url;
  }
}

const db = new Database(`${DATA_DIR}/config.db`, {
  strict: true,
});

const dataExists = db.query<{ "count(*)": number }, []>(
  "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='data';",
);

if (dataExists.get()!["count(*)"] === 0) {
  console.log("Migrating database...");
  db.run(firstrun);
}

const dataTableQuery = db
  .query("SELECT * FROM data;")
  .as(FirstRunConfiguration);

export const firstRunConfig = dataTableQuery.get();
