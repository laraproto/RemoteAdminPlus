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
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp(),
};

//Developing this as a SaaS will make it easier to demo it, but it increases the scope significantly, I guess this is where I'm getting most of my 30 hours from
export const panels = pgTable("panels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  description: varchar("description", { length: 8000 }),
  ownerId: integer("owner_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  ...timeData,
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 512 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  totpSecret: varchar("totp_secret", { length: 64 }),
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
  panels: many(panels),
  emailVerifications: many(emailVerifications),
  passwordResets: many(passwordResets),
}));

export const panelsRelations = relations(panels, ({ one, many }) => ({
  owner: one(users, {
    fields: [panels.ownerId],
    references: [users.id],
  }),
  usersToPanels: many(usersToPanels),
  panelGroups: many(panelGroups),
  gameGroups: many(gameGroups),
  servers: many(servers),
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

export const connectionsRelations = relations(connections, ({ one }) => ({
  user: one(users, {
    fields: [connections.userId],
    references: [users.id],
  }),
}));

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

export const panelGroupsToInheritedGroups = pgTable(
  "panelGroupsToInheritedGroups",
  {
    inheritingGroupId: integer("inheriting_group_id")
      .notNull()
      .references(() => panelGroups.id, { onDelete: "cascade" }),
    inheritedGroupId: integer("inherited_group_id")
      .notNull()
      .references(() => panelGroups.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.inheritedGroupId, t.inheritingGroupId] })],
);

export const panelGroupsToInheritedGroupsRelations = relations(
  panelGroupsToInheritedGroups,
  ({ one }) => ({
    inheritingGroup: one(panelGroups, {
      fields: [panelGroupsToInheritedGroups.inheritingGroupId],
      references: [panelGroups.id],
      relationName: "inheritingGroup",
    }),
    inheritedGroup: one(panelGroups, {
      fields: [panelGroupsToInheritedGroups.inheritedGroupId],
      references: [panelGroups.id],
      relationName: "inheritedGroup",
    }),
  }),
);

export const panelGroupsRelations = relations(panelGroups, ({ one, many }) => ({
  inheritingGroupsToInheritedGroups: many(panelGroupsToInheritedGroups, {
    relationName: "inheritingGroup",
  }),
  inheritedGroupsToInheritingGroups: many(panelGroupsToInheritedGroups, {
    relationName: "inheritedGroup",
  }),
  gameGroups: one(gameGroups, {
    fields: [panelGroups.gameGroupId],
    references: [gameGroups.id],
  }),
  panel: one(panels, {
    fields: [panelGroups.panelId],
    references: [panels.id],
  }),
}));

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

export const gameGroupsToInheritedGroups = pgTable(
  "gameGroupsToInheritedGroups",
  {
    inheritingGroupId: integer("inheriting_group_id")
      .notNull()
      .references(() => gameGroups.id, { onDelete: "cascade" }),
    inheritedGroupId: integer("inherited_group_id")
      .notNull()
      .references(() => gameGroups.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.inheritedGroupId, t.inheritingGroupId] })],
);

export const gameGroupsToInheritedGroupsRelations = relations(
  gameGroupsToInheritedGroups,
  ({ one }) => ({
    inheritingGroup: one(gameGroups, {
      fields: [gameGroupsToInheritedGroups.inheritingGroupId],
      references: [gameGroups.id],
      relationName: "inheritingGroup",
    }),
    inheritedGroup: one(gameGroups, {
      fields: [gameGroupsToInheritedGroups.inheritedGroupId],
      references: [gameGroups.id],
      relationName: "inheritedGroup",
    }),
  }),
);

export const gameGroupsRelations = relations(gameGroups, ({ one, many }) => ({
  panelGroups: many(panelGroups),
  inheritingGroupsToInheritedGroups: many(gameGroupsToInheritedGroups, {
    relationName: "inheritingGroup",
  }),
  inheritedGroupsToInheritingGroups: many(gameGroupsToInheritedGroups, {
    relationName: "inheritedGroup",
  }),
  panel: one(panels, {
    fields: [gameGroups.panelId],
    references: [panels.id],
  }),
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
  victimId: integer("victim_id")
    .references(() => players.id, { onDelete: "cascade" })
    .notNull(),
  panelId: integer("panel_id")
    .references(() => panels.id, { onDelete: "cascade" })
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
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  victimId: integer("victim_id")
    .references(() => players.id, { onDelete: "cascade" })
    .notNull(),
  panelId: integer("panel_id")
    .references(() => panels.id, { onDelete: "cascade" })
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
  banAuthor: one(users, {
    fields: [playerBans.authorId],
    references: [users.id],
    relationName: "banAuthor",
  }),
  banPanel: one(panels, {
    fields: [playerBans.panelId],
    references: [panels.id],
  }),
  banVictim: one(playerStatistics, {
    fields: [playerBans.victimId],
    references: [playerStatistics.id],
    relationName: "banVictim",
  }),
  panel: one(panels, {
    fields: [playerBans.panelId],
    references: [panels.id],
    relationName: "banPanel",
  }),
}));

export const playerWarnsRelations = relations(playerWarns, ({ one }) => ({
  warnAuthor: one(users, {
    fields: [playerWarns.authorId],
    references: [users.id],
    relationName: "warnAuthor",
  }),
  warnPanel: one(panels, {
    fields: [playerWarns.panelId],
    references: [panels.id],
  }),
  warnVictim: one(playerStatistics, {
    fields: [playerWarns.victimId],
    references: [playerStatistics.id],
    relationName: "warnVictim",
  }),
  panel: one(panels, {
    fields: [playerWarns.panelId],
    references: [panels.id],
    relationName: "warnPanel",
  }),
}));

// Used for communication between server and api
export const servers = pgTable("serverApiKey", {
  id: serial("id").primaryKey(),
  // store the hashed representation you fuck
  key: varchar("key", { length: 64 }).notNull().unique(),
  panelId: integer("panel_id")
    .notNull()
    .references(() => panels.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const serverRelations = relations(servers, ({ one }) => ({
  panel: one(panels, {
    fields: [servers.panelId],
    references: [panels.id],
  }),
}));

export const emailVerifications = pgTable("emailVerifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 64}).notNull(),
  expiresAt: timestamp("expires_at").notNull(),

});

export const emailVerificationsRelations = relations(emailVerifications, ({ one }) => ({
  user: one(users, {
    fields: [emailVerifications.userId],
    references: [users.id],
  })
}));

export const passwordResets = pgTable("passwordResets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull()
});

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.userId],
    references: [users.id],
  })
}))