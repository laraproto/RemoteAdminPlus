import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import { db, schema } from "#modules/db";

export function createAccountLinkCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const code = encodeBase64url(bytes);
  return code;
}

export async function createLinkEntry(code: string, playerId: string) {
  const sessionKey = encodeHexLowerCase(sha256(new TextEncoder().encode(code)));
  const linkCode: schema.AccountLinkInsert = {
    code: sessionKey,
    playerId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
  };

  await db.insert(schema.accountLinkCodes).values(linkCode);

  return linkCode;
}

export async function validateLinkEntry(code: string) {
  const apikey = encodeHexLowerCase(sha256(new TextEncoder().encode(code)));
  const result = await db.query.accountLinkCodes.findFirst({
    where: (accountLinkCode, { eq }) => eq(accountLinkCode.code, apikey),
    with: {
      player: true,
    },
  });

  const validated =
    (await schema.accountLinkWithplayer.safeParseAsync(result)).data ?? null;

  return validated;
}
