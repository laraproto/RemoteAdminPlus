import { appRouter } from "#routes/trpc";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { toORPCRouter } from "@orpc/trpc";
import { playerInsert, playerSelect } from "#modules/db/schema";
import { firstRunConfig } from "../firstrun";

export const orpcRouter = toORPCRouter(appRouter);

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

export const openAPISpec = await openAPIGenerator.generate(orpcRouter, {
  filter: ({ contract }) => !contract["~orpc"].route.tags?.includes("internal"),
  info: {
    title: "RemoteAdminPlus API",
    version: "0.0.1",
  },
  commonSchemas: {
    InputPlayer: {
      strategy: "input",
      schema: playerInsert,
    },
    OutputPlayer: {
      strategy: "output",
      schema: playerSelect,
    },
  },
  servers: [
    {
      url: "/api/rpc",
    },
  ],
});
