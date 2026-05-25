"use client";

import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { FormInputProps } from "./types";

export const RadioInput = ({
  name,
  value,
  onChange,
  disabled,
  options = [],
  rtl = true,
}: FormInputProps) => {
  return (
    <RadioGroup
      value={(value as string) || ""}
      onValueChange={onChange}
      disabled={disabled}
      className="flex-center w-full flex-wrap"
      dir={rtl ? "rtl" : "ltr"}
    >
      {options.map((option, index) => (
        <div key={option.value + "-" + index} className="flex items-center">
          <RadioGroupItem
            value={option.value}
            id={`${name}-${option.value}`}
            className="border-neutrals-300 data-checked:bg-secondary-500 data-checked:border-secondary-600 data-checked:text-secondary-500 focus-visible:ring-secondary-600 border-2 bg-transparent focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-offset-2"
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="text-neutrals-600 ms-1 cursor-pointer ps-1 pe-2 whitespace-nowrap"
          >
            {option.label}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
};
