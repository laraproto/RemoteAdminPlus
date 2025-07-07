import { Elysia, t } from "elysia";
import { db, panels } from "@modules/db";
import { createInsertSchema } from "drizzle-typebox";

const _selectPanels = createInsertSchema(panels, {

})

export const query = new Elysia({ prefix: "/query" }).get(
  '/:id', async ({ params: { id }, status}) => {t
    try {
      const panel = await db.query.panels.findFirst({
        where: (panels, { eq }) => eq(panels.id, id),
        columns: {
          id: true,
          description: true,
          domain: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      if (!panel) return status(404, {
        message: "Panel not found"
      })

      return status(200, panel)
    } catch (e) {
      console.log(e)
      return status(500, {
        message: "Something went wrong"
      });
    }
  }, {
    params: t.Object({
      id: t.Number()
    }),
    response: {
      200: t.Omit(_selectPanels, ['ownerId']),
      500: t.Object({
        message: t.String()
      }),
      404: t.Object({
        message: t.String()
      })
    }
  });