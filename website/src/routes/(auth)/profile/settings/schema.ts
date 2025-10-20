import { z } from "zod";

export const profileSettingsSchema = z.object({
  displayName: z.string().min(3).max(25).optional(),
});

export type ProfileSettingsSchema = typeof profileSettingsSchema;
