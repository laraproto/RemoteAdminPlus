import type { Reroute } from "@sveltejs/kit";
import { PUBLIC_DOMAIN } from "$env/static/public";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const reroute: Reroute = async ({ url }) => {
  const split = url.hostname.split(".");

  if (url.hostname !== PUBLIC_DOMAIN && split.length >= 2) {
    return `/panel/${split[0]}${url.pathname}`;
  }
};
