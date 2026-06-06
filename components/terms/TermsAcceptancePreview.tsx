"use client";

import PdfPreview from "@/components/pdf/PdfPreview";

interface TermsAcceptancePreviewProps {
  src: string;
  viewerTitle?: string;
  viewerDescription?: string;
  toolbar?: boolean;
}

export default function TermsAcceptancePreview({
  src,
  viewerTitle,
  viewerDescription,
  toolbar,
}: TermsAcceptancePreviewProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <PdfPreview
        src={src}
        title={viewerTitle}
        description={viewerDescription}
        toolbar={toolbar}
      />
    </div>
  );
}
