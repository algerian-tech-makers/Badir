"use client";

import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FormInputProps } from "./types";

export const DateInput = ({
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled,
  showYearDropdown,
  error,
}: FormInputProps) => {
  const [open, setOpen] = useState(false);

  const parseDate = (val: string | boolean | string[] | undefined) => {
    if (!val || typeof val !== "string") return undefined;
    const parsed = parseISO(val);
    return isValid(parsed) ? parsed : undefined;
  };

  const selected = parseDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={name}
        disabled={disabled}
        onBlur={onBlur}
        className={cn(
          "flex w-full items-center justify-start rounded-full border px-4 py-2 text-sm font-normal",
          "focus:ring-1 focus:outline-none",
          selected ? "text-neutrals-700" : "text-neutrals-300",
          error
            ? "border-state-error focus:border-state-error focus:ring-state-error"
            : "border-neutrals-300 focus:border-secondary-600 focus:ring-secondary-600",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <CalendarIcon className="me-2 h-4 w-4 shrink-0" />
        {selected ? (
          formatDate(selected)
        ) : (
          <span>{placeholder || "اختر تاريخاً"}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div>
          <Calendar
            mode="single"
            locale={ar}
            selected={selected}
            defaultMonth={selected}
            captionLayout={showYearDropdown ? "dropdown" : "label"}
            reverseYears={showYearDropdown}
            onSelect={(date) => {
              onChange?.(date ? format(date, "yyyy-MM-dd") : "");
              setOpen(false);
            }}
            dir="rtl"
            autoFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
