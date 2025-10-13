import { firstrunProcedure, router } from "#modules/trpc/index";
import { z } from "zod";
import { DATA_DIR, DATABASE_HINT } from "#modules/config";
import { TRPCError } from "@trpc/server";
import {
  configDB,
  firstRunConfig,
  FirstRunConfiguration,
  setFirstRunConfig,
} from "#modules/firstrun/index";
import { db, reconnectDatabase, schema } from "#modules/db";
import { migrate } from "#modules/db/migrator";
import { UserFlags } from "@remoteadminplus/shared/common/user";

const firstrunRouter = router({
  get: firstrunProcedure.query(() => {
    if (firstRunConfig) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Application is already configured",
      });
    }

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

      if (
        input.admin_username === "" ||
        input.admin_password === "" ||
        !input.admin_username ||
        !input.admin_password
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Admin Username or Password cannot be empty",
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

      setFirstRunConfig(firstrunGenerated);

      try {
        reconnectDatabase();
      } catch (err) {
        console.error(err);
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
        await migrate(db);
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to migrate database",
          cause: err,
        });
      }

      try {
        await db.insert(schema.user).values({
          username: firstrunGenerated.admin_username,
          password: firstrunGenerated.admin_password,
          flags: UserFlags.SUPERADMIN,
        });

        insertFirstRun.get({
          database_url: firstrunGenerated.database_url,
          app_name: firstrunGenerated.app_name,
          admin_username: firstrunGenerated.admin_username,
          admin_password: firstrunGenerated.admin_password,
        });

        return {
          success: true,
          redirect: "/login",
          message: "First run wizard complete, please log in",
        };
      } catch (err) {
        console.error(err);
        setFirstRunConfig(null);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to query database, migration scripts probably failed silently",
          cause: err,
        });
      }
    }),
});

export default firstrunRouter;
