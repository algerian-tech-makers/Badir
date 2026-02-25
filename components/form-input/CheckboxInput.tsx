"use client";

import { Checkbox } from "../ui/checkbox";
import { FormInputProps } from "./types";

export const CheckboxInput = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  disabled,
}: FormInputProps) => {
  return (
    <div className="flex items-center space-x-2 space-x-reverse">
      <Checkbox
        id={name}
        name={name}
        checked={(value as boolean) || false}
        onCheckedChange={onChange}
        disabled={disabled}
        className="data-[state=checked]:bg-secondary-500 data-[state=checked]:border-secondary-500 border-neutrals-500"
      />
      <label htmlFor={name} className="text-neutrals-600 cursor-pointer">
        {placeholder || label}
      </label>
    </div>
  );
};
