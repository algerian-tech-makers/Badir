"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { InitiativeStatus, ParticipationStatus } from "@prisma/client";
import z from "zod";
import { auth } from "@/lib/auth";
import { InitiativeService } from "@/services/initiatives";
import { ParticipationService } from "@/services/participations";
import {
  initiativeRatingSchema,
  InitiativeRatingFormData,
} from "@/schemas/initiativeRatingSchema";

type SubmitInitiativeRatingResult = {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Partial<Record<keyof InitiativeRatingFormData, string[]>>;
};

/**
 * Submit (or update) the current user's rating for a completed initiative.
 * Only approved participants of a completed initiative may rate it, once.
 */
export async function submitInitiativeRating(
  initiativeId: string,
  formData: InitiativeRatingFormData,
): Promise<SubmitInitiativeRatingResult> {
  const validationResult = initiativeRatingSchema.safeParse(formData);
  if (!validationResult.success) {
    const treeErrors = z.treeifyError(validationResult.error);
    const fieldErrors: Partial<
      Record<keyof InitiativeRatingFormData, string[]>
    > = {};

    if (typeof treeErrors === "object" && treeErrors !== null) {
      for (const [field, fieldError] of Object.entries(treeErrors)) {
        if (
          typeof fieldError === "object" &&
          fieldError !== null &&
          "errors" in fieldError
        ) {
          fieldErrors[field as keyof InitiativeRatingFormData] = (
            fieldError as { errors: string[] }
          ).errors;
        }
      }
    }
    return { success: false, errors: fieldErrors };
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "يجب تسجيل الدخول لإرسال التقييم" };
    }

    const initiative = await InitiativeService.getById(initiativeId);
    if (!initiative) {
      return { success: false, error: "المبادرة غير موجودة" };
    }

    if (initiative.status !== InitiativeStatus.completed) {
      return {
        success: false,
        error: "لا يمكن تقييم المبادرة إلا بعد انتهائها",
      };
    }

    const participation = await ParticipationService.getByIds(
      session.user.id,
      initiativeId,
    );
    if (
      !participation ||
      participation.status !== ParticipationStatus.approved
    ) {
      return {
        success: false,
        error: "يمكن للمشاركين المقبولين فقط تقييم المبادرة",
      };
    }

    await InitiativeService.upsertInitiativeRating(
      session.user.id,
      initiativeId,
      validationResult.data.rating,
      validationResult.data.comment,
    );

    revalidatePath(`/initiatives/${initiativeId}`);
    return { success: true, message: "تم إرسال تقييمك بنجاح" };
  } catch (error) {
    console.error("Error submitting initiative rating:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء إرسال التقييم، يرجى المحاولة مرة أخرى",
    };
  }
}
