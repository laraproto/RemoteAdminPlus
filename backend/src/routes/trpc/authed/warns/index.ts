import { authedProcedure } from "#modules/trpc";
import { router } from "#modules/trpc";
import { platformRegex } from "@remoteadminplus/shared/common/user";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "#modules/db";
import { z } from "zod";
import { scheduleWarn } from "#modules/scheduler/queues/warns";

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
              warnAuthor: true,
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
              warnAuthor: true,
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
        default:
          return await db.query.playerWarns.findMany({
            limit: input.pageSize,
            offset: (input.page - 1) * input.pageSize,
            where: (warns, { inArray, or }) =>
              or(
                inArray(
                  warns.victimId,
                  db
                    .select({ id: schema.player.uuid })
                    .from(schema.player)
                    .where(
                      sql`to_tsvector('english', ${schema.player.name}) @@ plainto_tsquery('english', ${input.query})`,
                    ),
                ),
                or(
                  inArray(
                    warns.authorId,
                    db
                      .select({ id: schema.user.uuid })
                      .from(schema.user)
                      .where(
                        sql`to_tsvector('english', ${schema.user.username}) @@ plainto_tsquery('english', ${input.query})`,
                      ),
                  ),
                  inArray(
                    warns.authorId,
                    db
                      .select({ id: schema.user.uuid })
                      .from(schema.user)
                      .where(
                        sql`to_tsvector('english', ${schema.user.displayName}) @@ plainto_tsquery('english', ${input.query})`,
                      ),
                  ),
                ),
              ),
          });
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
    .mutation(async ({ input }) => {
      const existingWarn = await db.query.playerWarns.findFirst({
        where: eq(schema.playerWarns.uuid, input.uuid),
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

      if (delay > 0 && !permanent) {
        await scheduleWarn(updatedWarn[0]);
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
    .mutation(async ({ input }) => {
      const existingWarn = await db.query.playerWarns.findFirst({
        where: eq(schema.playerWarns.uuid, input.uuid),
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
    .mutation(async ({ input }) => {
      const existingWarn = await db.query.playerWarns.findFirst({
        where: eq(schema.playerWarns.uuid, input.uuid),
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
