import { servers, db } from "@modules/db";
import { JWT_SECRET } from "@modules/config";
import * as jose from "jose";
import { validateSessionToken } from "@modules/auth";

export const validateUserAuth = async (token: string) => {
  const session = await validateSessionToken(token);

  if (!session) {
    throw new Error("Invalid session token");
  }

  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, session.userId),
  });
};

export const validateHeaderAuth = async (token: string) => {
  const [authType, authToken] = token.split(" ");

  if (!authType || !authToken) {
    throw new Error("Invalid authorization header format");
  }

  const { payload } = await jose.jwtVerify<{
    id: number;
    key: string;
  }>(authToken, JWT_SECRET);

  switch (authType) {
    case "Server": {
      const data = await db.query.servers.findFirst({
        where: (servers, { eq }) => eq(servers.id, payload.id),
      });

      if (data == undefined) throw new Error("Server not found");

      if (await Bun.password.verify(payload.key, data.key))
        throw new Error("Invalid key");

      return {
        type: "server",
        data,
      } as Ident;
    }
    case "Bearer":
      // TODO
      break;
  }
};

interface Ident {
  type: "user" | "server";
  data: typeof servers.$inferSelect;
}
