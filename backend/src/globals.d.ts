declare module "bun" {
  interface Env {
    API_DOMAIN: string;
    DOMAIN: string;
    HOSTNAME: string;
    PORT: string;
    DATABASE_URL: string;
    REDIS_URL: string;
  }
}
