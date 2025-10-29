import { authedProcedure, router } from "#modules/trpc";
import { db, schema } from "#modules/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { JointFlags } from "@remoteadminplus/shared/common/user";

const playerRouter = router({
  get: authedProcedure
    .meta({
      permissionsRequired: "VIEW_USERS",
    })
    .input(
      z.object({
        uuid: z.uuid(),
      }),
    )
    .query(async ({ input }) => {
      const player = await db.query.player.findFirst({
        where: eq(schema.player.uuid, input.uuid),
      });

      return player;
    }),
  getWarns: authedProcedure
    .meta({
      permissionsRequired: ["VIEW_USERS", "VIEW_WARNINGS"],
    })
    .input(
      z.object({
        uuid: z.uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const canSeeHidden =
        (ctx.user.group !== null &&
          !!(
            ctx.user.group?.permissions & JointFlags["VIEW_HIDDEN_WARNINGS"]
          )) ||
        !!(ctx.user.flags & JointFlags["VIEW_HIDDEN_WARNINGS"]);

      const warns = await db.query.playerWarns.findMany({
        where: and(
          eq(schema.playerWarns.victimId, input.uuid),
          !canSeeHidden ? eq(schema.playerWarns.hidden, false) : undefined,
        ),
        columns: !canSeeHidden ? { hidden: canSeeHidden } : {},
      });

      return warns;
    }),
  getBans: authedProcedure
    .meta({
      permissionsRequired: ["VIEW_USERS", "VIEW_BANS"],
    })
    .input(
      z.object({
        uuid: z.uuid(),
      }),
    )
    .query(async ({ input }) => {
      const bans = await db.query.playerBans.findMany({
        with: {
          banVictim: true,
          banAuthor: true,
        },
        where: eq(schema.playerBans.victimId, input.uuid),
      });

      return bans;
    }),
});

export default playerRouter;
