import LoginForm from "@/components/pages/login/LoginForm";
import { authRoutes } from "@/data/routes";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <section className="bg-primary-600 flex min-h-screen w-full items-center justify-center p-4">
      <div className="bg-neutrals-100 flex min-h-150 w-full max-w-7xl flex-col overflow-hidden rounded-xl shadow-2xl sm:flex-row">
        {/* Image Section */}
        <div className="relative h-64 flex-1 sm:h-auto">
          <Image
            src="/images/auth-form-aside.png"
            alt="Volunteer"
            fill
            className="object-cover sm:rounded-r-4xl"
            priority
            style={{
              boxShadow: "3px 0 5px 0 rgba(0, 0, 0, 0.1)",
            }}
          />
        </div>

        {/* Form Section */}
        <div
          className="flex flex-1 flex-col items-start justify-center p-6 max-md:justify-start md:p-8 md:px-10"
          dir="rtl"
        >
          <div className="flex-center-column h-full w-full max-w-full gap-6 md:gap-10">
            {/* Logo */}
            <div className="mb-4 flex justify-start self-start max-md:hidden md:mb-8">
              <Image
                src="/images/logos/logo.svg"
                alt="Badir Logo"
                width={120}
                height={46}
                quality={80}
                className="h-12 w-auto"
              />
            </div>

            {/* Title */}
            <h2 className="text-primary-sm text-primary-600 text-center font-bold md:text-right">
              تسجيل الدخول
            </h2>

            {/* Form */}
            <Suspense fallback={<Loader2 className="h-4 w-4 animate-spin" />}>
              <LoginForm />
            </Suspense>

            {/* Sign up link */}
            <div className="mt-2 pt-4 text-center">
              <p className="text-neutrals-600 text-sm">
                ليس لديك حساب؟{" "}
                <Link
                  href={authRoutes.signup.signupIndividual.url}
                  className="text-primary-400 hover:text-primary-500 font-semibold underline transition-colors duration-200"
                >
                  انضم الآن
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
