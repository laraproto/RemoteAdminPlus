import SchemaBuilder from "@pothos/core";
import { users, server } from "@modules/db";

const builder = new SchemaBuilder<{
  Context: {
    currentUser?: typeof users.$inferSelect;
    server?: typeof server.$inferSelect;
  };
}>({});

builder.queryType({
  fields: (t) => ({
    hello: t.string({
      args: {
        name: t.arg.string(),
      },
      resolve: (parent, { name }, context) => name,
    }),
  }),
});

export const schema = builder.toSchema();
