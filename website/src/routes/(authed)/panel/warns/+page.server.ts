import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import trpcServer from "$lib/trpc.server";
import { hasPerm } from "$lib/user";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || !hasPerm(locals.user, "VIEW_WARNINGS"))
    redirect(302, "/");

  const warns = await trpcServer.authed.warns.get.query({});

  return { warns };
};
