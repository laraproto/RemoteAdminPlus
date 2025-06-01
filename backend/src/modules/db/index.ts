import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { DATABASE_URL } from "@modules/config";

const db = drizzle(DATABASE_URL, { schema });
