import type { Handle } from "@sveltejs/kit";
import client from "$lib/trpc.server";
import type { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@remoteadminplus/backend/trpc";

export const handle: Handle = async ({ event, resolve }) => {
  try {
    const configuration = await client.configuration.query();
    event.locals.configuration = configuration;
  } catch (error) {
    console.error("Error fetching configuration:", error);
    event.locals.configuration = null;
  }

  try {
    const sessionCheck = await client.session.mutate();
    if (sessionCheck.valid) {
      event.cookies.set("session", sessionCheck.authToken, {
        httpOnly: true,
        path: "/",
        sameSite: true,
        expires: sessionCheck.session.expiresAt,
      });
    } else if (!sessionCheck.valid) {
      event.cookies.set("session", sessionCheck.authToken, {
        httpOnly: true,
        path: "/",
        sameSite: true,
        expires: sessionCheck.session.expiresAt,
      });
    }
  } catch (err) {
    console.error("Error validating/creating session:", err);
  }

  try {
    if (!event.cookies.get("session")) return resolve(event);
    const user = await client.authed.authedUser.me.query();
    event.locals.user = user;
  } catch (error) {
    if ((error as TRPCClientError<AppRouter>).message === "UNAUTHORIZED") {
      return resolve(event);
    }
    console.error("Error fetching user data:", error);
    event.locals.user = null;
  }

  return resolve(event);
};
