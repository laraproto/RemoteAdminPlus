// Handles all registration

import { validateSessionToken } from "@modules/auth";
import { Elysia } from "elysia";

const router = new Elysia().guard({
  beforeHandle: async ({ cookie: { session }, status }) => {
    if (
      session.value !== undefined &&
      (await validateSessionToken(session.value))
    )
      return status(401);
  },
});

export default router;
