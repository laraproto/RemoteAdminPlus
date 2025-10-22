import { redirect } from "@sveltejs/kit";
import { message, superValidate, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { registerSchema } from "../schema";
import type { PageServerLoad, Actions } from "./$types";
import trpcServer from "$lib/trpc.server";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) redirect(302, "/panel");
  if (!locals.configuration?.registrationEnabled) redirect(302, "/");

  const form = await superValidate(zod4(registerSchema));

  return { form };
};

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod4(registerSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const updateResult = await trpcServer.registration.register.mutate({
        username: form.data.username,
        password: form.data.password,
      });
      if (!updateResult.success) {
        return fail(400, {
          form,
          message: updateResult.message || "Failed to create user.",
        });
      }
      return message(
        form,
        updateResult.message || "User created successfully!",
      );
    } catch (err) {
      console.error("Error creating user:", err);
      return fail(500, {
        form,
        message: "An error occurred while creating user.",
      });
    }
  },
} satisfies Actions;
