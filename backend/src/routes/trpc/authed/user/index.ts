import { publicProcedure, router } from "#modules/trpc";
import { invalidateSession } from "#modules/auth/index";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "#modules/db";
import { usernameRegex } from "@remoteadminplus/shared/common/user";
import { password } from "bun";

const userRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user),
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const result = await invalidateSession(ctx.session.id);
    if (result) {
      return { success: result, redirect: "/" };
    } else {
      return { success: result };
    }
  }),
  updateProfile: publicProcedure
    .input(
      z.object({
        displayName: z.string().min(3).max(25).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await db
          .update(schema.user)
          .set({
            displayName: input.displayName,
          })
          .where(eq(schema.user.uuid, ctx.user.uuid))
          .returning();
        return {
          success: user.length > 0,
        };
      } catch (err) {
        console.error("Error updating user profile:", err);
        return {
          success: false,
        };
      }
    }),
    updateUsername: publicProcedure.input(z.object({
      username: z.string().min(3).max(18).regex(usernameRegex),
      password: z.string().min(8).max(128),
    })).mutation(async ({ ctx, input }) => {
      try {
        const userRecord = await db.query.user.findFirst({
          where: (users, { eq }) => eq(users.uuid, ctx.user.uuid),
          columns: {
            uuid: true,
            password: true
          }
        });

        if (!userRecord) {
          return { success: false, message: "We couldn't find your user." };
        }

        if (!(await password.verify(input.password, userRecord.password))) {
          return { success: false, message: "The provided password is incorrect." };
        }

        const existingUser = await db.query.user.findFirst({
          where: (users, { eq }) => eq(users.username, input.username),
          columns: {
            uuid: true
          }
        });

        if (existingUser) {
          return { success: false, message: "This username is already taken." };
        }

        const updatedUsers = await db
          .update(schema.user)
          .set({ username: input.username })
          .where(eq(schema.user.uuid, ctx.user.uuid))
          .returning();

          return {
            success: updatedUsers.length > 0,
            message: updatedUsers.length > 0 ? "Username updated successfully." : "Failed to update username."
          }
      } catch (err) {
        console.error("Error updating username:", err);
        return { success: false };
      }
    }),
});

export default userRouter;
