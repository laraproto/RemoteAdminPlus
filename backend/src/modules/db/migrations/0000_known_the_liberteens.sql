CREATE TYPE "public"."banType" AS ENUM('temporary', 'permanent');--> statement-breakpoint
CREATE TYPE "public"."warnType" AS ENUM('strike', 'minor', 'major', 'tempminor', 'tempmajor');--> statement-breakpoint
CREATE TABLE "connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(255) NOT NULL,
	"data" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "emailVerifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(64) NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gameGroups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(400),
	"permissions" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "gameGroupsInheritedGroups" (
	"owning_group_id" uuid NOT NULL,
	"owned_group_id" uuid NOT NULL,
	CONSTRAINT "gameGroupsInheritedGroups_owned_group_id_owning_group_id_pk" PRIMARY KEY("owned_group_id","owning_group_id")
);
--> statement-breakpoint
CREATE TABLE "panelGroups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(400),
	"game_group_id" uuid NOT NULL,
	"permissions" bigint DEFAULT 1::bigint NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "panelGroupsInheritedGroups" (
	"owning_group" uuid NOT NULL,
	"owned_group" uuid NOT NULL,
	CONSTRAINT "panelGroupsInheritedGroups_owned_group_owning_group_pk" PRIMARY KEY("owned_group","owning_group")
);
--> statement-breakpoint
CREATE TABLE "passwordResets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(64) NOT NULL,
	"email" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" varchar(80) NOT NULL,
	"platform_id" varchar(256) NOT NULL,
	"do_not_track" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "players_platform_id_unique" UNIQUE("platform_id")
);
--> statement-breakpoint
CREATE TABLE "playerBans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"victim_id" uuid NOT NULL,
	"reason" varchar(1000),
	"type" "banType" NOT NULL,
	"expires_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playerStatistics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"time_played" bigint DEFAULT 0::bigint NOT NULL,
	"time_this_week" bigint DEFAULT 0::bigint NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "playerWarns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"victim_id" uuid NOT NULL,
	"reason" varchar(1000),
	"hidden" boolean DEFAULT false NOT NULL,
	"type" "warnType" NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "serverApiKey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(64) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "serverApiKey_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(512) NOT NULL,
	"email" varchar(255),
	"email_verified" boolean DEFAULT false NOT NULL,
	"totp_secret" varchar(64),
	"flags" bigint DEFAULT 1::bigint NOT NULL,
	"group_id" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emailVerifications" ADD CONSTRAINT "emailVerifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gameGroupsInheritedGroups" ADD CONSTRAINT "gameGroupsInheritedGroups_owning_group_id_gameGroups_id_fk" FOREIGN KEY ("owning_group_id") REFERENCES "public"."gameGroups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gameGroupsInheritedGroups" ADD CONSTRAINT "gameGroupsInheritedGroups_owned_group_id_gameGroups_id_fk" FOREIGN KEY ("owned_group_id") REFERENCES "public"."gameGroups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panelGroups" ADD CONSTRAINT "panelGroups_game_group_id_gameGroups_id_fk" FOREIGN KEY ("game_group_id") REFERENCES "public"."gameGroups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panelGroupsInheritedGroups" ADD CONSTRAINT "panelGroupsInheritedGroups_owning_group_panelGroups_id_fk" FOREIGN KEY ("owning_group") REFERENCES "public"."panelGroups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panelGroupsInheritedGroups" ADD CONSTRAINT "panelGroupsInheritedGroups_owned_group_panelGroups_id_fk" FOREIGN KEY ("owned_group") REFERENCES "public"."panelGroups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passwordResets" ADD CONSTRAINT "passwordResets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playerBans" ADD CONSTRAINT "playerBans_victim_id_players_id_fk" FOREIGN KEY ("victim_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playerStatistics" ADD CONSTRAINT "playerStatistics_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playerWarns" ADD CONSTRAINT "playerWarns_victim_id_players_id_fk" FOREIGN KEY ("victim_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_group_id_panelGroups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."panelGroups"("id") ON DELETE set null ON UPDATE no action;