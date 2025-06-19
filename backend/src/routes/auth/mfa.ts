import { Elysia, t } from "elysia";

import authMiddleware from "@middlewares/elysia/authMiddleware";
import { encodeBase64, decodeBase64 } from "@oslojs/encoding";
import { renderSVG } from "uqr";
import { createTOTPKeyURI, verifyTOTPWithGracePeriod } from "@oslojs/otp";
import { APP_NAME, DOMAIN } from "@modules/config";
import { db, users } from "@modules/db";
import { decrypt, encrypt } from "@modules/crypto";
import { eq } from "drizzle-orm";
import { setSession2FAVerified } from "@modules/auth";

export const mfa = new Elysia({ prefix: "/mfa", detail: { hide: true } })
  .use(authMiddleware({ requiresMFA: false }))
  .get("/setup", async ({ user, session, status }) => {
    if (!user || !session) {
      return status(401, { message: "Unauthorized" });
    }

    if (user.totpSecret) {
      return status(400, { message: "2FA is already set up for this user." });
    }

    if (session.twoFactorVerified) {
      return status(400, {
        message: "2FA is already verified for this session.",
      });
    }

    const totpKey = new Uint8Array(20);
    crypto.getRandomValues(totpKey);
    const encodedTOTPKey = encodeBase64(totpKey);
    const keyURI = createTOTPKeyURI(
      APP_NAME,
      `${user.username} (${user.email})`,
      totpKey,
      30,
      6,
    );
    const qrcode = renderSVG(keyURI);
    return status(200, {
      message: "2FA Tokens generated",
      encodedTOTPKey,
      qrcode,
    });
  })
  .post(
    "/setup",
    async ({ body: { key, code }, status, user, session }) => {
      if (!user || !session) {
        return status(401, { message: "Unauthorized" });
      }

      const totpKey = decodeBase64(key);
      if (totpKey.byteLength !== 20) {
        return status(400, {
          message: "Invalid TOTP key length. Expected 20 bytes.",
        });
      }

      if (!verifyTOTPWithGracePeriod(totpKey, 30, 6, code, 30)) {
        return status(400, {
          message: "Invalid code",
        });
      }

      db.update(users)
        .set({
          totpSecret: encodeBase64(encrypt(totpKey)),
        })
        .where(eq(users.id, user.id));

      await setSession2FAVerified(session.id);

      return status(200, {
        message: "2FA setup successful",
        // TODO: recovery codes
      });
    },
    {
      body: t.Object({
        key: t.String({ maxLength: 64 }),
        code: t.String({ minLength: 6, maxLength: 6 }),
      }),
    },
  )
  .post(
    "/",
    async ({
      body: { code, panelContext },
      status,
      user,
      session,
      redirect,
    }) => {
      if (!user || !session) {
        return status(401, { message: "Unauthorized" });
      }

      if (!user.totpSecret) {
        return status(400, { message: "2FA is not set up for this user." });
      }

      if (session.twoFactorVerified) {
        return status(400, {
          message: "2FA is already verified for this session.",
        });
      }

      const totpSecret = decrypt(decodeBase64(user.totpSecret));

      if (!verifyTOTPWithGracePeriod(totpSecret, 30, 6, code, 30)) {
        return status(400, { message: "Invalid code" });
      }

      await setSession2FAVerified(session.id);

      return redirect(
        `${DOMAIN}/auth/callback?panelContext=${panelContext}`,
        302,
      );
    },
    {
      body: t.Object({
        code: t.String({ minLength: 6, maxLength: 6 }),
        panelContext: t.Optional(t.Number()),
      }),
    },
  );
