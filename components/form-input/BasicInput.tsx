"use client";

import { forwardRef } from "react";
import { Input } from "../ui/input";
import parse from "html-react-parser";
import { sanitize } from "@/lib/santitize-client";
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
        className={baseInputClasses}
        dir={type === "number" || type === "email" ? "ltr" : "rtl"}
        {...props}
      />
    );
  },
);

BasicInput.displayName = "BasicInput";
