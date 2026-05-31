"use client";

import { TriangleAlert } from "lucide-react";
import React from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-neutrals-100 text-neutrals-500 min-h-screen">
        <div className="flex min-h-screen flex-col items-center justify-center px-6">
          <div className="w-full max-w-md space-y-8 text-center">
            {/* Critical Error Icon */}
            <div className="bg-state-error mx-auto flex h-32 w-32 items-center justify-center rounded-full shadow-lg">
              <TriangleAlert className="h-16 w-16 text-white" />
            </div>

            {/* Error Content */}
            <div className="space-y-4">
              <h1 className="text-neutrals-700 text-4xl font-bold">
                خطأ نظام حرج
              </h1>

              <p className="text-neutrals-500 text-lg leading-relaxed">
                نعتذر بشدة، حدث خطأ خطير في النظام. يرجى إعادة تحميل الصفحة أو
                المحاولة لاحقاً.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === "development" && (
                <details className="bg-neutrals-200 mt-6 rounded-lg p-4 text-left">
                  <summary className="text-neutrals-600 mb-2 cursor-pointer text-sm font-medium">
                    تفاصيل الخطأ النظام (للمطورين)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div className="text-state-error text-xs break-all">
                      <strong>رسالة الخطأ:</strong> {error.message}
                    </div>
                    {error.digest && (
                      <div className="text-neutrals-600 text-xs">
                        <strong>معرف الخطأ:</strong> {error.digest}
                      </div>
                    )}
                    {error.stack && (
                      <div className="text-neutrals-600 mt-2 text-xs">
                        <strong>مكدس الاستدعاء:</strong>
                        <pre className="mt-1 text-xs whitespace-pre-wrap">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={reset}
                className="bg-primary-500 hover:bg-primary-400 w-full rounded-lg px-8 py-4 text-lg font-bold text-white shadow-md transition-colors duration-200"
              >
                إعادة المحاولة
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="border-primary-500 text-primary-500 hover:bg-primary-50 w-full rounded-lg border-2 bg-transparent px-8 py-4 text-lg font-bold transition-colors duration-200"
              >
                العودة للصفحة الرئيسية
              </button>

              <button
                onClick={() => window.location.reload()}
                className="border-neutrals-400 text-neutrals-600 hover:bg-neutrals-200 w-full rounded-lg border-2 bg-transparent px-8 py-4 font-semibold transition-colors duration-200"
              >
                إعادة تحميل الصفحة
              </button>
            </div>

            {/* Emergency Contact */}
            <div className="border-neutrals-300 border-t pt-8">
              <p className="text-neutrals-400 mb-4 text-sm">
                في حالة استمرار المشكلة، يرجى الاتصال بالدعم الفني
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-neutrals-500">
                  <strong>البريد الإلكتروني:</strong>{" "}
                  <a
                    href="mailto:support@badir.sa"
                    className="text-primary-500 hover:text-primary-400"
                  >
                    help.badir@gmail.com
                  </a>
                </p>
                <p className="text-neutrals-400">
                  يرجى تضمين معرف الخطأ إن وجد في رسالتك
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6">
              <p className="text-neutrals-400 text-xs">
                © 2025 منصة بادر - جميع الحقوق محفوظة
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
