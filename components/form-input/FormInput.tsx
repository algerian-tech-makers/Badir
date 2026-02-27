"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { FormInputProps } from "./types";
import { renderLabel, renderError } from "./shared";
import { BasicInput } from "./BasicInput";
import { TelInput } from "./TelInput";
import { TextareaInput } from "./TextareaInput";
import { CheckboxInput } from "./CheckboxInput";
import { CheckboxGroupInput } from "./CheckboxGroupInput";
import { SwitchInput } from "./SwitchInput";
import { RadioInput } from "./RadioInput";
import { SelectInput } from "./SelectInput";
import { ComboboxInput } from "./ComboboxInput";
import { FileInput } from "./FileInput";
import { DateInput } from "./DateInput";

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
      isOptional = false,
      optionalText = "اختياري",
      error,
      className,
      rtl = true,
      ...props
    },
    ref,
  ) => {
    const isSwitch = type === "switch";

    const renderInput = () => {
      switch (type) {
        case "date":
          return (
            <DateInput
              type={type}
              name={name}
              label={label}
              error={error}
              {...props}
            />
          );

        case "text":
        case "email":
        case "password":
        case "number":
          return (
            <BasicInput
              ref={ref}
              type={type}
              name={name}
              label={label}
              error={error}
              {...props}
            />
          );

        case "tel":
          return (
            <TelInput
              ref={ref}
              type={type}
              name={name}
              label={label}
              error={error}
              {...props}
            />
          );

        case "textarea":
          return (
            <TextareaInput
              type={type}
              name={name}
              label={label}
              error={error}
              rtl={rtl}
              {...props}
            />
          );

        case "checkbox":
          return (
            <CheckboxInput type={type} name={name} label={label} {...props} />
          );

        case "checkbox-group":
          return (
            <CheckboxGroupInput
              type={type}
              name={name}
              label={label}
              {...props}
            />
          );

        case "switch":
          return (
            <SwitchInput type={type} name={name} label={label} {...props} />
          );

        case "radio":
          return (
            <RadioInput type={type} name={name} label={label} {...props} />
          );

        case "select":
          return (
            <SelectInput
              type={type}
              name={name}
              label={label}
              error={error}
              placeholder={props.placeholder}
              {...props}
            />
          );

        case "combobox":
          return (
            <ComboboxInput
              type={type}
              name={name}
              label={label}
              error={error}
              {...props}
            />
          );

        case "file":
          return (
            <FileInput
              ref={ref}
              type={type}
              name={name}
              label={label}
              error={error}
              {...props}
            />
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
        {type !== "checkbox" &&
          type !== "switch" &&
          renderLabel(name, label, isOptional, optionalText)}
        {renderInput()}
        {renderError(error)}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;
