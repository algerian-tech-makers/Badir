import { z } from "zod";

export const MAX_RATING_COMMENT_LENGTH = 1000;

export const initiativeRatingSchema = z.object({
  rating: z
    .number({ error: "يرجى اختيار تقييم" })
    .min(0.5, "أقل تقييم هو نصف نجمة")
    .max(5, "أعلى تقييم هو 5 نجوم")
    .refine((val) => Number.isInteger(val * 2), {
      message: "التقييم يجب أن يكون بمضاعفات نصف النجمة",
    }),
  comment: z
    .string()
    .max(
      MAX_RATING_COMMENT_LENGTH,
      `التعليق يجب أن يكون أقل من ${MAX_RATING_COMMENT_LENGTH} حرف`,
    )
    .optional(),
});

export type InitiativeRatingFormData = z.infer<typeof initiativeRatingSchema>;
