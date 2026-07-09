"use server";

import { initialSignupSchema, type InitialSignupFormData } from "@/schemas";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import { UserType } from "@prisma/client";
import {
  CONSENT_PERSISTENCE_ERROR,
  CONSENT_REQUIRED_ERROR,
  SIGNUP_CONSENT_COOKIE,
  SIGNUP_CONSENT_DOCUMENT_PATH,
  SIGNUP_CONSENT_VERSION,
} from "@/lib/signup-consent-config";
import { verifySignupConsentToken } from "@/lib/signup-consent-token";

export type SignupState = {
  success?: boolean;
  message?: string;
  error?: string;
  redirectTo?: string;
};

// escape Arabic messages for safe embedding in TypeScript string literals
const INVALID_DATA_ERROR =
  "\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u062f\u062e\u0644\u0629 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629. \u064a\u0631\u062c\u0649 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0644.";
const EMAIL_EXISTS_ERROR =
  "\u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0645\u0633\u062a\u062e\u062f\u0645 \u0628\u0627\u0644\u0641\u0639\u0644. \u064a\u0631\u062c\u0649 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0622\u062e\u0631.";
const CREATE_ACCOUNT_ERROR =
  "\u062d\u062f\u062b \u062e\u0637\u0623 \u0623\u062b\u0646\u0627\u0621 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628. \u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.";
const SIGNUP_SUCCESS_MESSAGE =
  "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628 \u0628\u0646\u062c\u0627\u062d";

export async function signupAction(
  _prevState: SignupState | null,
  formData: FormData,
): Promise<SignupState> {
  try {
    const data: InitialSignupFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      userType: formData.get("userType") as UserType,
    };

    const validatedData = initialSignupSchema.safeParse(data);

    if (!validatedData.success) {
      return {
        success: false,
        error: INVALID_DATA_ERROR,
      };
    }

    const cookieStore = await cookies();
    const consent = verifySignupConsentToken(
      cookieStore.get(SIGNUP_CONSENT_COOKIE)?.value,
    );
    const expectedConsentKind =
      validatedData.data.userType === "organization" ? "organization" : "user";
    const consentVersion = formData.get("consentVersion");
    const consentDocumentPath = formData.get("consentDocumentPath");

    if (
      !consent ||
      consent.kind !== expectedConsentKind ||
      consentVersion !== SIGNUP_CONSENT_VERSION ||
      consentDocumentPath !== SIGNUP_CONSENT_DOCUMENT_PATH
    ) {
      return {
        success: false,
        error: CONSENT_REQUIRED_ERROR,
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.data.email,
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: EMAIL_EXISTS_ERROR,
      };
    }

    const res = await auth.api.signUpEmail({
      body: {
        firstName: validatedData.data.firstName,
        lastName: validatedData.data.lastName,
        email: validatedData.data.email,
        password: validatedData.data.password,
        name: `${validatedData.data.firstName} ${validatedData.data.lastName}`,
        userType:
          validatedData.data.userType === "both"
            ? undefined
            : validatedData.data.userType,
      },
      headers: await headers(),
      asResponse: true,
    });

    if (!res.ok) {
      if (res.status === 409) {
        return {
          success: false,
          error: EMAIL_EXISTS_ERROR,
        };
      }

      if (res.status === 400) {
        return {
          success: false,
          error: INVALID_DATA_ERROR,
        };
      }

      return {
        success: false,
        error: CREATE_ACCOUNT_ERROR,
      };
    }

    try {
      await prisma.user.update({
        where: {
          email: validatedData.data.email,
        },
        data: {
          consentGiven: true,
          consentGivenAt: new Date(consent.consentedAt),
          consentVersion: consent.version,
        },
      });
      cookieStore.delete(SIGNUP_CONSENT_COOKIE);
    } catch (consentError) {
      console.error("Failed to persist signup consent:", consentError);

      await prisma.user.delete({
        where: {
          email: validatedData.data.email,
        },
      });

      return {
        success: false,
        error: CONSENT_PERSISTENCE_ERROR,
      };
    }

    const completeRoute =
      validatedData.data.userType === "both"
        ? "/complete-profile/user"
        : "/complete-profile/organization";

    return {
      success: true,
      message: SIGNUP_SUCCESS_MESSAGE,
      redirectTo: completeRoute,
    };
  } catch (error) {
    console.error("Signup error:", error);

    if (error && typeof error === "object" && "errors" in error) {
      return {
        success: false,
        error: INVALID_DATA_ERROR,
      };
    }

    return {
      success: false,
      error: CREATE_ACCOUNT_ERROR,
    };
  }
}
