"use client";

import { useRef, useState } from "react";
import AppButton from "@/components/AppButton";
import { Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageManagerProps {
  currentImageUrl: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void> | void;
  shape?: "circle" | "square";
  className?: string;
}

export default function ImageManager({
  currentImageUrl,
  onUpload,
  onDelete,
  shape = "circle",
  className,
}: ImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const isCircle = shape === "circle";

  return (
    <div className={cn("relative inline-block", className)}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {currentImageUrl ? (
        <div
          className={cn(
            "relative overflow-hidden border border-gray-200 shadow-sm",
            isCircle
              ? "h-24 w-24 rounded-full"
              : "aspect-video h-48 w-full rounded-md",
          )}
        >
          <Image
            src={currentImageUrl}
            alt="Current"
            fill
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "relative flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50",
            isCircle
              ? "h-24 w-24 rounded-full"
              : "aspect-video h-48 w-full rounded-md",
          )}
          aria-label="Upload image"
        >
          <Upload
            className={cn("text-gray-400", isCircle ? "h-8 w-8" : "h-10 w-10")}
          />
        </button>
      )}

      {currentImageUrl && onDelete && (
        <AppButton
          type="outline"
          className="absolute -right-2 -bottom-2 flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-full border-gray-200 bg-white p-0 text-red-500 shadow-md hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          onClick={handleDelete}
          disabled={isDeleting || isUploading}
          aria-label="Delete image"
        >
          <Trash2 className="h-5 w-5" />
        </AppButton>
      )}
    </div>
  );
}
