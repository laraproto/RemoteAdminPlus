import { createYoga } from "graphql-yoga";
import { useCookies } from "@whatwg-node/server-plugin-cookies";

import { schema } from "./schema";
import { validateUserAuth } from "@middlewares/graphql";

export const yoga = createYoga({
  cors: false,
  graphiql: Bun.env.NODE_ENV === "development",
  schema,
  plugins: [useCookies()],
  context: async (ctx) => ({
    currentUser: validateUserAuth(
      (await ctx.request.cookieStore?.get("session"))?.value!,
    ),
  }),
});
