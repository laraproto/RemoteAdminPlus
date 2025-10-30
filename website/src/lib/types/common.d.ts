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
  url: z.url().nullable(),
});

export type Configuration = z.infer<typeof Configuration>;

export const UserMinimal = User.pick({
  uuid: true,
  username: true,
  displayName: true,
});

export type UserMinimal = z.infer<typeof UserMinimal>;

export const Player = z.object({
  uuid: z.uuid(),
  userId: z.uuid().nullable(),
  name: z.string(),
  platformId: z.string(),
  doNotTrack: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export type Player = z.infer<typeof Player>;

export const Warn = z.object({
  uuid: z.uuid(),
  authorId: z.uuid().nullable,
  victimId: z.uuid(),
  reason: z.string().min(1).max(500).nullable(),
  hidden: z.boolean().nullable(),
  type: z.enum(["minor", "major", "tempminor", "tempmajor"]),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  expiresAt: z.date(),
  active: z.boolean(),
  warnAuthor: UserMinimal.nullable(),
  warnVictim: Player,
});

export type Warn = z.infer<typeof Warn>;

export const Ban = z.object({
  uuid: z.uuid(),
  authorId: z.uuid().nullable(),
  victimId: z.uuid(),
  reason: z.string().min(1).max(500).nullable(),
  type: z.enum(["temporary", "permanent"]),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  expiresAt: z.date(),
  active: z.boolean(),
  banAuthor: UserMinimal.nullable(),
  banVictim: Player,
});

export type Ban = z.infer<typeof Ban>;

export {};
