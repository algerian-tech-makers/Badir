"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/FormInput";
import { loginAction } from "@/actions/login";
import { loginSchema, type LoginFormData } from "@/schemas/loginSchema";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import AppButton from "@/components/AppButton";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const [isLoginSuccessful, setIsLoginSuccessful] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const { refetch } = useSession();

  const onSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      const result = await loginAction(data);

      if (result.success && result.redirectTo) {
        setIsLoginSuccessful(true);
        if (result.message) {
          toast.success(result.message);
        }
        const callbackFromSearchParams = searchParams.get("callbackUrl");
        if (callbackFromSearchParams) {
          router.replace(callbackFromSearchParams);
          return;
        }
        router.replace(result.redirectTo);
        await refetch?.();
      } else {
        setIsLoginSuccessful(false);
        if (result.errors) {
          // Set field-specific errors from server
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              setError(field as keyof LoginFormData, {
                message: messages[0],
              });
            }
          });
        } else if (result.error) {
          toast.error(result.error);
        }
      }
    });
  };

  // Clear server errors when user starts typing
  useEffect(() => {
    const subscription = watch(() => {
      clearErrors();
    });
    return () => subscription.unsubscribe();
  }, [watch, clearErrors]);

  return (
    <div className="w-full" dir="rtl">
      {/* Form */}
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

        <div className="space-y-2">
          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <FormInput
                type="password"
                name="password"
                label="كلمة المرور"
                placeholder="أدخل كلمة المرور"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={isPending}
                error={errors.password?.message}
              />
            )}
          />

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-primary-400 hover:text-primary-500 text-sm font-medium underline transition-colors duration-200"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex-center justify-center">
          <AppButton
            type="submit"
            disabled={isPending || isLoginSuccessful}
            border="rounded"
            className="justify-center"
            icon={
              isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )
            }
          >
            {isPending ? <>جاري تسجيل الدخول</> : <>تسجيل الدخول</>}
          </AppButton>
        </div>
      </form>
    </div>
  );
}
