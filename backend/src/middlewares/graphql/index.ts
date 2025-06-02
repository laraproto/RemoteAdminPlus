import { users, server, db } from "@modules/db";
import { JWT_SECRET } from "@modules/config";
import * as jose from "jose";
import { validateSessionToken } from "@modules/auth";

export const validateUserAuth = async (token: string) => {
  const session = await validateSessionToken(token);
};

export const validateHeaderAuth = async (token: string) => {
  const [authType, authToken] = token.split(" ");

  if (!authType || !authToken) {
    throw new Error("Invalid authorization header format");
  }

  const { payload } = await jose.jwtVerify(authToken, JWT_SECRET);

  switch (authType) {
    case "Server":
  }
};
