"use client";

import TermsPdfPreview from "@/components/terms/TermsPdfPreview";

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
      <TermsPdfPreview
        src={src}
        title={viewerTitle}
        description={viewerDescription}
        toolbar={toolbar}
      />
    </div>
  );
}
