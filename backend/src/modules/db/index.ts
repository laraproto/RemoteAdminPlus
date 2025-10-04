import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { DATABASE_URL } from "#modules/config";

export const db = drizzle(DATABASE_URL, { schema });

export * as schema from "./schema";
