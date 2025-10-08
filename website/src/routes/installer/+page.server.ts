import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { type TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@remoteadminplus/backend/trpc";
import trpcServer from "$lib/trpc.server";

export const load: PageServerLoad = async () => {
  try {
    const firstrun = await trpcServer.firstrun.get.query();

    return { firstrun };
  } catch (err) {
    if ((err as TRPCClientError<AppRouter>).message === "FORBIDDEN")
      redirect(307, "/");
  }
};
