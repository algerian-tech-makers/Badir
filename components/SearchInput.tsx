"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  dir?: "ltr" | "rtl";
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "البحث...",
  className,
  dir = "rtl",
}: SearchInputProps) {
  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (typeof onChange === "function") {
      onChange(value);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0">
      <div className={cn("relative w-full min-w-0", className)} dir={dir}>
        <button
          type="submit"
          className="text-neutrals-400 hover:text-primary-500 absolute top-1/2 left-2 -translate-y-1/2 transform"
        >
          <Search className="h-5 w-5" />
        </button>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-neutrals-300 text-neutrals-700 placeholder-neutrals-400 focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border bg-white py-3 pr-4 pl-10 transition-colors focus:ring-2"
          dir={dir}
        />
      </div>
    </form>
  );
}
