declare module "bun" {
  interface Env {
    HOST: string;
    PORT: string;
    DATABASE_HINT: string;
    REDIS_PREFIX: string;
    REDIS_URL: string;
    DATA_DIR: string;
  }
}

declare module "*.sql" {
  const content: string;
  export default content;
}

export {};
