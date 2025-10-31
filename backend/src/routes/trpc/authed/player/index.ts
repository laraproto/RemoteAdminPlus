import { authedProcedure, router } from "#modules/trpc";
import { db, schema } from "#modules/db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { JointFlags, platformRegex } from "@remoteadminplus/shared/common/user";

const playerRouter = router({
  createUser: authedProcedure
    .meta({
      permissionsRequired: "VIEW_USERS",
    })
    .input(
      z.object({
        platformId: z.string().min(16).max(64).regex(platformRegex),
        username: z.string().min(3).max(64),
      }),
    )
    .mutation(async ({ input }) => {
      const existingUser = await db.query.player.findFirst({
        where: eq(schema.player.platformId, input.platformId),
      });

      if (existingUser) {
        return {
          success: false,
          user: existingUser,
          message: "User with this platform ID already exists.",
        };
      }

      const newUser = await db.insert(schema.player).values({
        platformId: input.platformId,
        name: input.username,
      });

      return {
        success: !!newUser,
        user: newUser,
        message: newUser
          ? "User created successfully."
          : "Failed to create user.",
      };
    }),
  deleteUser: authedProcedure
    .meta({
      permissionsRequired: ["VIEW_USERS", "DELETE_ROLES"],
    })
    .input(
      z.object({
        uuid: z.uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const deletedUser = await db
        .delete(schema.player)
        .where(eq(schema.player.uuid, input.uuid))
        .returning();

      return {
        success: !!deletedUser[0],
        message: deletedUser[0]
          ? "User deleted successfully."
          : "Failed to delete user.",
        user: deletedUser[0],
      };
    }),
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
        orderBy: [desc(schema.playerWarns.createdAt)],
        with: {
          warnVictim: true,
          warnAuthor: {
            columns: {
              uuid: true,
              username: true,
              displayName: true,
            },
          },
        },
        where: and(
          eq(schema.playerWarns.victimId, input.uuid),
          !canSeeHidden ? eq(schema.playerWarns.hidden, false) : undefined,
        ),
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
        orderBy: [desc(schema.playerBans.createdAt)],
        with: {
          banVictim: true,
          banAuthor: {
            columns: {
              uuid: true,
              username: true,
              displayName: true,
            },
          },
        },
        where: eq(schema.playerBans.victimId, input.uuid),
      });

      return bans;
    }),
  createWarn: authedProcedure
    .meta({
      permissionsRequired: ["VIEW_USERS", "CREATE_WARNINGS"],
    })
    .input(
      z.object({
        uuid: z.uuid(),
        reason: z.string().min(1).max(500),
        hidden: z.boolean().optional().default(false),
        type: z.enum(["tempminor", "tempmajor", "minor", "major"]),
        expiresAt: z.date().optional().default(new Date()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const canCreateHidden =
        (ctx.user.group !== null &&
          !!(
            ctx.user.group?.permissions & JointFlags["CREATE_HIDDEN_WARNINGS"]
          )) ||
        !!(ctx.user.flags & JointFlags["CREATE_HIDDEN_WARNINGS"]);

      const delay = input.expiresAt.getTime() - Date.now();

      const updatedWarn = await db
        .insert(schema.playerWarns)
        .values({
          victimId: input.uuid,
          authorId: ctx.user.uuid,
          reason: input.reason,
          hidden: canCreateHidden ? input.hidden : false,
          type: input.type,
          expiresAt:
            input.type === "tempmajor" || input.type === "tempminor"
              ? input.expiresAt
              : new Date(),
          active:
            input.type === "minor" || input.type === "major" ? true : delay > 0,
        })
        .returning();

      if (!updatedWarn[0]) {
        return {
          success: false,
          message: "Failed to create warn.",
        };
      }

      return {
        success: !!updatedWarn[0],
        warn: updatedWarn[0],
        message: "Warn created successfully",
      };
    }),
  createBan: authedProcedure
    .meta({
      permissionsRequired: ["VIEW_USERS", "CREATE_BANS"],
    })
    .input(
      z.object({
        uuid: z.uuid(),
        reason: z.string().min(1).max(500),
        permanent: z.boolean().default(false),
        expiresAt: z.date().optional().default(new Date()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const delay = input.expiresAt.getTime() - Date.now();

      const newBan = await db
        .insert(schema.playerBans)
        .values({
          victimId: input.uuid,
          authorId: ctx.user.uuid,
          reason: input.reason,
          type: input.permanent ? "permanent" : "temporary",
          expiresAt: input.permanent ? new Date() : input.expiresAt,
          active: input.permanent ? true : delay > 0,
        })
        .returning();

      if (!newBan[0]) {
        return {
          success: false,
          message: "Failed to create ban.",
        };
      }

      return {
        success: !!newBan[0],
        ban: newBan[0],
        message: "Ban created successfully",
      };
    }),
});

export default playerRouter;
