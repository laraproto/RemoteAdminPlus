import { publicProcedure, router } from "#modules/trpc";
import * as auth from "#modules/auth";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import authedRouter from "#routes/trpc/authed";
import firstrunRouter from "#routes/trpc/firstrun";
import registrationRouter from "#routes/trpc/registration";
import { firstRunConfig } from "#modules/firstrun";
import serverRouter from "./server";

export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        name: z.string().nullish(),
      }),
    )
    .output(z.string())
    .query(({ input }) => {
      return `Hello ${input.name ?? "world"}`;
    }),
  session: publicProcedure
    .meta({
      route: {
        tags: ["internal"],
      },
    })
    .mutation(async ({ ctx }) => {
      if (!firstRunConfig) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const authHeader = ctx.getSessionToken();
      if (authHeader && ctx.session) {
        return {
          valid: true,
          session: ctx.session,
          authToken: authHeader,
        };
      }

      const sessionToken = auth.generateSessionToken();
      const session = await auth.createSession(sessionToken);
      return {
        valid: false,
        session,
        authToken: sessionToken,
      };
    }),
  configuration: publicProcedure
    .meta({
      route: {
        description: "what",
      },
    })
    .output(
      z.object({
        appName: z.string(),
        registrationEnabled: z.boolean(),
        url: z.url().nullable(),
      }),
    )
    .query(() => {
      return {
        appName: firstRunConfig?.app_name || "RemoteAdminPlus",
        registrationEnabled: firstRunConfig?.canRegister ?? false,
        url: firstRunConfig?.url || null,
      };
    }),
  authed: authedRouter,
  firstrun: firstrunRouter,
  registration: registrationRouter,
  server: serverRouter,
});

export type AppRouter = typeof appRouter;
