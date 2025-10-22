declare module "bun" {
  interface Env {
    HOST: string;
    PORT: string;
    DATABASE_HINT: string;
    REDIS_PREFIX: string;
    REDIS_URL: string;
    REDIS_PASS: string;
    DATA_DIR: string;
  }
}

declare module "*.sql" {
  const content: string;
  export default content;
}

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

export {};
