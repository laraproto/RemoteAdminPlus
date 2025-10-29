import { appRouter } from "#routes/trpc";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { toORPCRouter } from "@orpc/trpc";

export const orpcRouter = toORPCRouter(appRouter);

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

export const openAPISpec = await openAPIGenerator.generate(orpcRouter, {
  filter: ({ contract }) => !contract["~orpc"].route.tags?.includes("internal"),
  info: {
    title: "RemoteAdminPlus API",
    version: "1.0.0",
  },
  servers: [{ url: "/api/rpc" }],
});

console.log(openAPISpec);
