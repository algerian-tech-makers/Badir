"use server";

import { cookies } from "next/headers";
import {
  SIGNUP_CONSENT_COOKIE,
  SIGNUP_CONSENT_MAX_AGE_SECONDS,
  type SignupConsentKind,
} from "@/lib/signup-consent-config";
import { createSignupConsentToken } from "@/lib/signup-consent-token";

export async function issueSignupConsentAction(kind: SignupConsentKind) {
  if (kind !== "user" && kind !== "organization") {
    return { success: false };
  }

  const cookieStore = await cookies();
  cookieStore.set(SIGNUP_CONSENT_COOKIE, createSignupConsentToken(kind), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SIGNUP_CONSENT_MAX_AGE_SECONDS,
  });

  return { success: true };
}
