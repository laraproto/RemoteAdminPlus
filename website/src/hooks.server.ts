import type { Handle } from "@sveltejs/kit";
import client from "$lib/trpc.server";
import type { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@remoteadminplus/backend/trpc";

export const handle: Handle = async ({ event, resolve }) => {
  try {
    if (!event.cookies.get("session")) return resolve(event);
    const user = await client.authed.me.query();
    event.locals.user = user.data as {
      uuid: string;
      username: string;
      emailVerified: boolean;
    } | null;
  } catch (error) {
    if ((error as TRPCClientError<AppRouter>).message === "UNAUTHORIZED")
      return resolve(event);
    console.error("Error fetching user data:", error);
    event.locals.user = null;
  }

  return resolve(event);
};
