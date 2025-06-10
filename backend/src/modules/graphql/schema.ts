import SchemaBuilder from "@pothos/core";
import { users, servers } from "@modules/db";

const builder = new SchemaBuilder<{
  Context: {
    currentUser?: typeof users.$inferSelect;
    server?: typeof servers.$inferSelect;
  };
}>({});

builder.queryType({
  fields: (t) => ({
    hello: t.string({
      args: {
        name: t.arg.string(),
      },
      resolve: (parent, { name }, context) =>
        `${name}, or should I say ${context.currentUser?.username}`,
    }),
  }),
});

export const schema = builder.toSchema();
