import { UserFlags, RoleFlags } from "@remoteadminplus/shared/common/user";
import { z } from "zod";

export const Group = z.object({
  uuid: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  permissions: z.bigint().default(RoleFlags.GROUP),
  gameGroupId: z.uuid(),
});

export const User = z.object({
  uuid: z.uuid(),
  username: z.string(),
  emailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  groupId: z.uuid().nullable(),
  flags: z.bigint().default(UserFlags.USER),
  group: Group.nullable(),
  displayName: z.string().min(3).max(80).nullable(),
});

export type User = z.infer<typeof User>;

export const Configuration = z.object({
  appName: z.string(),
  registrationEnabled: z.boolean(),
});

export type Configuration = z.infer<typeof Configuration>;

export {};
