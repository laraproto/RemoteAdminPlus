import { z } from "zod";

export const User = z.object({
  uuid: z.uuid(),
  username: z.string(),
  emailVerified: z.boolean(),
});

export type User = z.infer<typeof User>;

export {};
