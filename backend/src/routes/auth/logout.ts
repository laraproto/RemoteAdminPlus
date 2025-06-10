import { Elysia } from "elysia";

const router = new Elysia().post("/logout", ({ cookie: { session } }) => {
  if (session.value === undefined) {
    return { message: "No session to logout from." };
  }

  // Invalidate the session by deleting it
  session.value = undefined;

  return { message: "Successfully logged out." };
});

export default router;
