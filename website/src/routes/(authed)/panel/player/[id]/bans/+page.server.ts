import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import trpcServer from "$lib/trpc.server";
import { hasPerm } from "$lib/user";
import { superValidate } from "sveltekit-superforms";
import { banSchema } from "../schema";
import { message } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user || !hasPerm(locals.user, "VIEW_BANS")) redirect(302, "/");

  const bans = await trpcServer.authed.player.getBans.query({
    uuid: params.id,
  });

  return {
    bans,
    form: await superValidate(zod4(banSchema)),
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, zod4(banSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }

    console.log(form);

    return message(form, "I will kms");
  },
};
