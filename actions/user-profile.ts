"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { Decimal } from "@prisma/client/runtime/library";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import {
  registrationSchema,
  type RegistrationFormData,
} from "@/schemas/signupUserSchema";
import { StorageHelpers } from "@/services/supabase-storage";
import { getCallingCodeFromCountry, mimeTypeToExtension } from "@/lib/utils";
import path from "path";
import { UserProfile, validateUserProfile } from "@/schemas";
import { UserService } from "@/services/user";
import { ActionResponse } from "@/types/Statics";
import { getPublicStorageUrl } from "./helpers-sf";
import { AUTHORIZED_REDIRECTION } from "@/data/routes";

export async function updateUserProfileAction(
  data: UserProfile,
): Promise<ActionResponse<UserProfile, {}>> {
  try {
    // Just in case
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session || !session.user) {
      return {
        success: false,
        error: "يجب تسجيل الدخول لتحديث بياناتك الشخصية",
      };
    }

    validateUserProfile(data);

    const userId = session.user.id;
    let imageUrl: string | null = null;

    // Handle image upload if provided
    if (data.image && typeof data.image === "string" && data.image.length > 0) {
      try {
        const { base64, name, type } = JSON.parse(data.image);

        const currentImage = await UserService.getUserImage(userId);

        const fileBuffer = Buffer.from(base64, "base64");
        let ext = path.extname(name);
        if (!ext && type) {
          ext = mimeTypeToExtension(type) || ".bin";
        }

        const fileName = `${uuidv4()}.${name
          .replace(/\s+/g, "-")
          .replace(ext, "")}${ext}`;

        const filePath = `${userId}/${fileName}`;
        const storage = new StorageHelpers();

        const result = await storage.uploadFile(
          "avatars",
          filePath,
          fileBuffer,
          type,
        );

        if (result.path && currentImage && currentImage.image) {
          try {
            await storage.deleteFile("avatars", currentImage.image);
          } catch (deleteError) {
            console.error("Failed to delete old profile image:", deleteError);
          }
        }

        // I added this here because I think setting users image to url directly is way more efficient
        // than fetching it every time from storage bucket
        imageUrl = await getPublicStorageUrl("avatars", result.path);
      } catch (error) {
        console.error("Error uploading profile image:", error);
        return {
          success: false,
          error: "حدث خطأ أثناء رفع الصورة الشخصية، يرجى المحاولة مرة أخرى",
        };
      }
    }

    const formattedPhone = data.phone
      ? data.phoneCountryCode
        ? `+${getCallingCodeFromCountry(data.phoneCountryCode)} ${data.phone}`
        : "+213 " + data.phone
      : undefined;

    // Update user record
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: formattedPhone,
        city: data.city,
        state: data.state,
        country: data.country,
        bio: data.bio || null,
        image: imageUrl || undefined,
        latitude: data.latitude ? new Decimal(data.latitude) : null,
        longitude: data.longitude ? new Decimal(data.longitude) : null,
        updatedAt: new Date(),
      },
    });

    // Update qualifications record
    if (data.qualifications) {
      const existingQualification = await prisma.userQualification.findFirst({
        where: { userId },
      });

      if (existingQualification) {
        await prisma.userQualification.update({
          where: { id: existingQualification.id },
          data: {
            specification: data.qualifications.specification,
            educationalLevel: data.qualifications.educationalLevel,
            currentJob: data.qualifications.currentJob || "",
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.userQualification.create({
          data: {
            userId,
            specification: data.qualifications.specification,
            educationalLevel: data.qualifications.educationalLevel,
            currentJob: data.qualifications.currentJob || "",
          },
        });
      }
    }

    revalidatePath("/profile");

    return {
      success: true,
      message: "تم تحديث البيانات الشخصية بنجاح",
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error instanceof z.ZodError) {
      const treeError = z.treeifyError(error);
      const fieldErrors: Partial<Record<keyof UserProfile, string[]>> = {};

      if (typeof treeError === "object" && treeError !== null) {
        for (const [field, fieldError] of Object.entries(treeError)) {
          if (
            field !== "formErrors" &&
            typeof fieldError === "object" &&
            fieldError !== null &&
            "errors" in fieldError
          ) {
            fieldErrors[field as keyof UserProfile] = (
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
    return {
      success: false,
      error: "حدث خطأ أثناء تحديث البيانات الشخصية، يرجى المحاولة مرة أخرى",
    };
  }
}

export async function completeProfileAction(
  data: RegistrationFormData,
): Promise<
  ActionResponse<
    RegistrationFormData,
    {
      redirectTo: string;
    }
  >
> {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "يجب تسجيل الدخول أولاً",
      };
    }

    const validatedData = registrationSchema.parse(data);

    const finalEducationalLevel =
      validatedData.educationalLevel === "other" &&
      validatedData.customEducationalLevel
        ? validatedData.customEducationalLevel
        : validatedData.educationalLevel;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // Personal Information (Step 1)
        dateOfBirth: new Date(validatedData.dateOfBirth),
        sex: validatedData.sex,
        phone: validatedData.phone,
        city: validatedData.city,
        state: validatedData.state,
        country: validatedData.country,
        latitude: validatedData.latitude
          ? new Decimal(validatedData.latitude)
          : null,
        longitude: validatedData.longitude
          ? new Decimal(validatedData.longitude)
          : null,

        // Bio and user type
        bio: validatedData.bio,
        userType: validatedData.userType,

        // Profile completion flag
        profileCompleted: true,
        updatedAt: new Date(),
      },
    });

    // Create or update UserQualification record
    const existingQualification = await prisma.userQualification.findFirst({
      where: { userId: session.user.id },
    });

    if (existingQualification) {
      await prisma.userQualification.update({
        where: { id: existingQualification.id },
        data: {
          specification: validatedData.specification,
          educationalLevel: finalEducationalLevel,
          currentJob: validatedData.currentJob || "",
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.userQualification.create({
        data: {
          userId: session.user.id,
          specification: validatedData.specification,
          educationalLevel: finalEducationalLevel,
          currentJob: validatedData.currentJob || "",
        },
      });
    }

    return {
      success: true,
      message: "تم إكمال الملف الشخصي بنجاح",
      data: { redirectTo: AUTHORIZED_REDIRECTION },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const treeError = z.treeifyError(error);
      // Convert the tree structure to field errors format
      const fieldErrors: Partial<Record<keyof RegistrationFormData, string[]>> =
        {};

      // Extract field-specific errors from the tree structure
      if (typeof treeError === "object" && treeError !== null) {
        for (const [field, fieldError] of Object.entries(treeError)) {
          if (
            field !== "formErrors" &&
            typeof fieldError === "object" &&
            fieldError !== null &&
            "errors" in fieldError
          ) {
            fieldErrors[field as keyof RegistrationFormData] = (
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

    console.error("Profile completion error:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى",
    };
  }
}

/** Fetch the user image for the currently logged-in user, or a specific user by ID.
 * @returns the image path or null
 */
export async function getUserImage(id?: string): Promise<string | null> {
  try {
    let userId = id;
    if (!userId) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session?.user) return null;
      userId = session.user.id;
    }

    const data = await UserService.getUserImage(userId);
    return data?.image || null;
  } catch (error) {
    console.error("Failed to fetch user image:", error);
    return null;
  }
}
