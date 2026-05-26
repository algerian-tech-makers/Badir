import { z } from "zod";

const TRUSTED_DOCUMENT_HOSTS = [
  "drive.google.com",
  "docs.google.com",
  "onedrive.live.com",
  "1drv.ms",
  "sharepoint.com",
  "dropbox.com",
  "www.dropbox.com",
  "box.com",
  "app.box.com",
];

const LEGACY_STORAGE_HOST_KEYWORDS = ["supabase"];

export function isTrustedDocumentPreviewUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;

    const host = url.hostname.toLowerCase();
    return (
      TRUSTED_DOCUMENT_HOSTS.some(
        (trustedHost) =>
          host === trustedHost || host.endsWith(`.${trustedHost}`),
      ) ||
      LEGACY_STORAGE_HOST_KEYWORDS.some((keyword) => host.includes(keyword))
    );
  } catch {
    return false;
  }
}

export const trustedDocumentPreviewLinkSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || isTrustedDocumentPreviewUrl(value), {
    message:
      "يرجى إدخال رابط معاينة موثوق مثل Google Drive أو OneDrive أو Dropbox",
  });
