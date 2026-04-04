import { cn } from "@/lib/utils";

export const getBaseInputClasses = (error?: string) =>
  cn(
    "w-full border border-neutrals-300 rounded-full px-4 py-2",
    "placeholder:text-neutrals-300 text-neutrals-700",
    "focus:border-secondary-600 focus:ring-1 focus:outline-none",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    error
      ? "border-state-error focus:border-state-error focus:ring-state-error"
      : "focus:ring-secondary-600",
  );

export const renderLabel = (
  name: string,
  label: string,
  isOptional: boolean,
  optionalText: string,
) => (
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

export const renderError = (error?: string) => {
  if (error) {
    return <p className="text-state-error mt-1 text-sm">{error}</p>;
  }
  return null;
};
