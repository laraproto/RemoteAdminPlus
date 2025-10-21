import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { usernameSchema, passwordSchema, emailSchema } from "../schema";
import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import trpcServer from "$lib/trpc.server";

export const load: PageServerLoad = async ({ locals: { user } }) => {
  const formUsername = await superValidate(
    (await usernameSchema.safeParseAsync(user)).data ?? null,
    zod4(usernameSchema),
  );

  const formPassword = await superValidate(zod4(passwordSchema));

  const formEmail = await superValidate(
    (await emailSchema.safeParseAsync(user)).data ?? null,
    zod4(emailSchema),
  );

  return { formUsername, formPassword, formEmail };
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
        password: form.data.password,
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
  },
  email: async ({ request }) => {
    const form = await superValidate(request, zod4(emailSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const updateResult = await trpcServer.authed.user.updateEmail.mutate({
        email: form.data.email,
        password: form.data.password,
      });
      if (!updateResult.success) {
        return fail(400, {
          form,
          message: updateResult.message || "Failed to update email.",
        });
      }
      return message(form, updateResult.message);
    } catch (err) {
      console.error("Error updating email:", err);
      return fail(500, {
        form,
        message: "An error occurred while updating email.",
      });
    }
  },
  password: async ({ request }) => {
    const form = await superValidate(request, zod4(passwordSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const updateResult = await trpcServer.authed.user.updatePassword.mutate({
        currentPassword: form.data.currentPassword,
        newPassword: form.data.newPassword,
        newPasswordConfirm: form.data.confirmNewPassword,
      });
      if (!updateResult.success) {
        return fail(400, {
          form,
          message: updateResult.message || "Failed to update password.",
        });
      }
      return message(form, updateResult.message);
    } catch (err) {
      console.error("Error updating password:", err);
      return fail(500, {
        form,
        message: "An error occurred while updating password.",
      });
    }
  },
} satisfies Actions;
