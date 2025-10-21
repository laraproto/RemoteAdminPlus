import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { usernameSchema, passwordSchema } from "../schema";
import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import trpcServer from "$lib/trpc.server";

export const load: PageServerLoad = async ({ locals: { user } }) => {
  const formUsername = await superValidate(
    (await usernameSchema.safeParseAsync(user)).data ?? null,
    zod4(usernameSchema),
  );

  const formPassword = await superValidate(
    zod4(passwordSchema),
  );

  return { formUsername, formPassword };
};

export const actions = {
    username: async ({ request }) => {
        const form = await superValidate(request, zod4(usernameSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        try {
            const updateResult = await trpcServer.authed.user.updateUsername.mutate({
                username: form.data.username,
                password: form.data.password
            });
            if (!updateResult.success) {
                return fail(400, {
                    form,
                    message: updateResult.message || "Failed to update username.",
                });
            }
            return message(form, updateResult.message);
        } catch (err) {
            console.error("Error updating username:", err);
            return fail(500, {
                form,
                message: "An error occurred while updating username.",
            });
        }
    }
} satisfies Actions;