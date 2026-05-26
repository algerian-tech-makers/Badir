"use client";

import { forwardRef } from "react";
import { Input } from "../ui/input";
import parse from "html-react-parser";
import { sanitize } from "@/lib/santitize-client";
import { cn } from "@/lib/utils";
import { getBaseInputClasses } from "./shared";
import { FormInputProps } from "./types";

export const BasicInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      type,
      name,
      placeholder,
      value,
      onChange,
      onBlur,
      disabled,
      error,
      ...props
    },
    ref,
  ) => {
    const baseInputClasses = getBaseInputClasses(error);
    const ltrInputClasses =
      type === "email" || type === "url" || type === "number"
        ? "text-left placeholder:text-right"
        : "";

    return (
      <Input
        ref={ref}
        type={type}
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
        className={cn(baseInputClasses, ltrInputClasses)}
        dir={
          type === "number" || type === "email" || type === "url"
            ? "ltr"
            : "rtl"
        }
        {...props}
      />
    );
  },
);

BasicInput.displayName = "BasicInput";
