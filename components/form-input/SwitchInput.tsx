"use client";

import { Switch } from "../ui/switch";
import { FormInputProps } from "./types";

export const SwitchInput = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  disabled,
}: FormInputProps) => {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={name} className="text-neutrals-600">
        {placeholder || label}
      </label>
      <Switch
        id={name}
        checked={(value as boolean) || false}
        onCheckedChange={onChange}
        disabled={disabled}
        className="data-[state=checked]:bg-secondary-500"
      />
    </div>
  );
};
