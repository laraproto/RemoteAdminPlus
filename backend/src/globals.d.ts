declare module "bun" {
  interface Env {
    APP_NAME: string;
    API_URL: string;
    URL: string;
    HOSTNAME: string;
    PORT: string;
    DATABASE_URL: string;
    REDIS_PREFIX: string;
    REDIS_URL: string;
    COOKIE_DOMAIN: string;
    APP_SECRET: string;
    JWT_SECRET: string;
  }
}
