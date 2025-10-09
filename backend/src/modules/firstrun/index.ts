import { Database } from "bun:sqlite";
import { DATA_DIR } from "#modules/config";
// @ts-expect-error for some reason it's giving ts 2307 despite the module declaration
import firstrun from "./firstrun.sql" with { type: "text" };

export class FirstRunConfiguration {
  id: number = 0;
  database_url: string;
  app_name: string;
  admin_username: string;
  admin_password: string;
  registration_enabled: boolean = false;

  constructor(
    p_database_url: string,
    p_app_name = "RemoteAdminPlus",
    p_admin_username: string,
    p_admin_password: string,
  ) {
    this.database_url = p_database_url;
    this.app_name = p_app_name;
    this.admin_username = p_admin_username;
    this.admin_password = p_admin_password;
  }
}

export const configDB = new Database(`${DATA_DIR}/config.db`, {
  strict: true,
});

const dataExists = configDB.query<{ "count(*)": number }, []>(
  "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='data';",
);

if (dataExists.get()!["count(*)"] === 0) {
  console.log("Migrating database...");
  configDB.run(firstrun);
}

const dataTableQuery = configDB
  .query("SELECT * FROM data;")
  .as(FirstRunConfiguration);

export let firstRunConfig = dataTableQuery.get();

export const setFirstRunConfig = (config: FirstRunConfiguration | null) => {
  firstRunConfig = config;
};
