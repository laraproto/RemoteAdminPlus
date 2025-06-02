import { createYoga } from "graphql-yoga";
import { useCookies } from "@whatwg-node/server-plugin-cookies";

import { schema } from "./schema";

export const yoga = createYoga({
  cors: false,
  graphiql: Bun.env.NODE_ENV === "development",
  schema,
  plugins: [useCookies()],
});
