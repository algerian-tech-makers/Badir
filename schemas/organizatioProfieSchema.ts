import { ORGANIZATION_TYPES, organizationTypeOptions } from "@/types/Profile";
import {
  isTrustedDocumentPreviewUrl,
  trustedDocumentPreviewLinkSchema,
} from "./documentLinkSchema";
import z from "zod";

const OrganizationProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, "اسم المنظمة يجب أن يحتوي على ثلاثة أحرف على الأقل")
      .max(300, "الاسم الرسمي طويل جدًا")
      .trim(),
    shortName: z.string().max(100, "الاسم المختصر طويل جدًا").trim().optional(),
    description: z
      .string()
      .max(1000, "الوصف يجب أن يكون أقل من 1000 حرف")
      .optional(),

    contactEmail: z
      .email("الرجاء إدخال بريد إلكتروني صحيح")
      .trim()
      .toLowerCase(),

    foundingDate: z
      .date()
      .optional()
      .refine((date) => {
        if (!date) return true; // allow empty
        // Date should not be in the future
        const today = new Date();
        return date <= today;
      }, "تاريخ التأسيس لا يمكن أن يكون في المستقبل"),
    membersCount: z
      .number()
      .int("يجب أن يكون عدد الأعضاء عددًا صحيحًا")
      .positive("يجب أن يكون عدد الأعضاء عددًا موجبًا")
      .optional(),

    headquarters: z.string().max(255, "المقر الرئيسي طويل جدًا").optional(),

    city: z
      .string()
      .min(2, "الرجاء إدخال المدينة")
      .max(100, "اسم المدينة طويل جدًا")
      .optional(),

    state: z
      .string()
      .min(2, "الرجاء إدخال الولاية")
      .max(100, "اسم الولاية طويل جدًا")
      .trim(),

    country: z
      .string()
      .min(2, "الرجاء إدخال الدولة")
      .max(100, "اسم الدولة طويل جدًا")
      .default("Algeria"),

    contactPhone: z
      .string()
      .regex(/^\d{6,14}$/, "الرجاء إدخال رقم هاتف صحيح (أرقام فقط)"),

    contactPhoneCountryCode: z.string().default("DZ"),

    organizationType: z.enum(
      Object.keys(ORGANIZATION_TYPES) as [
        keyof typeof ORGANIZATION_TYPES,
        ...Array<keyof typeof ORGANIZATION_TYPES>,
      ],
      {
        error: "الرجاء اختيار نوع المنظمة",
      },
    ),

    workAreas: z
      .array(z.string())
      .min(1, "الرجاء اختيار مجال عمل واحد على الأقل"),

    shortDescription: z.preprocess(
      (val) => (val === null ? undefined : val),
      z
        .string()
        .min(20, "الوصف المختصر يجب أن يكون 20 أحرف على الأقل")
        .max(1000, "الوصف المختصر يجب أن يكون أقل من 1000 حرف")
        .optional(),
    ),

    previousInitiatives: z.preprocess(
      (val) => (val === null ? undefined : val),
      z
        .string()
        .max(1000, "وصف المبادرات السابقة يجب أن يكون أقل من 1000 حرف")
        .optional(),
    ),

    facebook: z
      .url("يرجى إدخال رابط صحيح لصفحة الفايسبوك")
      .optional()
      .or(z.literal("")),

    instagram: z
      .url("يرجى إدخال رابط صحيح لصفحة الأنستغرام")
      .optional()
      .or(z.literal("")),

    linkedin: z
      .url("يرجى إدخال رابط صحيح لصفحة اللينكدين")
      .optional()
      .or(z.literal("")),

    twitter: z
      .url("يرجى إدخال رابط صحيح لحساب تويتر / X")
      .optional()
      .or(z.literal("")),

    youtube: z
      .url("يرجى إدخال رابط صحيح لقناة اليوتيوب")
      .optional()
      .or(z.literal("")),

    other: z.url("يرجى إدخال رابط صحيح").optional().or(z.literal("")),

    userRole: z.string().optional(),

    isLicensed: z.boolean().default(false),
    officialLicense: trustedDocumentPreviewLinkSchema,
    logo: z.string().optional().nullable(),
    // identificationCard: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.isLicensed) return;

    if (!data.officialLicense) {
      ctx.addIssue({
        code: "custom",
        path: ["officialLicense"],
        message: "رابط الترخيص مطلوب عند اختيار أن المنظمة مرخصة",
      });
      return;
    }

    if (!isTrustedDocumentPreviewUrl(data.officialLicense)) {
      ctx.addIssue({
        code: "custom",
        path: ["officialLicense"],
        message:
          "يرجى إدخال رابط معاينة موثوق مثل Google Drive أو OneDrive أو Dropbox",
      });
    }
  });

export type OrganizationProfile = z.infer<typeof OrganizationProfileSchema>;
export default OrganizationProfileSchema;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateOrganizationProfile(data: any) {
  return OrganizationProfileSchema.safeParse(data);
}
