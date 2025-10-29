import { publicProcedure, router } from "#modules/trpc/index";
import { db, schema } from "#modules/db/index";
import { eq, sql } from "drizzle-orm";
import { platformRegex } from "@remoteadminplus/shared/common/user";
import { z } from "zod";

const searchRouter = router({
  get: publicProcedure
    .meta({
      permissionsRequired: ["SEARCH_USERS"],
    })
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
          return await db.query.player.findMany({
            limit: input.pageSize,
            offset: (input.page - 1) * input.pageSize,
            where: eq(schema.player.uuid, input.query),
          });
        case z.string().regex(platformRegex).safeParse(input.query).success:
          return await db.query.player.findMany({
            limit: input.pageSize,
            offset: (input.page - 1) * input.pageSize,
            where: eq(schema.player.platformId, input.query),
          });
        default:
          return await db.query.player.findMany({
            limit: input.pageSize,
            offset: (input.page - 1) * input.pageSize,
            where: sql`to_tsvector('english', ${schema.player.name}) @@ plainto_tsquery('english', ${input.query})`,
          });
      }
    }),
});

export default searchRouter;
