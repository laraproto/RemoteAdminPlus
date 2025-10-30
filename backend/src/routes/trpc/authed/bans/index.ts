import { authedProcedure } from "#modules/trpc";
import { router } from "#modules/trpc";
import { platformRegex } from "@remoteadminplus/shared/common/user";
import { eq, like } from "drizzle-orm";
import { db, schema } from "#modules/db";
import { z } from "zod";
import { scheduleBan } from "#modules/scheduler/queues/bans";

const bansRouter = router({
  get: authedProcedure
    .meta({ permissionsRequired: ["VIEW_BANS"] })
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
          return await db.query.playerBans.findMany({
            limit: input.pageSize,
            offset: (input.page - 1) * input.pageSize,
            with: {
              banAuthor: {
                columns: {
                  uuid: true,
                  username: true,
                  displayName: true,
                },
              },
              banVictim: true,
            },
            where: (ban, { eq, or }) =>
              or(eq(ban.authorId, input.query), eq(ban.victimId, input.query)),
          });
        case z.string().regex(platformRegex).safeParse(input.query).success:
          return await db.query.playerBans.findMany({
            limit: input.pageSize,
            offset: (input.page - 1) * input.pageSize,
            with: {
              banAuthor: {
                columns: {
                  uuid: true,
                  username: true,
                  displayName: true,
                },
              },
              banVictim: true,
            },
            where: (ban, { inArray }) =>
              inArray(
                ban.victimId,
                db
                  .select({ id: schema.player.uuid })
                  .from(schema.player)
                  .where(eq(schema.player.platformId, input.query)),
              ),
          });
        default:
          return await db.query.playerBans.findMany({
            limit: input.pageSize,
            offset: (input.page - 1) * input.pageSize,
            with: {
              banAuthor: {
                columns: {
                  uuid: true,
                  username: true,
                  displayName: true,
                },
              },
              banVictim: true,
            },
            where: (bans, { inArray, or, isNull }) =>
              or(
                inArray(
                  bans.victimId,
                  db
                    .select({ id: schema.player.uuid })
                    .from(schema.player)
                    .where(like(schema.player.name, `%${input.query}%`)),
                ),
                or(
                  inArray(
                    bans.authorId,
                    db
                      .select({ id: schema.user.uuid })
                      .from(schema.user)
                      .where(like(schema.user.username, `%${input.query}%`)),
                  ),
                  inArray(
                    bans.authorId,
                    db
                      .select({ id: schema.user.uuid })
                      .from(schema.user)
                      .where(like(schema.user.displayName, `%${input.query}%`)),
                  ),
                  isNull(bans.authorId),
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
        permanent: z.boolean().optional().default(false),
        reason: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ input }) => {
      const existingBan = await db.query.playerBans.findFirst({
        where: eq(schema.playerBans.uuid, input.uuid),
      });

      if (!existingBan) {
        return {
          success: false,
          message: "Ban not found.",
        };
      }

      const delay = input.expiresAt.getTime() - Date.now();

      const updatedBan = await db
        .update(schema.playerBans)
        .set({
          expiresAt: input.expiresAt,
          reason: input.reason,
          type: input.permanent ? "permanent" : "temporary",
          active: input.permanent ? true : delay > 0,
        })
        .where(eq(schema.playerBans.uuid, input.uuid))
        .returning();

      if (!updatedBan[0]) {
        return {
          success: false,
          message: "Ban failed to update.",
        };
      }

      if (delay > 0 && !input.permanent) {
        await scheduleBan(updatedBan[0]);
      }

      return {
        success: true,
        message: "Ban updated successfully.",
      };
    }),
  end: authedProcedure
    .input(
      z.object({
        uuid: z.uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const existingBan = await db.query.playerBans.findFirst({
        where: eq(schema.playerBans.uuid, input.uuid),
      });

      if (!existingBan) {
        return {
          success: false,
          message: "Ban not found.",
        };
      }

      await db
        .update(schema.playerBans)
        .set({ active: false, expiresAt: new Date() })
        .where(eq(schema.playerBans.uuid, input.uuid));

      return {
        success: true,
        message: "Ban ended successfully.",
      };
    }),
  delete: authedProcedure
    .input(
      z.object({
        uuid: z.uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const existingBan = await db.query.playerBans.findFirst({
        where: eq(schema.playerBans.uuid, input.uuid),
      });

      if (!existingBan) {
        return {
          success: false,
          message: "Ban not found.",
        };
      }

      await db
        .delete(schema.playerBans)
        .where(eq(schema.playerBans.uuid, input.uuid));

      return {
        success: true,
        message: "Ban ended successfully.",
      };
    }),
});

export default bansRouter;
