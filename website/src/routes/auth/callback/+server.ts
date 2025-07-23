import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import comm from "$lib/comm";

export const GET: RequestHandler = async ({ locals: { user }, url }) => {
  if (!user) error(401, "Unauthorized");

  const panelContext = url.searchParams.get("panelContext");

  if (!panelContext || panelContext === "undefined")
    return new Response(null, {
      status: 204,
    });

  const axiosResponse = await comm.get(`/api/panel/query/${panelContext}`);

  const panel = axiosResponse.data as {
    id: number;
    domain: string;
  };

  return json(panel, {
    status: 200,
  });
};
