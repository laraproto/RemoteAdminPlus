import { createYoga } from "graphql-yoga";
import { initContextCache } from "@pothos/core";

import { useCookies } from "@whatwg-node/server-plugin-cookies";

import { schema } from "./schema";
import { validateHeaderAuth, validateUserAuth } from "@middlewares/graphql";

export const yoga = createYoga({
  cors: false,
  graphiql: Bun.env.NODE_ENV === "development",
  schema,
  plugins: [useCookies()],
  context: async (ctx) => ({

    ...initContextCache(),

    currentUser: validateUserAuth(
      (await ctx.request.cookieStore?.get("session"))?.value || "",
    ),
    server: validateHeaderAuth(ctx.request.headers.get("authorization") ?? ""),
  }),
});
