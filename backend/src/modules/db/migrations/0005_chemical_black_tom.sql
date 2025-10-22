ALTER TABLE "playerWarns" ALTER COLUMN "expires_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "playerWarns" ALTER COLUMN "expires_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "playerBans" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "playerBans" ADD COLUMN "updatedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "playerWarns" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "playerWarns" ADD COLUMN "updatedAt" timestamp with time zone;