import type { AppRouter } from "@remoteadminplus/backend/trpc";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { PUBLIC_API_URL } from "$env/static/public";
import { browser } from "$app/environment";

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: browser ? "/api/trpc" : `${PUBLIC_API_URL}/trpc`,
    }),
  ],
});

export default client;
