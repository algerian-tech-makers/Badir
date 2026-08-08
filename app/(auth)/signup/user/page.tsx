import SignupConsentFlow from "@/components/pages/signups/SignupConsentFlow";
import Image from "next/image";
import Link from "next/link";

export default function UserSignupPage() {
  return (
    <section className="bg-primary-600 flex min-h-screen w-full items-center justify-center p-4">
      <div className="bg-neutrals-100 flex min-h-150 w-full max-w-7xl flex-col overflow-hidden rounded-xl shadow-2xl lg:flex-row">
        {/* Image Section */}
        <div className="relative h-64 flex-1 lg:h-auto">
          <Image
            src="/images/auth-form-aside2.png"
            alt="Volunteer"
            fill
            className="object-cover md:rounded-r-4xl"
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
          <div className="flex-center-column h-full w-full gap-6 md:gap-10">
            {/* Logo */}
            <div className="mb-8 flex justify-start self-start max-md:hidden">
              <Image
                src="/images/logos/logo.svg"
                alt="Badir Logo"
                width={120}
                height={46}
                quality={80}
                className="h-12 w-auto"
              />
            </div>

            {/* Right side - Form */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="space-y-2 text-center md:text-right">
                <h1 className="text-primary-500 text-3xl font-bold lg:text-4xl">
                  مرحباً بك في منصة العمل التطوعي
                </h1>
                <p className="max-w-md text-center text-lg text-gray-600">
                  ابدأ رحلتك في التطوع{" "}
                  <span className="text-primary-500 text-xl font-bold">
                    كمستخدم متطوع
                  </span>{" "}
                  وساهم في بناء مجتمع أفضل
                </p>
              </div>

              <SignupConsentFlow kind="user" />

              <div className="text-center text-sm text-gray-600">
                <p>
                  لديك حساب بالفعل؟{" "}
                  <Link
                    href="/login"
                    className="font-medium text-green-600 hover:text-green-700 hover:underline"
                  >
                    ادخل لحسابك
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
