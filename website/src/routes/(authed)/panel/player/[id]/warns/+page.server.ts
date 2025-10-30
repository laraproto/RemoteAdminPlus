import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import trpcServer from "$lib/trpc.server";
import { hasPerm } from "$lib/user";
import { superValidate, message } from "sveltekit-superforms";
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

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, zod4(warnSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }

    try {
      const updateResult = await trpcServer.authed.player.createWarn.mutate({
        uuid: form.data.uuid,
        reason: form.data.reason,
        expiresAt: form.data.expiresAt,
        type: form.data.type,
      });
      if (!updateResult.success) {
        return fail(400, {
          form,
          message: updateResult.message || "Failed to create warn.",
        });
      }
      return message(form, "Warn created successfully");
    } catch (err) {
      console.error("Error creating warn:", err);
      return fail(500, {
        form,
        message: "An error occurred while creating warn.",
      });
    }
  },
};
