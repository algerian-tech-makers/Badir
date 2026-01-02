"use server";

import { initialSignupSchema, type InitialSignupFormData } from "@/schemas";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { UserType } from "@prisma/client";

export type SignupState = {
  success?: boolean;
  message?: string;
  error?: string;
  redirectTo?: string;
};

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
        error: "البيانات المدخلة غير صحيحة. يرجى التحقق من جميع الحقول.",
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
        error:
          "هذا البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني آخر.",
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
          error:
            "هذا البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني آخر.",
        };
      } else if (res.status === 400) {
        return {
          success: false,
          error: "البيانات المدخلة غير صحيحة. يرجى التحقق من جميع الحقول.",
        };
      } else {
        return {
          success: false,
          error: "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.",
        };
      }
    }

    const completeRoute =
      validatedData.data.userType === "both"
        ? "/complete-profile/user"
        : "/complete-profile/organization";

    return {
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      redirectTo: completeRoute,
    };
  } catch (error) {
    console.error("Signup error:", error);

    if (error && typeof error === "object" && "errors" in error) {
      return {
        success: false,
        error: "البيانات المدخلة غير صحيحة. يرجى التحقق من جميع الحقول.",
      };
    }

    return {
      success: false,
      error: "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.",
    };
  }
}
