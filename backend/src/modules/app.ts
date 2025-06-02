import Elysia from "elysia";

import { yoga } from "@modules/graphql";
import { routes } from "@routes/index";

const app = new Elysia()
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
