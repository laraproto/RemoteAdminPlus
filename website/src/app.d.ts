import { z } from "zod";

export const User = z.object({
  id: z.number(),
  username: z.string(),
  emailVerified: z.boolean(),
});

export type User = z.infer<typeof User>;

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: User | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
