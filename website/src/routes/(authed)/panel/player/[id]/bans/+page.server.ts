import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import trpcServer from "$lib/trpc.server";
import { hasPerm } from "$lib/user";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user || !hasPerm(locals.user, "VIEW_BANS")) redirect(302, "/");

  const bans = await trpcServer.authed.player.getBans.query({
    uuid: params.id,
  });

  return { bans };
};
