import { z } from "zod";

export const profileSettingsSchema = z.object({
  displayName: z.string().min(3).max(25).nullable().default(null),
});

export type ProfileSettingsSchema = typeof profileSettingsSchema;
