import type { Handle } from "@sveltejs/kit";
import comm from "$lib/server/comm-server";

export const handle: Handle = async ({ event, resolve }) => {
  try {
    if (!event.cookies.get("session")) return resolve(event);
    const user = await comm.get("/api/auth/me", {
      headers: {
        Authorization: event.cookies.get("session") ?? "",
      },
    });
    event.locals.user = user.data as {
      id: number;
      username: string;
      emailVerified: boolean;
    } | null;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).status === 401) return resolve(event);
    console.error("Error fetching user data:", error);
    event.locals.user = null;
  }

  return resolve(event);
};
