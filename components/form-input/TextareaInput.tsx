"use client";

import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import parse from "html-react-parser";
import { sanitize } from "@/lib/santitize-client";
import { getBaseInputClasses } from "./shared";
import { FormInputProps } from "./types";

export const TextareaInput = ({
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled,
  error,
  rows = 4,
  rtl = true,
  className,
  ...props
}: FormInputProps) => {
  const baseInputClasses = getBaseInputClasses(error);

  return (
    <Textarea
      id={name}
      name={name}
      placeholder={
        placeholder ? String(parse(sanitize(placeholder))) : undefined
      }
      value={value ? String(parse(sanitize(String(value)))) : ""}
      onChange={(e) => {
        const sanitized = sanitize(e.target.value);
        onChange?.(sanitized);
      }}
      onBlur={onBlur}
      disabled={disabled}
      rows={rows}
      className={cn(
        baseInputClasses,
        "scrollbar-rtl resize-none rounded-sm",
        className,
      )}
      style={{
        direction: rtl ? "rtl" : "ltr",
        textAlign: rtl ? "right" : "left",
      }}
      {...props}
    />
  );
};
