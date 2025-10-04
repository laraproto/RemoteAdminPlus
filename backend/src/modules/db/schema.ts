import {
  pgTable,
  varchar,
  timestamp,
  jsonb,
  primaryKey,
  bigint,
  boolean,
  pgEnum,
  uuid,
  text,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";

const timeData = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
};

export const user = pgTable("users", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 512 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  totpSecret: varchar("totp_secret", { length: 64 }),
  flags: bigint({ mode: "bigint" })
    .notNull()
    .default(sql`1::bigint`),
  groupId: uuid("group_id").references(() => panelGroups.uuid, {
    onDelete: "set null",
  }),
  ...timeData,
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").references(() => user.uuid, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  ...timeData,
});

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.uuid],
  }),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  connections: many(connections),
  bans: many(playerBans, { relationName: "banAuthor" }),
  warns: many(playerWarns, { relationName: "warnAuthor" }),
  emailVerifications: many(emailVerifications),
  passwordResets: many(passwordResets),
  player: many(player),
  group: one(panelGroups, {
    fields: [user.groupId],
    references: [panelGroups.uuid],
  }),
}));

//anything that supports oauth, we don't discriminate, you can log in using google into the panel for all I care
export const connections = pgTable("connections", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.uuid, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 255 }).notNull(),
  data: jsonb("data").notNull(),
  ...timeData,
});

export const connectionsRelations = relations(connections, ({ one }) => ({
  user: one(user, {
    fields: [connections.userId],
    references: [user.uuid],
  }),
}));

export const panelGroups = pgTable("panelGroups", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 80 }).notNull(),
  // Only shown on panel to describe what group is for
  description: varchar("description", { length: 400 }),
  gameGroupId: uuid("game_group_id")
    .notNull()
    .references(() => gameGroups.uuid, { onDelete: "cascade" }),
  permissions: bigint({ mode: "bigint" })
    .notNull()
    .default(sql`1::bigint`),
  ...timeData,
});

export const panelGroupsToInheritedGroups = pgTable(
  "panelGroupsInheritedGroups",
  {
    inheritingGroupId: uuid("owning_group")
      .notNull()
      .references(() => panelGroups.uuid, { onDelete: "cascade" }),
    inheritedGroupId: uuid("owned_group")
      .notNull()
      .references(() => panelGroups.uuid, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.inheritedGroupId, t.inheritingGroupId] })],
);

export const panelGroupsToInheritedGroupsRelations = relations(
  panelGroupsToInheritedGroups,
  ({ one }) => ({
    inheritingGroup: one(panelGroups, {
      fields: [panelGroupsToInheritedGroups.inheritingGroupId],
      references: [panelGroups.uuid],
      relationName: "owningGroup",
    }),
    inheritedGroup: one(panelGroups, {
      fields: [panelGroupsToInheritedGroups.inheritedGroupId],
      references: [panelGroups.uuid],
      relationName: "ownedGroup",
    }),
  }),
);

export const panelGroupsRelations = relations(panelGroups, ({ one, many }) => ({
  inheritingGroupsToInheritedGroups: many(panelGroupsToInheritedGroups, {
    relationName: "owningGroup",
  }),
  inheritedGroupsToInheritingGroups: many(panelGroupsToInheritedGroups, {
    relationName: "ownedGroup",
  }),
  gameGroup: one(gameGroups, {
    fields: [panelGroups.gameGroupId],
    references: [gameGroups.uuid],
  }),
  users: many(user),
}));

export const gameGroups = pgTable("gameGroups", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 80 }).notNull(),
  // Only shown on panel to describe what group is for
  description: varchar("description", { length: 400 }),
  // While SCP: Secret Laboratory does use bitwise permissions it will be wise to compute it as needed as I don't know if they are necessarily stable or if they will reuse indexes
  permissions: jsonb().$type<string[]>(),
  ...timeData,
});

export const gameGroupsToInheritedGroups = pgTable(
  "gameGroupsInheritedGroups",
  {
    inheritingGroupId: uuid("owning_group_id")
      .notNull()
      .references(() => gameGroups.uuid, { onDelete: "cascade" }),
    inheritedGroupId: uuid("owned_group_id")
      .notNull()
      .references(() => gameGroups.uuid, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.inheritedGroupId, t.inheritingGroupId] })],
);

export const gameGroupsToInheritedGroupsRelations = relations(
  gameGroupsToInheritedGroups,
  ({ one }) => ({
    inheritingGroup: one(gameGroups, {
      fields: [gameGroupsToInheritedGroups.inheritingGroupId],
      references: [gameGroups.uuid],
      relationName: "owningGroup",
    }),
    inheritedGroup: one(gameGroups, {
      fields: [gameGroupsToInheritedGroups.inheritedGroupId],
      references: [gameGroups.uuid],
      relationName: "ownedGroup",
    }),
  }),
);

export const gameGroupsRelations = relations(gameGroups, ({ many }) => ({
  panelGroups: many(panelGroups),
  inheritingGroupsToInheritedGroups: many(gameGroupsToInheritedGroups, {
    relationName: "owningGroup",
  }),
  inheritedGroupsToInheritingGroups: many(gameGroupsToInheritedGroups, {
    relationName: "ownedGroup",
  }),
}));

export const player = pgTable("players", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => user.uuid, { onDelete: "set null" }),
  name: varchar("name", { length: 80 }).notNull(),
  // this is a platform id, sl at the time of writing this comment supports both steam and discord auth, it's better to genericize the name
  platformId: varchar("platform_id", { length: 256 }).unique().notNull(),
  doNotTrack: boolean("do_not_track").notNull().default(true), // if a player's do not track has not been picked up, assume yes for privacy reasons
  ...timeData, // service information, if data ever needs to be pruned at least this will tell of us any data that we can remove easily
});

export const playerRelations = relations(player, ({ one }) => ({
  user: one(user, {
    fields: [player.userId],
    references: [user.uuid],
  }),
}));

// For the purpose of lowering data storage burden rather than copying the entire player entry over and over again for each server, statistics are stored in their own table per panel, this could also allow for the possibility of linking bans, warns, etc. between allied servers
export const playerStatistics = pgTable("playerStatistics", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => player.uuid, { onDelete: "cascade" }),
  timePlayed: bigint("time_played", { mode: "bigint" })
    .notNull()
    .default(sql`0::bigint`),
  timeThisWeek: bigint("time_this_week", { mode: "bigint" })
    .notNull()
    .default(sql`0::bigint`),
  ...timeData,
});

export const bansEnum = pgEnum("banType", ["temporary", "permanent"]);

export const playerBans = pgTable("playerBans", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").notNull(),
  victimId: uuid("victim_id")
    .references(() => player.uuid, { onDelete: "cascade" })
    .notNull(),
  reason: varchar("reason", { length: 1000 }),
  type: bansEnum().notNull(),
  expiresAt: timestamp("expires_at").notNull().defaultNow(),
});

export const warnsEnum = pgEnum("warnType", [
  "strike",
  "minor",
  "major",
  "tempminor",
  "tempmajor",
]);

export const playerWarns = pgTable("playerWarns", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").notNull(),
  victimId: uuid("victim_id")
    .references(() => player.uuid, { onDelete: "cascade" })
    .notNull(),
  reason: varchar("reason", { length: 1000 }),
  hidden: boolean("hidden").notNull().default(false),
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
  banAuthor: one(user, {
    fields: [playerBans.authorId],
    references: [user.uuid],
    relationName: "banAuthor",
  }),
  banVictim: one(playerStatistics, {
    fields: [playerBans.victimId],
    references: [playerStatistics.uuid],
    relationName: "banVictim",
  }),
}));

export const playerWarnsRelations = relations(playerWarns, ({ one }) => ({
  warnAuthor: one(user, {
    fields: [playerWarns.authorId],
    references: [user.uuid],
    relationName: "warnAuthor",
  }),
  warnVictim: one(playerStatistics, {
    fields: [playerWarns.victimId],
    references: [playerStatistics.uuid],
    relationName: "warnVictim",
  }),
}));

// Used for communication between server and api
export const servers = pgTable("serverApiKey", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  // store the hashed representation you fuck
  key: varchar("key", { length: 64 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailVerifications = pgTable("emailVerifications", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.uuid, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const emailVerificationsRelations = relations(
  emailVerifications,
  ({ one }) => ({
    user: one(user, {
      fields: [emailVerifications.userId],
      references: [user.uuid],
    }),
  }),
);

export const passwordResets = pgTable("passwordResets", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.uuid, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(user, {
    fields: [passwordResets.userId],
    references: [user.uuid],
  }),
}));

export type User = typeof user.$inferSelect;

export const userSelect = createSelectSchema(user);

export const panelGroupSelect = createSelectSchema(panelGroups);

export const userSelectMinimalWithoutGroup = userSelect.pick({
  uuid: true,
  username: true,
  createdAt: true,
  updatedAt: true,
  flags: true,
  groupId: true,
});

export const userSelectMinimal = z.object({
  ...userSelectMinimalWithoutGroup.shape,
  group: panelGroupSelect.nullable(),
});

export type UserSelectMinimal = z.infer<typeof userSelectMinimal>;
