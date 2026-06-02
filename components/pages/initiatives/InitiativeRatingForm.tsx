"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Ratings from "@/components/Ratings";
import FormInput from "@/components/form-input";
import AppButton from "@/components/AppButton";
import { Card, CardContent } from "@/components/ui/card";
import {
  initiativeRatingSchema,
  InitiativeRatingFormData,
} from "@/schemas/initiativeRatingSchema";
import { submitInitiativeRating } from "@/actions/initiative-rating";

interface InitiativeRatingFormProps {
  initiativeId: string;
  /** The user's existing rating, if they already rated this initiative. */
  initialRating?: {
    rating: number | null;
    comment: string | null;
  } | null;
}

export default function InitiativeRatingForm({
  initiativeId,
  initialRating,
}: InitiativeRatingFormProps) {
  const [isPending, startTransition] = useTransition();
  const hasExistingRating = !!initialRating;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<InitiativeRatingFormData>({
    resolver: zodResolver(initiativeRatingSchema),
    defaultValues: {
      rating: initialRating?.rating ?? 0,
      comment: initialRating?.comment ?? "",
    },
  });

  const onSubmit = (data: InitiativeRatingFormData) => {
    startTransition(async () => {
      const result = await submitInitiativeRating(initiativeId, data);
      if (result.success) {
        toast.success(result.message ?? "تم إرسال تقييمك بنجاح");
      } else if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            setError(field as keyof InitiativeRatingFormData, {
              message: messages[0],
            });
          }
        });
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card className="bg-neutrals-100 border-neutrals-200 rounded-3xl border shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-primary-600 mb-4 text-xl font-semibold">
          {hasExistingRating ? "تعديل تقييمك" : "قيّم هذه المبادرة"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <Ratings
                  value={field.value}
                  onChange={field.onChange}
                  size="lg"
                  isRTL
                />
              )}
            />
            {errors.rating && (
              <p className="text-state-error mt-2 text-sm">
                {errors.rating.message}
              </p>
            )}
          </div>

          <Controller
            control={control}
            name="comment"
            render={({ field }) => (
              <FormInput
                type="textarea"
                name="comment"
                label="تعليق (اختياري)"
                isOptional
                placeholder="شاركنا رأيك في هذه المبادرة"
                rows={4}
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.comment?.message}
              />
            )}
          />

          <AppButton type="submit" size="md" disabled={isPending}>
            {isPending
              ? "جاري الإرسال..."
              : hasExistingRating
                ? "تحديث التقييم"
                : "إرسال التقييم"}
          </AppButton>
        </form>
      </CardContent>
    </Card>
  );
}
