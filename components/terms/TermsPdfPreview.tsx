"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const TermsPdfViewerClient = dynamic(() => import("./TermsPdfViewerClient"), {
  ssr: false,
});

interface TermsPdfPreviewProps {
  src: string;
  title?: string;
  description?: string;
  className?: string;
  viewerClassName?: string;
  viewerStyle?: CSSProperties;
  toolbar?: boolean;
}

export default function TermsPdfPreview({
  src,
  title,
  description,
  className,
  viewerClassName,
  viewerStyle,
  toolbar,
}: TermsPdfPreviewProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {title ? (
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      ) : null}
      {description ? (
        <p className="text-sm text-gray-600">{description}</p>
      ) : null}
      <TermsPdfViewerClient
        src={src}
        className={viewerClassName}
        style={viewerStyle}
        toolbar={toolbar}
      />
    </section>
  );
}
