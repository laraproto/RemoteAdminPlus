import { z } from "zod";

export const schemaCreateServer = z.object({
  description: z.string().max(500),
});

export type SchemaCreateServer = typeof schemaCreateServer;
