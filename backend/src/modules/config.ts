import { decodeHex } from "@oslojs/encoding";

const isUndefinedOrEmpty = (
  value: string | undefined,
  replace_value?: string,
) => {
  if (value === undefined || value.trim() === "") {
    return replace_value;
  }
  return value;
};

export const NODE_ENV = isUndefinedOrEmpty(Bun.env.NODE_ENV, "development");

export const APP_NAME = isUndefinedOrEmpty(Bun.env.APP_NAME, "RemoteAdminPlus");

export const API_URL = isUndefinedOrEmpty(
  Bun.env.API_URL,
  "http://localhost:5173/api",
);

export const URL = isUndefinedOrEmpty(Bun.env.URL, "http://localhost:5173");

export const COOKIE_DOMAIN = isUndefinedOrEmpty(
  Bun.env.COOKIE_DOMAIN,
  "localhost",
);

export const HOSTNAME = isUndefinedOrEmpty(Bun.env.HOST, "localhost");

export const PORT = parseInt(isUndefinedOrEmpty(Bun.env.PORT, "3000")!);

export const DATABASE_URL = (() => {
  if (!isUndefinedOrEmpty(Bun.env.DATABASE_URL))
    throw new Error("DATABASE_URL is not set");

  return Bun.env.DATABASE_URL;
})();

export const APP_SECRET = (() => {
  if (!isUndefinedOrEmpty(Bun.env.APP_SECRET))
    throw new Error("APP_SECRET is not set");

  return decodeHex(Bun.env.APP_SECRET);
})();

export const JWT_SECRET = (() => {
  if (!isUndefinedOrEmpty(Bun.env.JWT_SECRET))
    throw new Error("JWT_SECRET is not set");

  return new TextEncoder().encode(Bun.env.JWT_SECRET);
})();

export const REDIS_PREFIX = isUndefinedOrEmpty(
  Bun.env.REDIS_PREFIX,
  "remoteadminplus:",
);

export const REDIS_URL = (() => {
  if (!isUndefinedOrEmpty(Bun.env.REDIS_URL))
    throw new Error("REDIS_URL is not set");

  return Bun.env.REDIS_URL;
})();
