"use client";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FormInputProps } from "./types";

export const SelectInput = ({
  label,
  placeholder,
  value,
  onChange,
  disabled,
  error,
  className,
  options = [],
}: FormInputProps) => {
  return (
    <Select
      value={(value as string) || ""}
      onValueChange={(selectedValue) => onChange?.(selectedValue || "")}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "border-neutrals-300 placeholder:text-neutrals-300 text-neutrals-700 focus:ring-secondary-600 bg-neutrals-100 w-full rounded-full border px-3 py-2 focus:ring-1 focus:outline-none",
          error
            ? "border-state-error focus:border-state-error focus:ring-state-error"
            : "focus:border-secondary-600",
          disabled && "bg-neutrals-200 cursor-not-allowed",
          className,
        )}
        dir="rtl"
      >
        <SelectValue placeholder={placeholder || `اختر ${label}`}>
          {options.find((opt) => opt.value === value)?.label ||
            (value as string)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option, index) => {
          if (
            option &&
            typeof option === "object" &&
            "value" in option &&
            "label" in option
          ) {
            const optionKey = index || `${option.value}-${Math.random()}`;
            return (
              <SelectItem key={optionKey} value={option.value}>
                {option.label}
              </SelectItem>
            );
          } else if (typeof option === "string") {
            return (
              <SelectItem key={`${option}-${Math.random()}`} value={option}>
                {option}
              </SelectItem>
            );
          }
          return null;
        })}
      </SelectContent>
    </Select>
  );
};
