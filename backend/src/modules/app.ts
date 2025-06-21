import Elysia from "elysia";

import { yoga } from "@modules/graphql";
import { routes } from "@routes/index";
import { COOKIE_DOMAIN, NODE_ENV } from "@modules/config";

const app = new Elysia({
  cookie: {
    sameSite: "lax",
    domain: COOKIE_DOMAIN,
    httpOnly: true,
    secure: NODE_ENV !== "development",
  },
})
  .use(routes)
  .get("/graphql", async ({ request }) => yoga.fetch(request), {
    detail: {
      description: "GraphiQL",
      tags: ["App Assets"],
      hide: true,
    },
  })
  .post("/graphql", async ({ request }) => yoga.fetch(request), {
    detail: {
      description: "GraphQL",
      tags: ["App Assets"],
    },
  });

export default app;
