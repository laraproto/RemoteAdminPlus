import {
  serial,
  pgTable,
  varchar,
  integer,
  timestamp,
  jsonb,
  primaryKey,
  bigint,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const timeData = {
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
};

//Developing this as a SaaS will make it easier to demo it, but it increases the scope significantly, I guess this is where I'm getting most of my 30 hours from
export const panels = pgTable("panels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  description: varchar("description", { length: 8000 }),
  ...timeData,
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  ...timeData,
});

export const usersToPanels = pgTable(
  "users_to_panels",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    panelId: integer("panel_id")
      .notNull()
      .references(() => panels.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.panelId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
  usersToPanels: many(usersToPanels),
  connections: many(connections),
  bans: many(playerBans, { relationName: "banAuthor" }),
  warns: many(playerWarns, { relationName: "warnAuthor" }),
}));

export const panelsRelations = relations(panels, ({ many }) => ({
  usersToPanels: many(usersToPanels),
  panelGroups: many(panelGroups),
  gameGroups: many(gameGroups),
  bans: many(playerBans, { relationName: "banPanel" }),
  warns: many(playerWarns, { relationName: "warnPanel" }),
}));

export const usersToPanelsRelations = relations(usersToPanels, ({ one }) => ({
  panel: one(panels, {
    fields: [usersToPanels.panelId],
    references: [panels.id],
  }),
  user: one(users, {
    fields: [usersToPanels.userId],
    references: [users.id],
  }),
}));

//anything that supports oauth, we don't discriminate, you can log in using google into the panel for all I care
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 255 }).notNull(),
  data: jsonb("data").notNull(),
  ...timeData,
});

export const panelGroups = pgTable("panelGroups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  // Only shown on panel to describe what group is for
  description: varchar("description", { length: 400 }),
  panelId: integer("panel_id")
    .notNull()
    .references(() => panels.id, { onDelete: "cascade" }),
  gameGroupId: integer("game_group_id")
    .notNull()
    .references(() => gameGroups.id, { onDelete: "cascade" }),
  permissions: bigint({ mode: "bigint" }),
  ...timeData,
});

export const gameGroups = pgTable("gameGroups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  // Only shown on panel to describe what group is for
  description: varchar("description", { length: 400 }),
  panelId: integer("panel_id")
    .notNull()
    .references(() => panels.id, { onDelete: "cascade" }),
  // While SCP: Secret Laboratory does use bitwise permissions it will be wise to compute it as needed as I don't know if they are necessarily stable or if they will reuse indexes
  permissions: jsonb().$type<string[]>(),
  ...timeData,
});

export const gameGroupsRelations = relations(gameGroups, ({ many }) => ({
  panelGroups: many(panelGroups),
}));

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  // this is a platform id, sl at the time of writing this comment supports both steam and discord auth, it's better to genericize the name
  platformId: varchar("platform_id", { length: 256 }).unique().notNull(),
  doNotTrack: boolean("do_not_track").notNull().default(true), // if a player's do not track has not been picked up, assume yes for privacy reasons
  ...timeData, // service information, if data ever needs to be pruned at least this will tell of us any data that we can remove easily
});

// For the purpose of lowering data storage burden rather than copying the entire player entry over and over again for each server, statistics are stored in their own table per panel, this could also allow for the possibility of linking bans, warns, etc. between allied servers
export const playerStatistics = pgTable("playerStatistics", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  panelId: integer("panel_id")
    .notNull()
    .references(() => panels.id, { onDelete: "cascade" }),
  hoursPlayed: integer("hours_played").notNull().default(0),
  hoursThisWeek: integer("hours_this_week").notNull().default(0),
  ...timeData,
});

export const bansEnum = pgEnum("banType", ["temporary", "permanent"]);

export const playerBans = pgTable("playerBans", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  victimId: integer("victim_id").notNull(),
  panelId: integer("panel_id").notNull(),
  reason: varchar("reason", { length: 1000 }),
  type: bansEnum().notNull(),
  expiresAt: timestamp("expires_at").notNull().defaultNow(),
});

export const warnsEnum = pgEnum("warnType", ["strike", "minor", "major"]);

export const playerWarns = pgTable("playerWarns", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  victimId: integer("victim_id").notNull(),
  panelId: integer("panel_id").notNull(),
  reason: varchar("reason", { length: 1000 }),
  type: warnsEnum().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const playerStatisticsRelations = relations(
  playerStatistics,
  ({ many }) => ({
    bans: many(playerBans, { relationName: "banVictim" }),
    warns: many(playerWarns, { relationName: "warnVictim" }),
  }),
);

export const playerBansRelations = relations(playerBans, ({ one }) => ({
  banAuthor: one(users, {
    fields: [playerBans.authorId],
    references: [users.id],
  }),
  banPanel: one(panels, {
    fields: [playerBans.panelId],
    references: [panels.id],
  }),
  banVictim: one(players, {
    fields: [playerBans.victimId],
    references: [players.id],
  }),
}));

export const playerWarnsRelations = relations(playerWarns, ({ one }) => ({
  warnAuthor: one(users, {
    fields: [playerWarns.authorId],
    references: [users.id],
  }),
  warnPanel: one(panels, {
    fields: [playerWarns.panelId],
    references: [panels.id],
  }),
  warnVictim: one(players, {
    fields: [playerWarns.victimId],
    references: [players.id],
  }),
}));
