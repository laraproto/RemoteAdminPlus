ALTER TABLE "playerWarns" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."warnType";--> statement-breakpoint
CREATE TYPE "public"."warnType" AS ENUM('minor', 'major', 'tempminor', 'tempmajor');--> statement-breakpoint
ALTER TABLE "playerWarns" ALTER COLUMN "type" SET DATA TYPE "public"."warnType" USING "type"::"public"."warnType";