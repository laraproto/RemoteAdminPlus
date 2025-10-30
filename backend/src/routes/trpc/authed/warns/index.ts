import { authedProcedure } from "#modules/trpc";
import { router } from "#modules/trpc";
import { platformRegex, JointFlags } from "@remoteadminplus/shared/common/user";
import { eq, and, like } from "drizzle-orm";
import { db, schema } from "#modules/db";
import { z } from "zod";

const warnsRouter = router({
  get: authedProcedure
    .meta({ permissionsRequired: ["VIEW_WARNINGS"] })
    .input(
      z.object({
        query: z.string().optional().default(""),
        page: z.number().min(1).optional().default(1),
        pageSize: z.number().min(10).max(100).optional().default(10),
      }),
    )
    .query(async ({ input }) => {
      switch (true) {
        case z.uuid().safeParse(input.query).success:
          return await db.query.playerWarns.findMany({
            limit: input.pageSize,
            offset: (input.page - 1) * input.pageSize,
            with: {
              warnAuthor: {
                columns: {
                  uuid: true,
                  username: true,
                  displayName: true,
                },
              },
              warnVictim: true,
            },
            where: (table, { eq, or }) =>
              or(
                eq(table.authorId, input.query),
                eq(table.victimId, input.query),
              ),
          });
        case z.string().regex(platformRegex).safeParse(input.query).success:
          return await db.query.playerWarns.findMany({
            limit: input.pageSize,
            offset: (input.page - 1) * input.pageSize,
            with: {
              warnAuthor: {
                columns: {
                  uuid: true,
                  username: true,
                  displayName: true,
                },
              },
              warnVictim: true,
            },
            where: (warns, { inArray }) =>
              inArray(
                warns.victimId,
                db
                  .select({ id: schema.player.uuid })
                  .from(schema.player)
                  .where(eq(schema.player.platformId, input.query)),
              ),
          });
        default: {
          const result = await db.query.playerWarns.findMany({
            limit: input.pageSize,
            offset: (input.page - 1) * input.pageSize,
            with: {
              warnAuthor: {
                columns: {
                  uuid: true,
                  username: true,
                  displayName: true,
                },
              },
              warnVictim: true,
            },
            where: (warns, { inArray, or, isNull }) =>
              or(
                inArray(
                  warns.victimId,
                  db
                    .select({ id: schema.player.uuid })
                    .from(schema.player)
                    .where(like(schema.player.name, `%${input.query}%`)),
                ),
                or(
                  inArray(
                    warns.authorId,
                    db
                      .select({ id: schema.user.uuid })
                      .from(schema.user)
                      .where(like(schema.user.username, `%${input.query}%`)),
                  ),
                  inArray(
                    warns.authorId,
                    db
                      .select({ id: schema.user.uuid })
                      .from(schema.user)
                      .where(like(schema.user.displayName, `%${input.query}%`)),
                  ),
                  isNull(warns.authorId),
                ),
              ),
          });
          return result;
        }
      }
    }),
  edit: authedProcedure
    .input(
      z.object({
        uuid: z.uuid(),
        expiresAt: z.date(),
        type: z.enum(["minor", "major", "tempminor", "tempmajor"]),
        reason: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const canSeeHidden =
        (ctx.user.group !== null &&
          !!(
            ctx.user.group?.permissions & JointFlags["VIEW_HIDDEN_WARNINGS"]
          )) ||
        !!(ctx.user.flags & JointFlags["VIEW_HIDDEN_WARNINGS"]);

      const existingWarn = await db.query.playerWarns.findFirst({
        where: and(
          eq(schema.playerWarns.uuid, input.uuid),
          !canSeeHidden ? eq(schema.playerWarns.hidden, false) : undefined,
        ),
      });

      if (!existingWarn) {
        return {
          success: false,
          message: "Warn not found.",
        };
      }

      const delay = input.expiresAt.getTime() - Date.now();

      const permanent = input.type === "minor" || input.type === "major";

      const updatedWarn = await db
        .update(schema.playerWarns)
        .set({
          expiresAt: input.expiresAt,
          reason: input.reason,
          type: input.type,
          active: permanent ? true : delay > 0,
        })
        .where(eq(schema.playerWarns.uuid, input.uuid))
        .returning();

      if (!updatedWarn[0]) {
        return {
          success: false,
          message: "Warn failed to update.",
        };
      }

      return {
        success: true,
        message: "Warn updated successfully.",
      };
    }),
  end: authedProcedure
    .input(
      z.object({
        uuid: z.uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const canSeeHidden =
        (ctx.user.group !== null &&
          !!(
            ctx.user.group?.permissions & JointFlags["VIEW_HIDDEN_WARNINGS"]
          )) ||
        !!(ctx.user.flags & JointFlags["VIEW_HIDDEN_WARNINGS"]);

      const existingWarn = await db.query.playerWarns.findFirst({
        where: and(
          eq(schema.playerWarns.uuid, input.uuid),
          !canSeeHidden ? eq(schema.playerWarns.hidden, false) : undefined,
        ),
      });

      if (!existingWarn) {
        return {
          success: false,
          message: "Warn not found.",
        };
      }

      if (existingWarn.type === "major" || existingWarn.type === "minor") {
        return {
          success: false,
          message: "Can't end warns that aren't temporary, deletion only",
        };
      }

      await db
        .update(schema.playerWarns)
        .set({ active: false, expiresAt: new Date() })
        .where(eq(schema.playerWarns.uuid, input.uuid));

      return {
        success: true,
        message: "Warn ended successfully.",
      };
    }),
  delete: authedProcedure
    .input(
      z.object({
        uuid: z.uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const canSeeHidden =
        (ctx.user.group !== null &&
          !!(
            ctx.user.group?.permissions & JointFlags["VIEW_HIDDEN_WARNINGS"]
          )) ||
        !!(ctx.user.flags & JointFlags["VIEW_HIDDEN_WARNINGS"]);

      const existingWarn = await db.query.playerWarns.findFirst({
        where: and(
          eq(schema.playerWarns.uuid, input.uuid),
          !canSeeHidden ? eq(schema.playerWarns.hidden, false) : undefined,
        ),
      });

      if (!existingWarn) {
        return {
          success: false,
          message: "Warn not found.",
        };
      }

      await db
        .delete(schema.playerWarns)
        .where(eq(schema.playerWarns.uuid, input.uuid));

      return {
        success: true,
        message: "Warn ended successfully.",
      };
    }),
});

export default warnsRouter;
