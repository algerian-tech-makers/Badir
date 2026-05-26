"use client";

import { forwardRef, useState } from "react";
import { Input } from "../ui/input";
import parse from "html-react-parser";
import { sanitize } from "@/lib/santitize-client";
import { cn } from "@/lib/utils";
import { getBaseInputClasses } from "./shared";
import { FormInputProps } from "./types";
import { Eye, EyeOff } from "lucide-react";

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
    const [showPassword, setShowPassword] = useState(false);
    const baseInputClasses = getBaseInputClasses(error);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;
    const ltrInputClasses =
      type === "email" || type === "url" || type === "number"
        ? "text-left placeholder:text-right"
        : "";

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={inputType}
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
          className={cn(
            baseInputClasses,
            ltrInputClasses,
            isPassword && "pl-10",
          )}
          dir={
            type === "number" || type === "email" || type === "url"
              ? "ltr"
              : "rtl"
          }
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={
              showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
            }
            className="text-muted-foreground hover:text-foreground absolute inset-y-0 left-0 flex items-center px-3"
            tabIndex={-1}
          >
            {showPassword ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>
    );
  },
);

BasicInput.displayName = "BasicInput";
