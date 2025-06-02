import { users, server, db } from "@modules/db";
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

  const hashedKey = await Bun.password.hash(payload.key, {
    algorithm: "bcrypt",
  });

  switch (authType) {
    case "Server":
      const data = await db.query.server.findFirst({
        where: (server, { eq }) =>
          eq(server.id, payload.id) && eq(server.key, hashedKey),
      });

      if (data == undefined) throw new Error("Server not found or invalid key");

      return {
        type: "server",
        data,
      } as Ident;
    case "Bearer":
      // TODO
      break;
  }
};

interface Ident {
  type: "user" | "server";
  data: typeof users.$inferSelect | typeof server.$inferSelect;
}
