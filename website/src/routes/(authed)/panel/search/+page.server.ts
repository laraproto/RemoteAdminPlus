import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import trpcServer from "$lib/trpc.server";
import { hasPerm } from "$lib/user";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || !hasPerm(locals.user, "SEARCH_USERS")) redirect(302, "/");

  const search = await trpcServer.authed.search.get.query({});

  return { search };
};
