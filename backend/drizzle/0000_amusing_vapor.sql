CREATE TYPE "public"."banType" AS ENUM('temporary', 'permanent');--> statement-breakpoint
CREATE TYPE "public"."warnType" AS ENUM('strike', 'minor', 'major', 'tempminor', 'tempmajor');--> statement-breakpoint
CREATE TABLE "connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider" varchar(255) NOT NULL,
	"data" jsonb NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "gameGroups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(400),
	"panel_id" integer NOT NULL,
	"permissions" jsonb,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "gameGroupsToInheritedGroups" (
	"inheriting_group_id" integer NOT NULL,
	"inherited_group_id" integer NOT NULL,
	CONSTRAINT "gameGroupsToInheritedGroups_inherited_group_id_inheriting_group_id_pk" PRIMARY KEY("inherited_group_id","inheriting_group_id")
);
--> statement-breakpoint
CREATE TABLE "panelGroups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(400),
	"panel_id" integer NOT NULL,
	"game_group_id" integer NOT NULL,
	"permissions" bigint,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "panelGroupsToInheritedGroups" (
	"inheriting_group_id" integer NOT NULL,
	"inherited_group_id" integer NOT NULL,
	CONSTRAINT "panelGroupsToInheritedGroups_inherited_group_id_inheriting_group_id_pk" PRIMARY KEY("inherited_group_id","inheriting_group_id")
);
--> statement-breakpoint
CREATE TABLE "panels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(8000),
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "playerBans" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"victim_id" integer NOT NULL,
	"panel_id" integer NOT NULL,
	"reason" varchar(1000),
	"type" "banType" NOT NULL,
	"expires_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playerStatistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"panel_id" integer NOT NULL,
	"hours_played" integer DEFAULT 0 NOT NULL,
	"hours_this_week" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "playerWarns" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"victim_id" integer NOT NULL,
	"panel_id" integer NOT NULL,
	"reason" varchar(1000),
	"hidden" boolean DEFAULT false NOT NULL,
	"type" "warnType" NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"platform_id" varchar(256) NOT NULL,
	"do_not_track" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "players_platform_id_unique" UNIQUE("platform_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users_to_panels" (
	"user_id" integer NOT NULL,
	"panel_id" integer NOT NULL,
	CONSTRAINT "users_to_panels_user_id_panel_id_pk" PRIMARY KEY("user_id","panel_id")
);
--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gameGroups" ADD CONSTRAINT "gameGroups_panel_id_panels_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."panels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gameGroupsToInheritedGroups" ADD CONSTRAINT "gameGroupsToInheritedGroups_inheriting_group_id_gameGroups_id_fk" FOREIGN KEY ("inheriting_group_id") REFERENCES "public"."gameGroups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gameGroupsToInheritedGroups" ADD CONSTRAINT "gameGroupsToInheritedGroups_inherited_group_id_gameGroups_id_fk" FOREIGN KEY ("inherited_group_id") REFERENCES "public"."gameGroups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panelGroups" ADD CONSTRAINT "panelGroups_panel_id_panels_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."panels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panelGroups" ADD CONSTRAINT "panelGroups_game_group_id_gameGroups_id_fk" FOREIGN KEY ("game_group_id") REFERENCES "public"."gameGroups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panelGroupsToInheritedGroups" ADD CONSTRAINT "panelGroupsToInheritedGroups_inheriting_group_id_panelGroups_id_fk" FOREIGN KEY ("inheriting_group_id") REFERENCES "public"."panelGroups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panelGroupsToInheritedGroups" ADD CONSTRAINT "panelGroupsToInheritedGroups_inherited_group_id_panelGroups_id_fk" FOREIGN KEY ("inherited_group_id") REFERENCES "public"."panelGroups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playerBans" ADD CONSTRAINT "playerBans_victim_id_players_id_fk" FOREIGN KEY ("victim_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playerBans" ADD CONSTRAINT "playerBans_panel_id_panels_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."panels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playerStatistics" ADD CONSTRAINT "playerStatistics_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playerStatistics" ADD CONSTRAINT "playerStatistics_panel_id_panels_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."panels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playerWarns" ADD CONSTRAINT "playerWarns_victim_id_players_id_fk" FOREIGN KEY ("victim_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playerWarns" ADD CONSTRAINT "playerWarns_panel_id_panels_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."panels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_panels" ADD CONSTRAINT "users_to_panels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_panels" ADD CONSTRAINT "users_to_panels_panel_id_panels_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."panels"("id") ON DELETE no action ON UPDATE no action;