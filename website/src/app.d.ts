import { type Configuration, type User } from "$lib/types/common";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: User | null;
      configuration: Configuration | null;
    }
    interface PageData {
      user: User | null;
      configuration: Configuration | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
