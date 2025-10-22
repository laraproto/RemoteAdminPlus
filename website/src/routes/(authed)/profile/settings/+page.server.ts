import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { profileSettingsSchema } from "./schema";
import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import trpcServer from "$lib/trpc.server";

export const load: PageServerLoad = async ({ locals: { user } }) => {
  const form = await superValidate(
    (await profileSettingsSchema.safeParseAsync(user)).data ?? null,
    zod4(profileSettingsSchema),
  );

  // Always return { form } in load functions
  return { form };
};

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod4(profileSettingsSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const updateResult = await trpcServer.authed.user.updateProfile.mutate({
        displayName: form.data.displayName,
      });
      if (!updateResult.success) {
        return fail(400, {
          form,
          message: updateResult.message || "Failed to update profile settings.",
        });
      }
      return message(
        form,
        updateResult.message || "Username updated successfully!",
      );
    } catch (err) {
      console.error("Error updating profile settings:", err);
      return fail(500, {
        form,
        message: "An error occurred while updating settings.",
      });
    }
  },
} satisfies Actions;
