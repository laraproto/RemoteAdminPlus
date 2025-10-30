import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import trpcServer from "$lib/trpc.server";
import { hasPerm } from "$lib/user";
import { superValidate } from "sveltekit-superforms";
import { warnSchema } from "../schema";
import { zod4 } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user || !hasPerm(locals.user, "VIEW_WARNINGS"))
    redirect(302, "/");

  const warns = await trpcServer.authed.player.getWarns.query({
    uuid: params.id,
  });

  return {
    warns,
    form: await superValidate(zod4(warnSchema)),
  };
};
