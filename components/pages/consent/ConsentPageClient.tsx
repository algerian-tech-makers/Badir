"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import PdfPreview from "@/components/pdf/PdfPreview";
import AppButton from "@/components/AppButton";
import { privacyPolicyConsentAction } from "@/actions/user-profile";
import {
  SIGNUP_CONSENT_DOCUMENT_PATH,
  SIGNUP_CONSENT_VERSION,
} from "@/lib/signup-consent-config";
import { useRouter } from "next/navigation";

export default function ConsentPageClient() {
  const router = useRouter();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canContinue = hasScrolled && accepted && !isPending;

  const confirmConsent = () => {
    if (!canContinue) return;

    startTransition(async () => {
      const result = await privacyPolicyConsentAction();

      if (!result.success) {
        setError(
          result.error ?? "تعذر تسجيل الموافقة. يرجى المحاولة مرة أخرى.",
        );
        return;
      }

      setError(null);
      setDone(true);
      router.push("/");
      router.refresh();
    });
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>تم تسجيل موافقتك على سياسة الخصوصية.</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-5" dir="rtl">
      <div className="space-y-2 text-center md:text-right">
        <h2 className="text-primary-500 text-2xl font-bold">سياسة الخصوصية</h2>
        <p className="text-sm leading-6 text-gray-600">
          يرجى قراءة الملف حتى النهاية ثم تأكيد موافقتك للمتابعة.
        </p>
      </div>

      <PdfPreview
        src={SIGNUP_CONSENT_DOCUMENT_PATH}
        title="معاينة ملف السياسة"
        description={`نسخة الموافقة الحالية: ${SIGNUP_CONSENT_VERSION}`}
        viewerClassName="rounded-md border border-gray-200 bg-gray-50"
        viewerStyle={{ height: "48vh", width: "100%" }}
        toolbar
        onScrolledToEnd={() => setHasScrolled(true)}
      />

      <label className="flex items-start gap-3 rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-700">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-green-600"
          checked={accepted}
          disabled={!hasScrolled || isPending}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <span>أقر بأنني قرأت سياسة الخصوصية وأوافق عليها صراحة.</span>
      </label>

      {!hasScrolled && (
        <p className="text-xs text-amber-700">
          يجب الوصول إلى نهاية الملف قبل تفعيل خانة الموافقة.
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-center">
        <AppButton
          type="primary"
          border="rounded"
          disabled={!canContinue}
          onClick={confirmConsent}
          icon={
            isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined
          }
        >
          {isPending ? "جاري تسجيل الموافقة..." : "تأكيد الموافقة"}
        </AppButton>
      </div>
    </div>
  );
}
