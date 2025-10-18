ALTER TABLE "panelGroups" ALTER COLUMN "permissions" SET DEFAULT 4::bigint;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "display_name" varchar(80);
