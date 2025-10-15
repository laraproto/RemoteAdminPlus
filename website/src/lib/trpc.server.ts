import type { AppRouter } from "@remoteadminplus/backend/trpc";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { getRequestEvent } from "$app/server";
import { SERVER_API_URL, URL } from "$env/static/private";
import superjson from "superjson";

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url:
        !SERVER_API_URL || SERVER_API_URL === ""
          ? `${URL}/api/trpc`
          : `${SERVER_API_URL}/trpc`,
      headers() {
        const { cookies } = getRequestEvent();
        const session = cookies.get("session") ?? "";
        return {
          Authorization: session,
        };
      },
      transformer: superjson,
    }),
  ],
});

export default client;
