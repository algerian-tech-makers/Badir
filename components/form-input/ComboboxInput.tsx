"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { getBaseInputClasses } from "./shared";
import { FormInputProps } from "./types";

export const ComboboxInput = ({
  placeholder,
  value,
  onChange,
  disabled,
  error,
  options = [],
  multiple = false,
}: FormInputProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const baseInputClasses = getBaseInputClasses(error);

  const isMultiple = multiple;
  const currentValues = isMultiple
    ? (value as string[]) || []
    : (value as string) || "";

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const handleSelect = (selectedValue: string) => {
    if (isMultiple) {
      const valuesArray = currentValues as string[];
      const newValues = valuesArray.includes(selectedValue)
        ? valuesArray.filter((v: string) => v !== selectedValue)
        : [...valuesArray, selectedValue];
      onChange?.(newValues);
    } else {
      onChange?.(selectedValue === value ? "" : selectedValue);
      setOpen(false);
    }
    setSearchValue("");
  };

  const getDisplayValue = () => {
    if (isMultiple) {
      const valuesArray = (currentValues as string[]) || [];
      const selected = options.filter((opt) => valuesArray.includes(opt.value));
      return selected.length > 0 ? `${selected.length} عنصر محدد` : placeholder;
    }
    const currentValue = (currentValues as string) || "";
    return currentValue
      ? options.find((opt) => opt.value === currentValue)?.label
      : placeholder;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(baseInputClasses, "justify-between")}
          disabled={disabled}
        >
          {getDisplayValue()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="البحث..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>لا توجد نتائج</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {filteredOptions.map((option, index) => {
                const isSelected = isMultiple
                  ? (currentValues as string[]).includes(option.value)
                  : value === option.value;

                return (
                  <CommandItem
                    key={option.value + "-" + index}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
