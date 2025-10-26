import { authedProcedure } from "#modules/trpc";
import { router } from "#modules/trpc";
import { platformRegex } from "@remoteadminplus/shared/common/user";
import { eq, sql } from "drizzle-orm";
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
});

export default warnsRouter;
