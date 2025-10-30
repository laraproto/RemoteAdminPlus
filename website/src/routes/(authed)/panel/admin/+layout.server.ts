import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import type { User } from "$lib/types/common";
import { JointFlags } from "@remoteadminplus/shared/common/user";

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user || !(locals.user.flags & JointFlags.SUPERADMIN))
    redirect(302, "/");

  return {
    user: locals.user as User,
  };
};
