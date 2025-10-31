import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { usernameSchema, passwordSchema, formLinkSchema } from "../schema";
import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import trpcServer from "$lib/trpc.server";

export const load: PageServerLoad = async ({ locals: { user } }) => {
  const formUsername = await superValidate(
    (await usernameSchema.omit({ password: true }).safeParseAsync(user)).data ??
      null,
    zod4(usernameSchema),
    { errors: false },
  );

  const formPassword = await superValidate(zod4(passwordSchema));

  const formLink = await superValidate(zod4(formLinkSchema));

  return { formUsername, formPassword, formLink };
};

export const actions = {
  username: async ({ request }) => {
    const form = await superValidate(request, zod4(usernameSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const updateResult =
        await trpcServer.authed.authedUser.updateUsername.mutate({
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
  password: async ({ request }) => {
    const form = await superValidate(request, zod4(passwordSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const updateResult =
        await trpcServer.authed.authedUser.updatePassword.mutate({
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
  link: async ({ request }) => {
    const form = await superValidate(request, zod4(formLinkSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const updateResult = await trpcServer.authed.authedUser.finishLink.mutate(
        {
          linkCode: form.data.linkCode,
          password: form.data.password,
        },
      );
      if (!updateResult.success) {
        return fail(400, {
          form,
          message: updateResult.message || "Failed to link.",
        });
      }
      return message(form, updateResult.message);
    } catch (err) {
      console.error("Error linking:", err);
      return fail(500, {
        form,
        message: "An error occurred while linking.",
      });
    }
  },
} satisfies Actions;
