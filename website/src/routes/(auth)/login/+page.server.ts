import { redirect } from "@sveltejs/kit";
import { message, superValidate, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { loginSchema } from "../schema";
import type { PageServerLoad, Actions } from "./$types";
import trpcServer from "$lib/trpc.server";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) redirect(302, "/panel");

  const form = await superValidate(zod4(loginSchema));

  return {
    configuration: locals.configuration,
    form,
  };
};

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod4(loginSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const updateResult = await trpcServer.registration.login.mutate({
        username: form.data.username,
        password: form.data.password,
      });
      if (!updateResult.success) {
        return fail(400, {
          form,
          message: updateResult.message || "Failed to login.",
        });
      }
      return message(form, updateResult.message || "Login successful!");
    } catch (err) {
      console.error("Error logging in:", err);
      return fail(500, {
        form,
        message: "An error occurred while logging in.",
      });
    }
  },
} satisfies Actions;
