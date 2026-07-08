import PdfPreview from "@/components/pdf/PdfPreview";
import {
  SIGNUP_CONSENT_DOCUMENT_PATH,
  SIGNUP_CONSENT_VERSION,
} from "@/lib/signup-consent-config";

export default function Policies() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:px-8" dir="rtl">
      <PdfPreview
        src={SIGNUP_CONSENT_DOCUMENT_PATH}
        title="معاينة ملف السياسة"
        description={`نسخة الموافقة الحالية: ${SIGNUP_CONSENT_VERSION}`}
        viewerClassName="rounded-md border border-gray-200 bg-gray-50"
        viewerStyle={{ height: "60vh", width: "100%" }}
        toolbar
      />
    </div>
  );
}
