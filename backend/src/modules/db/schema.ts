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
  index,
  text,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { z } from "zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

const timeData = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).$onUpdateFn(() => new Date()),
};

export const user = pgTable(
  "users",
  {
    uuid: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 18 }).notNull().unique(),
    displayName: varchar("display_name", { length: 25 }),
    password: varchar("password", { length: 512 }).notNull(),
    totpSecret: varchar("totp_secret", { length: 64 }),
    flags: bigint({ mode: "bigint" })
      .notNull()
      .default(sql`1::bigint`),
    groupId: uuid("group_id").references(() => panelGroups.uuid, {
      onDelete: "set null",
    }),
    ...timeData,
  },
  (table) => [
    index("username_search_index").using(
      "gin",
      sql`to_tsvector('english', ${table.username})`,
    ),
    index("display_name_search_index").using(
      "gin",
      sql`to_tsvector('english', ${table.displayName})`,
    ),
  ],
);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").references(() => user.uuid, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  totpVerified: boolean("totp_verified").notNull().default(false),
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
  servers: many(servers),
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
    .default(sql`4::bigint`),
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

export const player = pgTable(
  "players",
  {
    uuid: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => user.uuid, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 80 }).notNull(),
    // this is a platform id, sl at the time of writing this comment supports both steam and discord auth, it's better to genericize the name
    platformId: varchar("platform_id", { length: 256 }).unique().notNull(),
    doNotTrack: boolean("do_not_track").notNull().default(true), // if a player's do not track has not been picked up, assume yes for privacy reasons
    ...timeData, // service information, if data ever needs to be pruned at least this will tell of us any data that we can remove easily
  },
  (table) => [
    index("name_search_index").using(
      "gin",
      sql`to_tsvector('english', ${table.name})`,
    ),
  ],
);

export const playerRelations = relations(player, ({ one, many }) => ({
  user: one(user, {
    fields: [player.userId],
    references: [user.uuid],
  }),
  bans: many(playerBans, { relationName: "banVictim" }),
  warns: many(playerWarns, { relationName: "warnVictim" }),
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
  authorId: uuid("author_id").references(() => user.uuid, {
    onDelete: "set null",
  }),
  victimId: uuid("victim_id")
    .references(() => player.uuid, { onDelete: "cascade" })
    .notNull(),
  reason: varchar("reason", { length: 1000 }),
  type: bansEnum().notNull(),
  expiresAt: timestamp("expires_at").notNull().defaultNow(),
  active: boolean("active").notNull().default(true),
  ...timeData,
});

export const warnsEnum = pgEnum("warnType", [
  "minor",
  "major",
  "tempminor",
  "tempmajor",
]);

export const playerWarns = pgTable("playerWarns", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").references(() => user.uuid, {
    onDelete: "set null",
  }),
  victimId: uuid("victim_id")
    .references(() => player.uuid, { onDelete: "cascade" })
    .notNull(),
  reason: varchar("reason", { length: 1000 }),
  hidden: boolean("hidden").notNull().default(false),
  type: warnsEnum().notNull(),
  expiresAt: timestamp("expires_at").notNull().defaultNow(),
  active: boolean("active").notNull().default(true),
  ...timeData,
});

export const playerBansRelations = relations(playerBans, ({ one }) => ({
  banAuthor: one(user, {
    fields: [playerBans.authorId],
    references: [user.uuid],
    relationName: "banAuthor",
  }),
  banVictim: one(player, {
    fields: [playerBans.victimId],
    references: [player.uuid],
    relationName: "banVictim",
  }),
}));

export const playerWarnsRelations = relations(playerWarns, ({ one }) => ({
  warnAuthor: one(user, {
    fields: [playerWarns.authorId],
    references: [user.uuid],
    relationName: "warnAuthor",
  }),
  warnVictim: one(player, {
    fields: [playerWarns.victimId],
    references: [player.uuid],
    relationName: "warnVictim",
  }),
}));

export const accountLinkCodes = pgTable("accountLinkCodes", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull().defaultNow(),
  playerId: uuid("player_id")
    .references(() => player.uuid, { onDelete: "cascade" })
    .notNull(),
  ...timeData,
});

export const accountLinkRelations = relations(accountLinkCodes, ({ one }) => ({
  player: one(player, {
    fields: [accountLinkCodes.playerId],
    references: [player.uuid],
  }),
}));

// Used for communication between server and api
export const servers = pgTable("serverApiKey", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  // store the hashed representation you fuck
  key: varchar("key", { length: 64 }).notNull().unique(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => user.uuid, { onDelete: "cascade" }),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const serversRelations = relations(servers, ({ one }) => ({
  creator: one(user, {
    fields: [servers.creatorId],
    references: [user.uuid],
  }),
}));

export const userSelect = createSelectSchema(user);

export const panelGroupSelect = createSelectSchema(panelGroups);

export const userSelectMinimalWithoutGroup = userSelect.pick({
  uuid: true,
  username: true,
  createdAt: true,
  updatedAt: true,
  flags: true,
  groupId: true,
  displayName: true,
});

export const userSelectMinimal = z.object({
  ...userSelectMinimalWithoutGroup.shape,
  group: panelGroupSelect.nullable(),
});

export type UserSelectMinimal = z.infer<typeof userSelectMinimal>;

export const bansSelect = createSelectSchema(playerBans);
export const warnsSelect = createSelectSchema(playerWarns);

export type Bans = z.infer<typeof bansSelect>;
export type Warns = z.infer<typeof warnsSelect>;

export const playerInsert = createInsertSchema(player);
export const playerSelect = createSelectSchema(player);

export const playerSelectBans = z.object({
  ...playerSelect.shape,
  bans: z.array(bansSelect),
});

export type PlayerInsert = z.infer<typeof playerInsert>;
export type PlayerSelect = z.infer<typeof playerSelect>;

export const serverSelectWithoutApiKey = createSelectSchema(servers);
export const serverInsert = createInsertSchema(servers);

export type ServerSelectWithoutApiKey = z.infer<
  typeof serverSelectWithoutApiKey
>;
export type ServerInsert = z.infer<typeof serverInsert>;

export const serverSelect = z.object({
  ...serverSelectWithoutApiKey.shape,
  creator: userSelectMinimal,
});

export type ServerSelect = z.infer<typeof serverSelect>;

export const accountLink = createSelectSchema(accountLinkCodes);
export const accountLinkInsert = createInsertSchema(accountLinkCodes);

export type AccountLinkInsert = z.infer<typeof accountLinkInsert>;
export type AccountLink = z.infer<typeof accountLink>;

export const accountLinkWithplayer = z.object({
  ...accountLink.shape,
  player: playerSelect,
});

export type AccountLinkWithPlayer = z.infer<typeof accountLinkWithplayer>;
