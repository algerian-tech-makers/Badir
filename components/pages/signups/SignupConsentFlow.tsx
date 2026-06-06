"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import PdfPreview from "@/components/pdf/PdfPreview";
import AppButton from "@/components/AppButton";
import { issueSignupConsentAction } from "@/actions/signup-consent";
import {
  SIGNUP_CONSENT_DOCUMENT_PATH,
  SIGNUP_CONSENT_VERSION,
  type SignupConsentKind,
} from "@/lib/signup-consent-config";
import { SignupForm } from "@/components/pages/signups/SignupForm";

interface SignupConsentFlowProps {
  kind: SignupConsentKind;
}

export default function SignupConsentFlow({ kind }: SignupConsentFlowProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [consentReady, setConsentReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canContinue = hasScrolled && accepted && !isPending;

  const confirmConsent = () => {
    if (!canContinue) return;

    startTransition(async () => {
      const result = await issueSignupConsentAction(kind);

      if (!result.success) {
        setError("تعذر تسجيل الموافقة. يرجى المحاولة مرة أخرى.");
        return;
      }

      setError(null);
      setConsentReady(true);
    });
  };

  if (consentReady) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>تم تسجيل موافقتك على الشروط وسياسة الخصوصية.</span>
        </div>
        <SignupForm
          consentVersion={SIGNUP_CONSENT_VERSION}
          consentDocumentPath={SIGNUP_CONSENT_DOCUMENT_PATH}
          onExpiredConsent={setConsentReady.bind(null, false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-5" dir="rtl">
      <div className="space-y-2 text-center md:text-right">
        <h2 className="text-primary-500 text-2xl font-bold">سياسة الخصوصية</h2>
        <p className="text-sm leading-6 text-gray-600">
          يرجى قراءة الملف حتى النهاية ثم تأكيد موافقتك قبل بدء التسجيل.
        </p>
      </div>

      <PdfPreview
        src={SIGNUP_CONSENT_DOCUMENT_PATH}
        title="معاينة ملف السياسة"
        description={`نسخة الموافقة الحالية: ${SIGNUP_CONSENT_VERSION}`}
        viewerClassName="rounded-md border border-gray-200 bg-gray-50"
        viewerStyle={{ height: "48vh", width: "100%" }}
        toolbar
        onScrolledToEnd={() => {
          setHasScrolled(true);
        }}
      />

      <label className="flex items-start gap-3 rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-700">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-green-600"
          checked={accepted}
          disabled={!hasScrolled || isPending}
          onChange={(event) => setAccepted(event.target.checked)}
        />
        <span>أقر بأنني قرأت سياسة الخصوصية وأوافق عليها صراحة.</span>
      </label>

      {!hasScrolled ? (
        <p className="text-xs text-amber-700">
          يجب الوصول إلى نهاية الملف قبل تفعيل خانة الموافقة.
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-center">
        <AppButton
          type="primary"
          border="rounded"
          disabled={!canContinue}
          onClick={confirmConsent}
          icon={
            isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            )
          }
        >
          {isPending ? "جاري تسجيل الموافقة..." : "متابعة التسجيل"}
        </AppButton>
      </div>
    </div>
  );
}
