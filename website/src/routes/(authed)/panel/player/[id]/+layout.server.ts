import type { LayoutServerLoad } from "./$types";
import { redirect, error } from "@sveltejs/kit";
import trpcServer from "$lib/trpc.server";
import { hasPerm } from "$lib/user";

export const load: LayoutServerLoad = async ({ locals, params }) => {
  if (!locals.user || !hasPerm(locals.user, "VIEW_USERS")) redirect(302, "/");

  const player = await trpcServer.authed.player.get.query({
    uuid: params.id,
  });

  if (!player) error(404, "User not found");

  return { player };
};
