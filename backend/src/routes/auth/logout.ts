import { Elysia } from "elysia";
import { invalidateSession } from "@modules/auth";
import authMiddleware from "@middlewares/elysia/authMiddleware";

const router = new Elysia().use(authMiddleware({ prefix: "wawa"})).post("/logout", async ({ cookie, session, user }) => {
  if (!session || !user) {
    return { message: "No session to logout from." };
  }

  // Invalidate the session by deleting it
  await invalidateSession(session.id, user.id);
  cookie.session.value = undefined;

  return { message: "Successfully logged out." };
});

export default router;
