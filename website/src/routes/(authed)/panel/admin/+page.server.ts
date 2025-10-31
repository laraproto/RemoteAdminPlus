import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import trpcServer from "$lib/trpc.server";
import { hasPerm } from "$lib/user";
import { superValidate } from "sveltekit-superforms";
import { schemaCreateServer } from "./schema";
import { message } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || !hasPerm(locals.user, "SUPERADMIN")) redirect(302, "/");

  return {
    form: await superValidate(zod4(schemaCreateServer)),
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, zod4(schemaCreateServer));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }

    try {
      const updateResult = await trpcServer.authed.admin.createApiKey.mutate({
        description: form.data.description,
      });
      if (!updateResult.success) {
        return fail(400, {
          form,
          message: updateResult.message || "Failed to create api key.",
        });
      }
      return message(form, updateResult.token);
    } catch (err) {
      console.error("Error creating ban:", err);
      return fail(500, {
        form,
        message: "An error occurred while creating ban.",
      });
    }
  },
};
