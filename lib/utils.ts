import { Organization, User, UserQualification } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import {
  getCountryCallingCode,
  getCountries,
  CountryCode,
  CountryCallingCode,
} from "libphonenumber-js";
import * as cheerio from "cheerio";
import { countryList } from "@/data/statics";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the file extension from a MIME type.
 * @param mimeType - e.g: "image/png"
 * @returns The corresponding file extension, or an empty string if not found.
 */
export const mimeTypeToExtension = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) {
    return `.${mimeType.replace("image/", "")} `.toUpperCase();
  }
  return `.${mimeType.split("/").pop()} `.toUpperCase();
};

/**
 * Convert a User object and its qualifications to a plain object.
 * @param user - The user object to convert.
 * @param qualifications - The user's qualifications.
 * @returns A plain normalized object representation of the user and his qualifications.
 */
export function toPlainUser(user: User, qualifications?: UserQualification) {
  const qualification: UserQualification | null = qualifications ?? null;

  return {
    ...user,
    qualifications: qualification,
    phoneCountryCode: user.phone
      ? getCountryFromCallingCode(user.phone.split(" ")[0].replace("+", ""))
      : "DZ",
    latitude: user.latitude ? Number(user.latitude) : undefined,
    longitude: user.longitude ? Number(user.longitude) : undefined,
  };
}

/**
 * Convert an organization object to a plain object.
 * @param organization - The organization object to convert.
 * @returns A plain normalized object representation of the organization.
 */
export function toPlainOrganization(
  organization: Organization,
): Partial<Organization> & {
  contactPhoneCountryCode: string;
} {
  if (!organization) return { contactPhoneCountryCode: "DZ" };

  return {
    ...organization,
    contactPhone: organization.contactPhone
      ? organization.contactPhone.split(" ")[1] || ""
      : "",
    contactPhoneCountryCode: organization.contactPhone
      ? getCountryFromCallingCode(
          organization.contactPhone.split(" ")[0].replace("+", ""),
        ) || "DZ"
      : "DZ",
    membersCount: organization.membersCount || 0,
    workAreas: Array.isArray(organization.workAreas)
      ? organization.workAreas
      : [],
  };
}

/**
 * Get calling code from country code. (e.g: "DZ" => "213")
 */
export function getCallingCodeFromCountry(
  countryCode: CountryCode | string,
): string | undefined {
  try {
    return getCountryCallingCode(countryCode as CountryCode);
  } catch {
    return undefined;
  }
}

/**
 * Get country code from calling code (e.g: "213" => "DZ").
 * Returns the first matching country code, or undefined if not found
 */
export function getCountryFromCallingCode(
  callingCode: CountryCallingCode | string,
): string | undefined {
  const countries = getCountries();
  for (const country of countries) {
    if (getCountryCallingCode(country as CountryCode) === callingCode) {
      return country;
    }
  }
  return undefined;
}

export function getTranslatedCountryName(
  countryName: string,
  toLocale: string = "ar",
): string {
  const country = countryList.find((c) => c.labelEn === countryName);
  if (!country) return countryName;
  return toLocale === "ar" ? country.label : country.labelEn;
}

/**
 * Handle file upload, convert to base64 and validate size.
 * @param file - The file to upload.
 * @param fileSize - The maximum file size allowed.
 * @param onChange - Callback function to handle the uploaded file data.
 */
export const handleFileUpload = async (
  file: File | null,
  fileSize: number,
  onChange: (value: { base64: string; name: string; type: string }) => void,
) => {
  if (!file) return;

  if (file.size > fileSize) {
    toast.error(
      `حجم الملف كبير جدًا (الحد الأقصى ${fileSize / 1024 / 1024} ميجابايت)`,
    );
    return;
  }
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  onChange({ base64, name: file.name, type: file.type });
};

/**
 * Format a date to a localized string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Extract all image src attributes from HTML (server-safe, uses cheerio).
 * Returns only non-empty src strings.
 */
export function extractImageSrcsFromHtml(html: string): string[] {
  if (!html) return [];
  const $ = cheerio.load(html);
  const srcs: string[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (src) srcs.push(src);
  });
  return srcs;
}

/**
 * Extract all image src attributes from HTML.
 * Browser version (use in client components).
 * Returns only non-empty src strings.
 */
export function extractImageSrcsFromHtmlBrowser(html: string): string[] {
  if (!html) return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return Array.from(doc.querySelectorAll("img"))
      .map((img) => img.getAttribute("src") || "")
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * normalize/validate src (allow only http(s) or data URIs).
 * Returns null for invalid src.
 */
export function validateImageSrc(src: string): string | null {
  if (!src) return null;
  try {
    // data: images allowed
    if (src.startsWith("data:image/")) return src;
    const u = new URL(src);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
    return null;
  } catch {
    return null;
  }
}
