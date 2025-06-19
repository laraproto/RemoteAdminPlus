import { Elysia } from "elysia";
import { invalidateSession } from "@modules/auth";
import authMiddleware from "@middlewares/elysia/authMiddleware";
import { DOMAIN } from "@modules/config";

const router = new Elysia()
  .use(authMiddleware({ prefix: "wawa" }))
  .post("/logout", async ({ cookie, session, user, status, redirect }) => {
    if (!session || !user) {
      return status(401, { message: "Unauthorized" });
    }

    // Invalidate the session by deleting it
    await invalidateSession(session.id, user.id);
    cookie.session.value = undefined;

    return redirect(`${DOMAIN}`, 302);
  });

export default router;
