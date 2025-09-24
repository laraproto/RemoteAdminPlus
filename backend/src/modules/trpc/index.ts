import type { Session } from "#modules/auth";
import type { UserSelectMinimal } from "#modules/db/schema";
import {
  UserFlags,
  type UserFlagKeys,
} from "@remoteadminplus/shared/common/user";
import { initTRPC, TRPCError } from "@trpc/server";

interface Meta {
  permissionsRequired: UserFlagKeys | UserFlagKeys[] | (() => boolean);
}

const t = initTRPC
  .context<{
    session: Session;
    user: UserSelectMinimal | null;
  }>()
  .meta<Meta>()
  .create({
    defaultMeta: {
      permissionsRequired: "USER",
    },
  });

export const router = t.router;
export const publicProcedure = t.procedure;

export const authedProcedure = publicProcedure.use(async (opts) => {
  const { meta, ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (meta === undefined) {
    return opts.next({
      ctx,
    });
  }

  switch (typeof meta.permissionsRequired) {
    case "string": {
      const mask = UserFlags[meta.permissionsRequired];
      if (
        (ctx.user.group !== null && !!(ctx.user.group?.permissions & mask)) ||
        !!(ctx.user.flags & mask)
      )
        break;
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    case "object": {
      if (!Array.isArray(meta.permissionsRequired))
        throw new TRPCError({ code: "FORBIDDEN" }); // Fail closed in an event of a code mistake

      let finalMask = 0n;
      for (const perm of meta.permissionsRequired) {
        const mask = UserFlags[perm];
        finalMask |= mask;
      }

      if (
        (ctx.user.group !== null &&
          !!(ctx.user.group?.permissions & finalMask)) ||
        !!(ctx.user.flags & finalMask)
      )
        break;
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    case "function": {
      if (meta.permissionsRequired()) break;
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    default: {
      break; // Fail open for any other type, I need to add bigint support eventually, flag names are preferred though
    }
  }

  return opts.next({
    ctx,
  });
});
