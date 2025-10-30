DROP TABLE "passwordResets" CASCADE;--> statement-breakpoint
ALTER TABLE "serverApiKey" ADD COLUMN "creator_id" uuid;