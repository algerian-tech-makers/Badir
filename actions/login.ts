"use server";

import { AUTHORIZED_REDIRECTION } from "@/data/routes";
import { auth } from "@/lib/auth";
import { loginSchema, type LoginFormData } from "@/schemas/loginSchema";
import { headers } from "next/headers";
import z from "zod";

export type LoginState = {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: Partial<Record<keyof LoginFormData, string[]>>;
  redirectTo?: string;
};

export async function loginAction(data: LoginFormData): Promise<LoginState> {
  try {
    const validatedData = loginSchema.parse(data);

    const response = await auth.api.signInEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
      },
      headers: await headers(),
      asResponse: true,
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        };
      } else if (response.status === 400) {
        return {
          success: false,
          error: "البيانات المدخلة غير صحيحة",
        };
      } else {
        return {
          success: false,
          error: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى",
        };
      }
    }

    return {
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      redirectTo: AUTHORIZED_REDIRECTION,
    };
    // Revalidate the session on the client side
  } catch (error) {
    if (error instanceof z.ZodError) {
      const treeError = z.treeifyError(error);
      // Convert the tree structure to field errors format
      const fieldErrors: Partial<Record<keyof LoginFormData, string[]>> = {};

      // Extract field-specific errors from the tree structure
      if (typeof treeError === "object" && treeError !== null) {
        for (const [field, fieldError] of Object.entries(treeError)) {
          if (
            field !== "formErrors" &&
            typeof fieldError === "object" &&
            fieldError !== null &&
            "errors" in fieldError
          ) {
            fieldErrors[field as keyof LoginFormData] = (
              fieldError as { errors: string[] }
            ).errors;
          }
        }
      }

      return {
        success: false,
        errors: fieldErrors,
      };
    }

    console.error("Login error:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى",
    };
  }
}
