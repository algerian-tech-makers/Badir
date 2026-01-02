"use client";

import React, { forwardRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check, CheckIcon, ChevronsUpDown, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import parse from "html-react-parser";
import { sanitize } from "@/lib/santitize-client";
// import DOMPurify from "isomorphic-dompurify";

const priorityCountries = [
  "DZ",
  "SA",
  "AE",
  "KW",
  "QA",
  "BH",
  "OM",
  "JO",
  "LB",
  "EG",
  "MA",
  "TN",
  "LY",
  "SD",
  "SY",
  "YE",
  "IQ",
  "PS",
];
const generateCountryOptions = () => {
  const countries = getCountries();

  const countryOptions = countries
    .map((countryCode) => {
      try {
        const callingCode = getCountryCallingCode(countryCode);
        return {
          code: countryCode,
          name: countryCode,
          callingCode: `+${callingCode}`,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as { code: string; name: string; callingCode: string }[];

  // Sort: priority countries first, then alphabetically by country code
  return countryOptions.sort((a, b) => {
    if (priorityCountries) {
      const aPriority = priorityCountries.indexOf(a.code);
      const bPriority = priorityCountries.indexOf(b.code);

      // If both are priority countries, sort by priority order
      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority;
      }

      // If only one is priority, priority comes first
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
    }

    return a.code.localeCompare(b.code);
  });
};

export interface Option {
  value: string;
  label: string;
}

export interface FormInputProps {
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "date"
    | "checkbox"
    | "checkbox-group"
    | "switch"
    | "textarea"
    | "radio"
    | "select"
    | "combobox"
    | "file";
  label: string;
  name: string;
  placeholder?: string;
  isOptional?: boolean;
  optionalText?: string;
  value?: string | boolean | string[];
  onChange?: (value: string | boolean | string[]) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  options?: Option[]; // For radio, select, combobox
  rows?: number; // For textarea
  rtl?: boolean; // Right-to-left support
  multiple?: boolean; // For multi-select combobox
  min?: number; // For number input
  max?: number; // For number input
  fileAccept?: string[] | string;
  fileMaxSize?: number;
  onFileChange?: (file: File | null, onChange: (value: string) => void) => void;
  showFilePreview?: boolean;
  countryCode?: string;
  onCountryChange?: (countryCode: string) => void;
}

/**
 * A versatile form input component that supports multiple input types with consistent styling and error handling.
 *
 * @component
 * @example
 * ```tsx
 * // Text input example
 * <FormInput
 *   type="text"
 *   label="Name"
 *   name="name"
 *   placeholder="Enter your name"
 *   value={name}
 *   onChange={(value) => setName(value as string)}
 * />
 *
 * // Select example
 * <FormInput
 *   type="select"
 *   label="Country"
 *   name="country"
 *   options={[
 *     { value: "us", label: "United States" },
 *     { value: "ca", label: "Canada" }
 *   ]}
 *   value={selectedCountry}
 *   onChange={(value) => setSelectedCountry(value as string)}
 * />
 *
 * // Multi-select combobox example
 * <FormInput
 *   type="combobox"
 *   label="Skills"
 *   name="skills"
 *   multiple={true}
 *   options={skillOptions}
 *   value={selectedSkills}
 *   onChange={(value) => setSelectedSkills(value as string[])}
 * />
 *
 * // Phone number input example
 * <FormInput
 *   type="tel"
 *   label="Phone Number"
 *   name="phone"
 *   placeholder="5xxxxxxxx"
 *   value={phoneNumber}
 *   countryCode={selectedCountry}
 *   onChange={(value) => setPhoneNumber(value as string)}
 *   onCountryChange={(code) => setSelectedCountry(code)}
 * />
 *
 * // Number input example
 * <FormInput
 *   type="number"
 *   label="Age"
 *   name="age"
 *   placeholder="Enter your age"
 *   value={age}
 *   onChange={(value) => setAge(value as string)}
 * />
 * ```
 *
 * @param {FormInputProps} props - The props for the form input component
 * @param {("text" | "email" | "password" | "number" | "tel" | "date" | "checkbox" | "switch" | "textarea" | "radio" | "select" | "combobox")} props.type - The type of input field to render
 * @param {string} props.label - The label text displayed for the input field
 * @param {string} props.name - The name attribute for the input field, used for form handling and accessibility
 * @param {string} [props.placeholder] - Placeholder text shown when the input is empty
 * @param {boolean} [props.isOptional=false] - Whether the field is optional (affects required indicator display)
 * @param {string} [props.optionalText="اختياري"] - Text displayed for optional fields (defaults to Arabic "optional")
 * @param {(string | boolean | string[])} [props.value] - The current value of the input field
 * @param {(value: string | boolean | string[]) => void} [props.onChange] - Callback function called when the input value changes
 * @param {() => void} [props.onBlur] - Callback function called when the input loses focus
 * @param {string} [props.error] - Error message to display below the input field
 * @param {boolean} [props.disabled=false] - Whether the input field is disabled
 * @param {string} [props.className] - Additional CSS classes to apply to the root container
 * @param {Option[]} [props.options=[]] - Array of options for radio, select, and combobox input types
 * @param {number} [props.rows=4] - Number of rows for textarea input type
 * @param {boolean} [props.rtl=true] - Whether to apply right-to-left text direction
 * @param {boolean} [props.multiple=false] - Whether to allow multiple selections (for combobox type)
 * @param {string} [props.countryCode="DZ"] - The selected country code for phone input (ISO 3166-1 alpha-2)
 * @param {(countryCode: string) => void} [props.onCountryChange] - Callback function called when country code changes (for tel type)
 * @param {React.Ref<HTMLInputElement>} ref - Forwarded ref to the underlying input element
 *
 * @returns {React.ForwardRefExoticComponent} A forwardRef component that renders the appropriate input type with consistent styling
 *
 * @see {@link Option} for the structure of option objects used in select and combobox types
 * @see {@link FormInputProps} for complete props interface definition
 *
 * @author Mohamed Mouloudj
 */
const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      type,
      label,
      name,
      placeholder,
      isOptional = false,
      optionalText = "اختياري",
      value,
      onChange,
      onBlur,
      error,
      disabled = false,
      className,
      options = [],
      rows = 4,
      rtl = true,
      multiple = false,
      countryCode = "DZ",
      onCountryChange,
      fileAccept,
      fileMaxSize,
      onFileChange,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");
    const isSwitch = type === "switch";

    const countryOptions = useMemo(() => {
      if (type === "tel") {
        return generateCountryOptions();
      }
    }, [type]);

    const baseInputClasses = cn(
      "w-full border border-neutrals-300 rounded-full px-4 py-2",
      "placeholder:text-neutrals-300 text-neutrals-700",
      "focus:border-secondary-600 focus:ring-1 focus:outline-none",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      error
        ? "border-state-error focus:border-state-error focus:ring-state-error"
        : "focus:ring-secondary-600",
    );

    const renderLabel = () => (
      <div className="flex-center text-label mb-2 gap-2" dir="rtl">
        <label htmlFor={name} className="text-neutrals-600 font-medium">
          {label}
          {!isOptional && <span className="text-state-error ml-1">*</span>}
        </label>
        {isOptional && (
          <span className="text-neutrals-300 text-sm">({optionalText})</span>
        )}
      </div>
    );

    const renderError = () => {
      if (error) {
        return <p className="text-state-error mt-1 text-sm">{error}</p>;
      }
      return null;
    };

    const renderInput = () => {
      switch (type) {
        case "text":
        case "email":
        case "password":
        case "number":
        case "date":
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

        case "tel": {
          const selectedCountry =
            countryOptions!.find(
              (country) => country.code === (countryCode || "DZ"),
            ) || countryOptions![0];

          return (
            <div className="flex gap-2">
              {/* Phone Number Input */}
              <Input
                ref={ref}
                type="text"
                id={name}
                name={name}
                placeholder={placeholder || "Enter phone number"}
                value={(value as string) || ""}
                onChange={(e) => {
                  // Remove non-numeric characters except + and spaces
                  const cleanedValue = e.target.value.replace(/[^\d\s]/g, "");
                  onChange?.(cleanedValue);
                }}
                onBlur={onBlur}
                disabled={disabled}
                className={cn(baseInputClasses, "flex-1")}
                style={{ direction: "ltr", textAlign: "left" }}
                {...props}
              />
              {/* Country Code Selector */}
              <Select
                value={selectedCountry?.code}
                onValueChange={(value) => onCountryChange?.(value)}
                disabled={disabled}
              >
                <SelectTrigger
                  className={cn(
                    "border-neutrals-300 bg-neutrals-100 w-32 rounded-full border px-3 py-2",
                    "focus:border-secondary-600 focus:ring-secondary-600 focus:ring-1 focus:outline-none",
                    error &&
                      "border-state-error focus:border-state-error focus:ring-state-error",
                    disabled && "bg-neutrals-200 cursor-not-allowed",
                  )}
                >
                  <SelectValue>
                    <span className="text-sm">
                      {selectedCountry?.callingCode}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {countryOptions!.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {country.callingCode}
                        </span>
                        <span className="text-neutrals-500 text-xs">
                          {country.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        case "textarea":
          return (
            <Textarea
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
              rows={rows}
              className={cn(
                baseInputClasses,
                "scrollbar-rtl resize-none",
                className,
              )}
              style={{
                direction: rtl ? "rtl" : "ltr",
                textAlign: rtl ? "right" : "left",
              }}
              {...props}
            />
          );

        case "checkbox":
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
              <label
                htmlFor={name}
                className="text-neutrals-600 cursor-pointer"
              >
                {placeholder || label}
              </label>
            </div>
          );
        case "checkbox-group":
          return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {options.map((option, index) => {
                const isChecked =
                  Array.isArray(value) && value.includes(option.value);

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
                          // Add value if not already present
                          if (!currentValues.includes(option.value)) {
                            onChange?.([...currentValues, option.value]);
                          }
                        } else {
                          // Remove value if present
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

        case "switch":
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

        case "radio":
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

        // In FormInput.tsx, update the select case:
        case "select":
          return (
            <Select
              value={(value as string) || ""}
              onValueChange={(selectedValue) => onChange?.(selectedValue)}
              disabled={disabled}
            >
              <SelectTrigger
                className={cn(
                  "border-neutrals-300 placeholder:text-neutrals-300 text-neutrals-700 focus:ring-secondary-600 bg-neutrals-100 w-full rounded-full border px-3 py-2 focus:ring-1 focus:outline-none",
                  error
                    ? "border-state-error focus:border-state-error focus:ring-state-error"
                    : "focus:border-secondary-600",
                  disabled && "bg-neutrals-200 cursor-not-allowed",
                  className,
                )}
                dir="rtl"
              >
                <SelectValue placeholder={placeholder || `اختر ${label}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option, index) => {
                  // Handle option objects with key, value, and label
                  if (
                    option &&
                    typeof option === "object" &&
                    "value" in option &&
                    "label" in option
                  ) {
                    const optionKey =
                      index || `${option.value}-${Math.random()}`;
                    return (
                      <SelectItem key={optionKey} value={option.value}>
                        {option.label}
                      </SelectItem>
                    );
                  }
                  // Handle simple string arrays (fallback)
                  else if (typeof option === "string") {
                    return (
                      <SelectItem
                        key={`${option}-${Math.random()}`}
                        value={option}
                      >
                        {option}
                      </SelectItem>
                    );
                  }
                  return null;
                })}
              </SelectContent>
            </Select>
          );

        case "combobox":
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
              const selected = options.filter((opt) =>
                valuesArray.includes(opt.value),
              );
              return selected.length > 0
                ? `${selected.length} عنصر محدد`
                : placeholder;
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

        case "file":
          const normalizedFileAccept = Array.isArray(fileAccept)
            ? fileAccept
            : fileAccept?.split(",") || [];

          // Check if a file has been selected (using existing value prop)
          const hasFile =
            value && typeof value === "string" && value.length > 0;

          // Show file name if value is a JSON string (from Step6Documents)
          let selectedFileName = "";
          try {
            if (hasFile) {
              const parsed = JSON.parse(value as string);
              selectedFileName = parsed?.name || value;
            }
          } catch {
            selectedFileName = value as string;
          }

          return (
            <div className="relative">
              <input
                ref={ref}
                type="file"
                id={name}
                name={name}
                accept={
                  Array.isArray(fileAccept) ? fileAccept.join(",") : fileAccept
                }
                disabled={disabled}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  onFileChange?.(file, (val: string) => onChange?.(val));
                }}
                {...props}
              />
              <div
                className={cn(
                  "flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed px-4 py-2",
                  "bg-neutrals-100 hover:bg-neutrals-200 cursor-pointer transition-colors",
                  hasFile ? "border-green-500" : "border-neutrals-300",
                  error && "border-state-error",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <div className="text-center">
                  {/* File status indicator */}
                  {hasFile ? (
                    <div className="flex flex-col items-center">
                      <div className="mb-2 rounded-full bg-green-100 p-2">
                        <CheckIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-green-600">
                        تم اختيار: {selectedFileName}
                      </p>
                      <p className="text-neutrals-500 mt-1 text-xs">
                        انقر لاختيار ملف آخر
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 flex justify-center">
                        <Upload className="text-neutrals-400 h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium">
                        {`انقر لاختيار ${placeholder || "ملف"}`}
                      </p>
                      <p className="text-neutrals-400 mt-1 text-xs">
                        {normalizedFileAccept.join(", ")}
                        {normalizedFileAccept.length
                          ? ` حتى ${fileMaxSize || 10}MB`
                          : "حجم الملف الأقصى 10MB"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div
        className={cn("space-y-1", className)}
        dir={isSwitch ? "ltr" : rtl ? "rtl" : "ltr"}
      >
        {type !== "checkbox" && type !== "switch" && renderLabel()}
        {renderInput()}
        {renderError()}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;
