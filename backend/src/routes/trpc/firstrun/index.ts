import { firstrunProcedure, router } from "#modules/trpc/index.ts";
import { z } from "zod";
import { DATA_DIR, DATABASE_HINT } from "#modules/config.ts";
import { TRPCError } from "@trpc/server";
import {
  configDB,
  FirstRunConfiguration,
  setFirstRunConfig,
} from "#modules/firstrun/index.ts";
import { db, reconnectDatabase } from "#modules/db";
import { migrate } from "#modules/db/migrator.ts";

const firstrunRouter = router({
  get: firstrunProcedure.query(() => {
    return {
      database_hint: DATABASE_HINT,
      data_dir: DATA_DIR,
    };
  }),
  set: firstrunProcedure
    .input(
      z.object({
        database_url: z
          .string()
          .optional()
          .default(DATABASE_HINT ? DATABASE_HINT : ""),
        app_name: z.string().optional().default("RemoteAdminPlus"),
        admin_username: z.string(),
        admin_password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.database_url === "") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Database URL cannot be empty",
        });
      }

      const password_hashed = await Bun.password.hash(input.admin_password);

      const firstrunGenerated = new FirstRunConfiguration(
        input.database_url,
        input.app_name,
        input.admin_username,
        password_hashed,
      );

      const insertFirstRun = configDB.query(
        `INSERT INTO data (database_url, app_name, admin_username, admin_password) VALUES ($database_url, $app_name, $admin_username, $admin_password);`,
      );

      insertFirstRun.get({
        database_url: firstrunGenerated.database_url,
        app_name: firstrunGenerated.app_name,
        admin_username: firstrunGenerated.admin_username,
        admin_password: firstrunGenerated.admin_password,
      });

      try {
        reconnectDatabase();
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect to database, check your Database URL",
          cause: err,
        });
      }

      try {
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection is not available",
          });
        }
        migrate(db);
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to migrate database",
          cause: err,
        });
      }

      setFirstRunConfig(firstrunGenerated);
    }),
});

export default firstrunRouter;
