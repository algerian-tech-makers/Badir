/**
 * FormInput component utilities
 * @author Mohamed Mouloudj
 */
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";

export const priorityCountries = [
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

/**
 * Generates a list of country options with their calling codes, prioritizing certain countries
 * @returns Array of country options sorted by priority and then alphabetically
 */
export const generateCountryOptions = () => {
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
