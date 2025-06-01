export const API_DOMAIN = Bun.env.API_DOMAIN ?? "http://localhost:3000";

export const DOMAIN = Bun.env.DOMAIN ?? "http://localhost:5173";

export const HOSTNAME = Bun.env.HOSTNAME ?? "localhost";

export const PORT = parseInt(Bun.env.PORT ?? "3000");

export const DATABASE_URL = (() => {
  if (!Bun.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

  return Bun.env.DATABASE_URL;
})();

export const REDIS_URL = (() => {
  if (!Bun.env.REDIS_URL) throw new Error("REDIS_URL is not set");

  return Bun.env.REDIS_URL;
})();
