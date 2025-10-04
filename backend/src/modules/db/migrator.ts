import crypto from "node:crypto";
import {
  type MigrationMeta,
  type MigrationConfig,
  readMigrationFiles,
} from "drizzle-orm/migrator";
import { embeddedFiles } from "bun";
// Drizzle's migrator doesn't seem to touch the snapshot files, so i'm not gonna bother trying to collect them
import journalImport from "./migrations/meta/_journal.json" with { type: "json" };
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Borrowed directly from drizzle source, adapted for Bun embedded files in single file executables
export async function readMigrationFilesEmbedded(): Promise<MigrationMeta[]> {
  const easierToReadFiles: { [p: string]: Blob } = {};

  const thisIsSoStupid: File[] = embeddedFiles as File[];

  thisIsSoStupid.forEach((file) => {
    easierToReadFiles[file.name] = file;
  });

  console.log(easierToReadFiles);

  const migrationQueries: MigrationMeta[] = [];

  const journal: {
    entries: { idx: number; when: number; tag: string; breakpoints: boolean }[];
  } = journalImport;

  for (const journalEntry of journal.entries) {
    const migrationFile = easierToReadFiles[`${journalEntry.tag}.sql`];

    try {
      const query = await migrationFile?.text();

      if (!query) {
        continue;
      }

      const result = query.split("--> statement-breakpoint").map((it) => {
        return it;
      });

      migrationQueries.push({
        sql: result,
        bps: journalEntry.breakpoints,
        folderMillis: journalEntry.when,
        hash: crypto.createHash("sha256").update(query).digest("hex"),
      });
    } catch {
      throw new Error(`No file ${journalEntry.tag}`);
    }
  }

  return migrationQueries;
}

export async function migrate<TSchema extends Record<string, unknown>>(
  db: PostgresJsDatabase<TSchema>,
  config: MigrationConfig,
) {
  let migrations: MigrationMeta[] = [];
  if (!embeddedFiles == false) {
    migrations = await readMigrationFilesEmbedded();
  } else {
    migrations = readMigrationFiles(config);
  }
  //@ts-expect-error I don't know what kind of magic drizzle does but I assume they don't want you to write custom migrators
  await db.dialect.migrate(migrations, db.session, config);
}
