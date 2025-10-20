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
    if (!event.cookies.get("session")) return resolve(event);
    const user = await client.authed.user.me.query();
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
