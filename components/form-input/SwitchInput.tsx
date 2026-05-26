"use client";

import { cn } from "@/lib/utils";
import { Switch } from "../ui/switch";
import { FormInputProps } from "./types";

export const SwitchInput = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  disabled,
  className,
}: FormInputProps) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <label htmlFor={name} className="text-neutrals-600">
        {placeholder || label}
      </label>
      <Switch
        id={name}
        checked={(value as boolean) || false}
        onCheckedChange={onChange}
        disabled={disabled}
        className="data-checked:bg-secondary-500"
        dir="rtl"
      />
    </div>
  );
};
