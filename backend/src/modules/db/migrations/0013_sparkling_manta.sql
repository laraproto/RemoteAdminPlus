CREATE TABLE "accountLinkCodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"expires_at" timestamp DEFAULT now() NOT NULL,
	"player_id" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "accountLinkCodes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "flags" SET DEFAULT 1::bigint;--> statement-breakpoint
ALTER TABLE "accountLinkCodes" ADD CONSTRAINT "accountLinkCodes_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;