import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import comm from "$lib/comm";

export const GET: RequestHandler = async ({ locals: { user }, url }) => {
  if (!user) error(401, 'Unauthorized');

  const panelContext = url.searchParams.get('panelContext')

  if (!panelContext) return redirect(302, '/panel');

  const axiosResponse = await comm.get(`panel/query/${panelContext}`)

  const panel = axiosResponse.data as {
    id: number,
    domain: string,
  }

  return redirect(302, `/panel/${panel.id}`);
}