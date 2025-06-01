import {
  serial,
  pgTable,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const timeData = {
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  ...timeData,
});

//anything that supports oauth, we don't discriminate, you can log in using google into the panel for all i care
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});
