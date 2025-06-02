import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { DATABASE_URL } from "@modules/config";

export const db = drizzle(DATABASE_URL, { schema });

export * from "./schema";
