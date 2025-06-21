import { Elysia } from "elysia";
import authMiddleware from "@middlewares/elysia/authMiddleware";

const router = new Elysia()
  .use(authMiddleware({ prefix: "wawa" }))
  .get("/me", async ({ user, status }) => {
    if (!user) {
      return status(401, { message: "Unauthorized" });
    }

    return {
      id: user?.id,
      username: user?.username,
      emailVerified: user?.emailVerified,
    };
  });

export default router;