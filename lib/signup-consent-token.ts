import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import {
  SIGNUP_CONSENT_DOCUMENT_PATH,
  SIGNUP_CONSENT_MAX_AGE_SECONDS,
  SIGNUP_CONSENT_VERSION,
  type SignupConsentKind,
} from "@/lib/signup-consent-config";

export type SignupConsentPayload = {
  kind: SignupConsentKind;
  version: string;
  documentPath: string;
  consentedAt: string;
  expiresAt: number;
};

function getSecret() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required for signup consent");
  }
  return secret;
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createSignupConsentToken(kind: SignupConsentKind) {
  const now = Date.now();
  const payload: SignupConsentPayload = {
    kind,
    version: SIGNUP_CONSENT_VERSION,
    documentPath: SIGNUP_CONSENT_DOCUMENT_PATH,
    consentedAt: new Date(now).toISOString(),
    expiresAt: now + SIGNUP_CONSENT_MAX_AGE_SECONDS * 1000,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function verifySignupConsentToken(token: string | undefined) {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as SignupConsentPayload;

    if (
      payload.version !== SIGNUP_CONSENT_VERSION ||
      payload.documentPath !== SIGNUP_CONSENT_DOCUMENT_PATH ||
      payload.expiresAt < Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
