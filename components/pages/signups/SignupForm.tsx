"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupAction } from "@/actions/signup";
import FormInput from "@/components/FormInput";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import AppButton from "@/components/AppButton";
import { ChevronLeft, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { initialSignupSchema, type InitialSignupFormData } from "@/schemas";
import { UserType } from "@prisma/client";
import { useSession } from "@/lib/auth-client";

export function SignupForm() {
  const pathname = usePathname();
  const router = useRouter();
  const isUserSigningUp = pathname.includes("user");
  const [isPending, startTransition] = useTransition();
  const [isRegisterSuccessful, setIsRegisterSuccessful] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InitialSignupFormData>({
    resolver: zodResolver(initialSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: isUserSigningUp ? "both" : ("organization" as UserType),
    },
  });
  const { refetch } = useSession();

  const onSubmit = (data: InitialSignupFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        const result = await signupAction(null, formData);

        if (result.error) {
          setIsRegisterSuccessful(false);
          toast.error(result.error);
        } else if (result.success && result.redirectTo) {
          setIsRegisterSuccessful(true);
          if (result.message) {
            toast.success(result.message);
          }
          router.push(result.redirectTo);
          await refetch?.();
        }
      } catch (error) {
        console.error("Signup error:", error);
        toast.error("حدث خطأ أثناء إنشاء الحساب");
      }
    });
  };

  return (
    <div className="h-full w-full">
      <Card className="w-full border-none bg-transparent shadow-none">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <FormInput
                    label="الاسم الأول"
                    type="text"
                    name={field.name}
                    placeholder="أدخل اسمك الأول"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.firstName?.message}
                    disabled={isPending || isRegisterSuccessful}
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <FormInput
                    label="اسم العائلة"
                    type="text"
                    name={field.name}
                    placeholder="أدخل اسم العائلة"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.lastName?.message}
                    disabled={isPending || isRegisterSuccessful}
                  />
                )}
              />
            </div>

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="البريد الإلكتروني"
                  type="email"
                  name={field.name}
                  placeholder="example@domain.com"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.email?.message}
                  disabled={isPending || isRegisterSuccessful}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="كلمة المرور"
                  type="password"
                  name={field.name}
                  placeholder="أدخل كلمة مرور قوية"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.password?.message}
                  disabled={isPending || isRegisterSuccessful}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="تأكيد كلمة المرور"
                  type="password"
                  name={field.name}
                  placeholder="أعد إدخال كلمة المرور"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.confirmPassword?.message}
                  disabled={isPending || isRegisterSuccessful}
                />
              )}
            />

            <div className="flex-center mt-8 justify-center">
              <AppButton
                type="submit"
                border="rounded"
                disabled={isPending || isRegisterSuccessful}
                icon={
                  isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                  )
                }
              >
                {isPending ? "جاري إنشاء الحساب..." : "أنشئ حسابك"}
              </AppButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
