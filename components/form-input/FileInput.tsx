"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon, Upload } from "lucide-react";
import { FormInputProps } from "./types";

export const FileInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      name,
      placeholder,
      value,
      onChange,
      disabled,
      error,
      fileAccept,
      fileMaxSize,
      onFileChange,
      ...props
    },
    ref,
  ) => {
    const normalizedFileAccept = Array.isArray(fileAccept)
      ? fileAccept
      : fileAccept?.split(",") || [];

    const hasFile = value && typeof value === "string" && value.length > 0;

    let selectedFileName = "";
    try {
      if (hasFile) {
        const parsed = JSON.parse(value as string);
        selectedFileName = parsed?.name || value;
      }
    } catch {
      selectedFileName = value as string;
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          id={name}
          name={name}
          accept={Array.isArray(fileAccept) ? fileAccept.join(",") : fileAccept}
          disabled={disabled}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            onFileChange?.(file, (val: string) => onChange?.(val));
          }}
          {...props}
          type="file"
        />
        <div
          className={cn(
            "flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed px-4 py-2",
            "bg-neutrals-100 hover:bg-neutrals-200 cursor-pointer transition-colors",
            hasFile ? "border-green-500" : "border-neutrals-300",
            error && "border-state-error",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <div className="text-center">
            {hasFile ? (
              <div className="flex flex-col items-center">
                <div className="mb-2 rounded-full bg-green-100 p-2">
                  <CheckIcon className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-600">
                  تم اختيار: {selectedFileName}
                </p>
                <p className="text-neutrals-500 mt-1 text-xs">
                  انقر لاختيار ملف آخر
                </p>
              </div>
            ) : (
              <>
                <div className="mb-2 flex justify-center">
                  <Upload className="text-neutrals-400 h-6 w-6" />
                </div>
                <p className="text-sm font-medium">
                  {`انقر لاختيار ${placeholder || "ملف"}`}
                </p>
                <p className="text-neutrals-400 mt-1 text-xs">
                  {normalizedFileAccept.join(", ")}
                  {normalizedFileAccept.length
                    ? ` حتى ${fileMaxSize || 10}MB`
                    : "حجم الملف الأقصى 10MB"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);

FileInput.displayName = "FileInput";
