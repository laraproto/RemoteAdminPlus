import { publicProcedure, router } from "#modules/trpc";
import { invalidateSession } from "#modules/auth/index";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "#modules/db";

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
});

export default userRouter;
