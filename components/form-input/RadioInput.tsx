"use client";

import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { FormInputProps } from "./types";

export const RadioInput = ({
  name,
  value,
  onChange,
  disabled,
  options = [],
}: FormInputProps) => {
  return (
    <RadioGroup
      value={(value as string) || ""}
      onValueChange={onChange}
      disabled={disabled}
      className="flex-center w-full flex-wrap justify-center gap-4"
      dir="rtl"
    >
      {options.map((option, index) => (
        <div
          key={option.value + "-" + index}
          className="flex items-center gap-0.5 space-x-4 space-x-reverse"
        >
          <label
            htmlFor={`${name}-${option.value}`}
            className="text-neutrals-600 cursor-pointer whitespace-nowrap"
          >
            {option.label}
          </label>
          <RadioGroupItem
            value={option.value}
            id={`${name}-${option.value}`}
            className="border-neutrals-300 data-[state=checked]:border-secondary-500 data-[state=focus]:ring-secondary-600 border-2 bg-transparent data-[state=focus]:bg-transparent data-[state=focus]:ring-2 data-[state=focus]:ring-offset-2"
          />
        </div>
      ))}
    </RadioGroup>
  );
};
