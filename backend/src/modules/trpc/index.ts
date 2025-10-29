import type { Session } from "#modules/auth";
import type { UserSelectMinimal } from "#modules/db/schema";
import {
  JointFlags,
  type JointFlagKeys,
} from "@remoteadminplus/shared/common/user";
import { initTRPC, TRPCError } from "@trpc/server";
import { firstRunConfig } from "../firstrun";
import superjson from "superjson";

interface TRPCContext {
  session: Session;
  user: UserSelectMinimal;
  getSessionToken: () => string | undefined;
}

interface Meta {
  permissionsRequired:
    | JointFlagKeys
    | JointFlagKeys[]
    | ((ctx: TRPCContext) => Promise<boolean>);
}

const t = initTRPC
  .context<TRPCContext>()
  .meta<Meta>()
  .create({
    defaultMeta: {
      permissionsRequired: "USER",
    },
    transformer: superjson,
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

  // eslint can fuck off, this is how you're supposed to do it
  // eslint-disable-next-line no-extra-boolean-cast
  if (!!(ctx.user.flags & JointFlags.SUPERADMIN)) {
    return opts.next({
      ctx,
    });
  }

  switch (typeof meta.permissionsRequired) {
    case "string": {
      const mask = JointFlags[meta.permissionsRequired];
      if (
        (ctx.user.group !== null && !!(ctx.user.group?.permissions & mask)) ||
        !!(ctx.user.flags & mask)
      )
        break;
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    case "object": {
      if (!Array.isArray(meta.permissionsRequired)) break; // Fail open for objects that aren't arrays, to stay in line with default case

      let finalMask = 0n;
      for (const perm of meta.permissionsRequired) {
        const mask = JointFlags[perm];
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
      if (await meta.permissionsRequired(ctx)) break;
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    case "bigint": {
      // Flag names preferred!
      if (
        (ctx.user.group !== null &&
          !!(ctx.user.group?.permissions & meta.permissionsRequired)) ||
        !!(ctx.user.flags & meta.permissionsRequired)
      )
        break;
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    default: {
      break; // Fail open for any other type
    }
  }

  return opts.next({
    ctx,
  });
});

export const firstrunProcedure = publicProcedure.use(async (opts) => {
  const { ctx } = opts;
  if (firstRunConfig) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return opts.next({
    ctx,
  });
});

export const registrationProcedure = publicProcedure.use(async (opts) => {
  const { ctx } = opts;
  if (ctx.user || ctx.session === null) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return opts.next({
    ctx,
  });
});
