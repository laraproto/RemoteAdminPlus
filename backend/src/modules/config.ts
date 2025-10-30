import os from "node:os";
import path from "node:path";
import * as fs from "node:fs";

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

export const HOSTNAME = isUndefinedOrEmpty(Bun.env.HOST, "localhost");

export const PORT = parseInt(isUndefinedOrEmpty(Bun.env.PORT, "3000")!);

export const DATA_DIR = (() => {
  const platform = os.type();
  if (isUndefinedOrEmpty(Bun.env.DATA_DIR)) {
    fs.mkdirSync(Bun.env.DATA_DIR, { recursive: true });
    return Bun.env.DATA_DIR;
  }
  switch (platform) {
    case "Linux":
    case "Darwin": {
      const homeDir = os.homedir();
      const data_dir = path.join(homeDir, ".local", "share", "remoteadminplus");
      fs.mkdirSync(data_dir, { recursive: true });
      return data_dir;
    }
    case "Windows_NT": {
      const appData =
        process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
      const data_dir = path.join(appData, "RemoteAdminPlus");
      fs.mkdirSync(data_dir, { recursive: true });
      return data_dir;
    }
    default: {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  }
})();

export const DB_USER = (() => {
  return isUndefinedOrEmpty(Bun.env.DB_USER);
})();

export const DATABASE_HINT = (() => {
  return isUndefinedOrEmpty(Bun.env.DATABASE_HINT);
})();

export const REDIS_PREFIX = isUndefinedOrEmpty(
  Bun.env.REDIS_PREFIX,
  "remoteadminplus:",
);

export const REDIS_PASS = isUndefinedOrEmpty(Bun.env.REDIS_PASS);

export const REDIS_URL = (() => {
  if (!isUndefinedOrEmpty(Bun.env.REDIS_URL))
    return "";

  return Bun.env.REDIS_URL;
})();
