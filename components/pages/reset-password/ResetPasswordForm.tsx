"use client";

import React, { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/form-input";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/schemas/resetPasswordSchema";
import { Loader2, Lock } from "lucide-react";
import AppButton from "@/components/AppButton";
import { toast } from "sonner";
import { resetPasswordAction } from "@/actions/password-reset";
import { useRouter } from "next/navigation";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    startTransition(async () => {
      const result = await resetPasswordAction(token, data.password);

      if (result.success) {
        toast.success(
          result.message ||
            "تم تغيير كلمة المرور بنجاح، سيتم توجيهك لتسجيل الدخول",
        );
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(result.error || "حدث خطأ، يرجى المحاولة مرة أخرى");
      }
    });
  };

  return (
    <div className="w-full" dir="rtl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <FormInput
              type="password"
              name="password"
              label="كلمة المرور الجديدة"
              placeholder="أدخل كلمة المرور الجديدة"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={isPending}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <FormInput
              type="password"
              name="confirmPassword"
              label="تأكيد كلمة المرور"
              placeholder="أعد إدخال كلمة المرور الجديدة"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={isPending}
              error={errors.confirmPassword?.message}
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
                <Lock className="h-4 w-4" />
              )
            }
          >
            {isPending ? <>جاري التحديث</> : <>تحديث كلمة المرور</>}
          </AppButton>
        </div>
      </form>
    </div>
  );
}
