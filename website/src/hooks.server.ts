import type { Handle } from "@sveltejs/kit";
import comm from "$lib/comm";

export const handle: Handle = async ({ event, resolve }) => {

  try {
    if (!event.cookies.get("session")) return resolve(event);
    const user = await comm.get("/auth/me", {
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
    console.error("Error fetching user data:", error);
    event.locals.user = null;
  }



  return resolve(event);
};