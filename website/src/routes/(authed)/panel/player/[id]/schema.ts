import { z } from "zod";

export const warnSchema = z.object({
  uuid: z.uuid(),
  reason: z.string().min(1).max(500),
  hidden: z.boolean().optional().default(false),
  type: z.enum(["tempminor", "tempmajor", "minor", "major"]),
  expiresAt: z.date().optional().default(new Date()),
});

export type WarnSchema = typeof warnSchema;

export const banSchema = z.object({
  uuid: z.uuid(),
  reason: z.string().min(1).max(500),
  permanent: z.boolean().default(false),
  expiresAt: z.date().optional().default(new Date()),
});

export type BanSchema = typeof banSchema;
