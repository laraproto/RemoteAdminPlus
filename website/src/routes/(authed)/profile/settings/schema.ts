import { usernameRegex } from "@remoteadminplus/shared/common/user";
import { z } from "zod";

export const profileSettingsSchema = z.object({
  displayName: z.string().min(3).max(25).optional(),
});

export type ProfileSettingsSchema = typeof profileSettingsSchema;

export const usernameSchema = z.object({
  username: z.string().min(3).max(18).regex(usernameRegex),
  password: z.string().min(8).max(128),
});

export type UsernameSchema = typeof usernameSchema;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(8).max(128),
    confirmNewPassword: z.string().min(8).max(128),
  })
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    "New password must be different from current password",
  )
  .refine(
    (data) => data.newPassword === data.confirmNewPassword,
    "New password and confirmation do not match",
  );

export type PasswordSchema = typeof passwordSchema;

export const emailSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});
