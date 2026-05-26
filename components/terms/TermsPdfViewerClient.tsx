"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface TermsPdfViewerClientProps {
  src: string;
  className?: string;
  style?: CSSProperties;
  toolbar?: boolean;
  children?: React.ReactNode;
}

export default function TermsPdfViewerClient({
  src,
  className,
  style,
  toolbar = true,
  children,
}: TermsPdfViewerClientProps) {
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const layoutStyle = style ?? { height: "70vh", width: "100%" };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    containerRef.current = node;

    // only update if width actually changed
    setContainerWidth((prev) => {
      const next = node.clientWidth;
      return prev === next ? prev : next;
    });

    if (typeof window === "undefined") return;

    const handleResize = () => {
      setContainerWidth((prev) => {
        const next = node.clientWidth;
        return prev === next ? prev : next;
      });
    };

    window.addEventListener("resize", handleResize);

    // store cleanup in observerRef (reusing it)
    observerRef.current = {
      disconnect: () => window.removeEventListener("resize", handleResize),
    } as ResizeObserver;
  }, []);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const fileName = useMemo(() => {
    const rawName = src.split("/").pop() || "document.pdf";
    try {
      return decodeURIComponent(rawName);
    } catch {
      return rawName;
    }
  }, [src]);

  const pageWidth = containerWidth ?? null;

  return (
    <>
      {toolbar ? (
        <div
          className="mb-4 flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white px-4 py-3"
          dir="rtl"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              معاينة الملف
            </p>
            <p className="truncate text-xs text-gray-500">{fileName}</p>
          </div>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="text-primary-500 hover:text-primary-400 text-sm font-medium"
          >
            فتح الملف
          </a>
        </div>
      ) : null}
      <div
        ref={measuredRef}
        className={cn("w-full overflow-y-auto", className)}
        style={layoutStyle}
        dir="ltr"
      >
        {children}

        <Document
          file={src}
          loading={
            <div className="flex h-[50vh] w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
              جاري تحميل ملف PDF...
            </div>
          }
          error={
            <div className="flex h-[50vh] w-full items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50 px-4 text-center text-sm text-red-600">
              تعذر عرض ملف PDF. تأكد من أن الملف متاح وصحيح.
            </div>
          }
          onLoadSuccess={({ numPages: nextNumPages }) => {
            setNumPages(nextNumPages);
            setLoadError(null);
          }}
          onLoadError={(error) => {
            setLoadError(error.message);
          }}
          className="w-full"
        >
          {loadError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {loadError}
            </div>
          ) : pageWidth ? (
            <div className="space-y-4">
              {Array.from({ length: numPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <div
                    key={pageNumber}
                    className="overflow-hidden border border-gray-200 bg-white shadow-xs"
                  >
                    <Page
                      pageNumber={pageNumber}
                      width={pageWidth}
                      loading={
                        <div className="flex h-[50vh] items-center justify-center text-sm text-gray-500">
                          جاري عرض الصفحة...
                        </div>
                      }
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
                ),
              )}
            </div>
          ) : null}
        </Document>
      </div>
    </>
  );
}
