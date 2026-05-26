/**
 * FormInput component types and interfaces
 * @author Mohamed Mouloudj
 */

export interface Option {
  value: string;
  label: string;
}

export interface FormInputProps {
  type:
    | "text"
    | "url"
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
  showYearDropdown?: boolean; // For date input
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
