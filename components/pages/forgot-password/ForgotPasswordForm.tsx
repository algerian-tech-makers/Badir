"use client";

import React, { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/form-input";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/schemas/forgotPasswordSchema";
import { Loader2, Mail } from "lucide-react";
import AppButton from "@/components/AppButton";
import { toast } from "sonner";
import { requestPasswordResetAction } from "@/actions/password-reset";

export default function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    startTransition(async () => {
      const result = await requestPasswordResetAction(data.email);

      if (result.success) {
        toast.success(
          result.message ||
            "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
        );
        reset();
      } else {
        toast.error(result.error || "حدث خطأ، يرجى المحاولة مرة أخرى");
      }
    });
  };

  return (
    <div className="w-full" dir="rtl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="email"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <FormInput
              type="email"
              name="email"
              label="البريد الإلكتروني"
              placeholder="أدخل بريدك الإلكتروني"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={isPending}
              error={errors.email?.message}
            />
          )}
        />

        <div className="flex-center justify-center">
          <AppButton
            type="submit"
            disabled={isPending}
            border="rounded"
            className="justify-center"
            icon={
              isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )
            }
          >
            {isPending ? <>جاري الإرسال</> : <>إرسال رابط إعادة التعيين</>}
          </AppButton>
        </div>
      </form>
    </div>
  );
}
