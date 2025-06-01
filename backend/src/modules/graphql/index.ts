import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

export const yoga = createYoga({
  cors: false,
  graphiql: Bun.env.NODE_ENV === "development",
  schema,
});
