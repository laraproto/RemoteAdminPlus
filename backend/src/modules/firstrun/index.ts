import { Database } from "bun:sqlite";
import { DATA_DIR } from "#modules/config";
// @ts-expect-error for some reason it's giving ts 2307 despite the module declaration
import firstrun from "./firstrun.sql" with { type: "text" };

export class FirstRunConfiguration {
  id: number = 0;
  database_url: string;
  url: string;
  app_name: string;
  admin_username: string;
  admin_password: string;
  registration_enabled: number = 0;

  get canRegister() {
    return this.registration_enabled === 1;
  }

  set canRegister(value: boolean) {
    this.registration_enabled = value ? 1 : 0;
  }

  constructor(
    p_database_url: string,
    p_app_name = "RemoteAdminPlus",
    p_admin_username: string,
    p_admin_password: string,
    p_url: string,
  ) {
    this.database_url = p_database_url;
    this.app_name = p_app_name;
    this.admin_username = p_admin_username;
    this.admin_password = p_admin_password;
    this.url = p_url;
  }

  update() {
    const updateQuery = configDB.query(
      "UPDATE data SET database_url = $database_url, app_name = $app_name, url = $url, registration_enabled = $registration_enabled;",
    );

    updateQuery.get({
      database_url: firstRunConfig!.database_url,
      url: firstRunConfig!.url,
      app_name: firstRunConfig!.app_name,
      registration_enabled: firstRunConfig!.canRegister ? 1 : 0,
    });
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
