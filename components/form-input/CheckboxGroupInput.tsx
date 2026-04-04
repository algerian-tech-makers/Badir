"use client";

import { Checkbox } from "../ui/checkbox";
import { FormInputProps } from "./types";

export const CheckboxGroupInput = ({
  name,
  value,
  onChange,
  disabled,
  options = [],
}: FormInputProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((option, index) => {
        const isChecked = Array.isArray(value) && value.includes(option.value);

        return (
          <div
            key={`${name}-${option.value}-${index}`}
            className="flex items-center space-x-2 space-x-reverse"
          >
            <Checkbox
              id={`${name}-${option.value}-${index}`}
              checked={isChecked}
              onCheckedChange={(checked) => {
                if (!Array.isArray(value)) {
                  onChange?.(checked ? [option.value] : []);
                  return;
                }

                const currentValues = [...value];
                if (checked) {
                  if (!currentValues.includes(option.value)) {
                    onChange?.([...currentValues, option.value]);
                  }
                } else {
                  onChange?.(
                    currentValues.filter((val) => val !== option.value),
                  );
                }
              }}
              disabled={disabled}
              className="data-[state=checked]:bg-secondary-500 data-[state=checked]:border-secondary-500 border-neutrals-500"
            />
            <label
              htmlFor={`${name}-${option.value}-${index}`}
              className="text-neutrals-600 cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        );
      })}
    </div>
  );
};
