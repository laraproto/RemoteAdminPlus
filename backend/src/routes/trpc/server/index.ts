import { db, schema } from "#modules/db";
import * as link from "#modules/link";
import { eq } from "drizzle-orm";
import { serverProcedure, router } from "#modules/trpc/index";
import { platformRegex } from "@remoteadminplus/shared/common/user";
import { z } from "zod";

const serverRouter = router({
  getPlayer: serverProcedure
    .input(
      z.object({
        platformId: z.string().regex(platformRegex),
      }),
    )
    .output(
      z.object({
        success: z.boolean().default(false),
        player: schema.playerSelectBans.nullable(),
        banActive: z.boolean().nullable(),
      }),
    )
    .query(async ({ input }) => {
      const player = await db.query.player.findFirst({
        where: eq(schema.player.platformId, input.platformId),
        with: {
          bans: {
            where: eq(schema.playerBans.active, true),
          },
        },
      });

      if (!player) {
        return {
          success: false,
          player: null,
          banActive: null,
        };
      }

      if (player.bans.length === 0) {
        return {
          success: true,
          player: player,
          banActive: false,
        };
      }

      return {
        success: true,
        player: player,
        banActive: true,
      };
    }),
  createPlayer: serverProcedure
    .input(
      z.object({
        name: z.string(),
        platformId: z.string().regex(platformRegex),
        doNotTrack: z.boolean().default(true),
      }),
    )
    .output(
      z.object({
        success: z.boolean().default(false),
        player: schema.playerSelect.nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      const player = await db.query.player.findFirst({
        where: eq(schema.player.platformId, input.platformId),
      });

      if (player) {
        return {
          success: false,
          player: null,
        };
      }

      const newPlayer = await db
        .insert(schema.player)
        .values({
          name: input.name,
          platformId: input.platformId,
          doNotTrack: input.doNotTrack,
        })
        .returning();

      if (!newPlayer[0]) {
        return {
          success: false,
          player: null,
        };
      }

      return {
        success: true,
        player: newPlayer[0],
      };
    }),
  createBan: serverProcedure
    .input(
      z.object({
        creatorId: z.string().regex(platformRegex),
        platformId: z.string().regex(platformRegex),
        reason: z.string().min(1).max(500),
        duration: z.number(),
        permanent: z.boolean().default(false),
      }),
    )
    .output(
      z.object({
        success: z.boolean().default(false),
        ban: schema.bansSelect.nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      const player = await db.query.player.findFirst({
        where: eq(schema.player.platformId, input.platformId),
      });

      const creatorPlayer = await db.query.player.findFirst({
        where: eq(schema.player.platformId, input.creatorId),
      });

      if (!player || !creatorPlayer || !creatorPlayer.userId) {
        return {
          success: false,
          ban: null,
        };
      }

      const expireDate = new Date(Date.now() + input.duration * 1000);
      const delay = expireDate.getTime() - Date.now();

      const newBan = await db
        .insert(schema.playerBans)
        .values({
          victimId: player.uuid,
          authorId: creatorPlayer.userId,
          reason: input.reason,
          type: input.permanent ? "permanent" : "temporary",
          expiresAt: input.permanent ? new Date() : expireDate,
          active: input.permanent ? true : delay > 0,
        })
        .returning();

      if (!newBan[0]) {
        return {
          success: false,
          ban: null,
        };
      }

      return {
        success: true,
        ban: newBan[0],
      };
    }),
  startAccountLink: serverProcedure
    .input(
      z.object({
        platformId: z.string().regex(platformRegex),
      }),
    )
    .output(
      z.object({
        success: z.boolean().default(false),
        linkToken: z.string().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      const player = await db.query.player.findFirst({
        where: eq(schema.player.platformId, input.platformId),
      });

      if (!player) {
        return {
          success: false,
          linkToken: null,
        };
      }

      const code = link.createAccountLinkCode();

      await link.createLinkEntry(code, player.uuid);

      return {
        success: true,
        linkToken: code,
      };
    }),
  updatePlayer: serverProcedure
    .input(
      z.object({
        platformId: z.string().regex(platformRegex),
        name: z.string().optional(),
        doNotTrack: z.boolean().optional(),
      }),
    )
    .output(
      z.object({
        success: z.boolean().default(false),
        player: schema.playerSelect.nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      const player = await db.query.player.findFirst({
        where: eq(schema.player.platformId, input.platformId),
      });

      if (!player) {
        return {
          success: false,
          player: null,
        };
      }

      const playerUpdate = await db
        .update(schema.player)
        .set({
          name: input.name,
          doNotTrack: input.doNotTrack,
        })
        .where(eq(schema.player.uuid, player.uuid))
        .returning();

      if (!playerUpdate[0]) {
        return {
          success: false,
          player: null,
        };
      }

      return {
        success: true,
        player: playerUpdate[0],
      };
    }),
});

export default serverRouter;
