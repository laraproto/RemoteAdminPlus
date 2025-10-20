import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import type { User } from "$lib/types/common";

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/");

  return {
    user: locals.user as User,
  };
};
