import { BUCKET_MIME_TYPES, BUCKET_SIZE_LIMITS } from "@/types/Statics";
import { z } from "zod";

// Step 1 Schema - Basic organization information
export const signupOrgStep1Schema = z.object({
  shortName: z.string().max(100, "الاسم المختصر طويل جدًا").trim().optional(),

  officialName: z
    .string()
    .min(2, "اسم المنظمة يجب أن يحتوي على ثلاثة أحرف على الأقل")
    .max(300, "الاسم الرسمي طويل جدًا")
    .trim(),

  contactEmail: z.email("الرجاء إدخال بريد إلكتروني صحيح").trim().toLowerCase(),

  foundingDate: z
    .date()
    .optional()
    .refine((date) => {
      if (!date) return true; // allow empty
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

  contactPhoneOrg: z
    .string()
    .regex(/^\d{6,14}$/, "الرجاء إدخال رقم هاتف صحيح (أرقام فقط)"),

  contactPhoneOrgCountryCode: z.string().default("DZ"),
});

// Step 2 Schema - Organization details
export const signupOrgStep2Schema = z.object({
  organizationType: z.enum(
    [
      "charity",
      "youth",
      "educational",
      "cultural",
      "health",
      "religious",
      "other",
    ],
    {
      error: "الرجاء اختيار نوع المنظمة",
    },
  ),

  workAreas: z
    .array(z.string())
    .min(1, "الرجاء اختيار مجال عمل واحد على الأقل"),
});

// Step 3 Schema - Description fields
export const signupOrgStep3Schema = z.object({
  shortDescription: z
    .string()
    .min(20, "الوصف المختصر يجب أن يكون 20 أحرف على الأقل")
    .max(1000, "الوصف المختصر يجب أن يكون أقل من 1000 حرف"),
  previousInitiatives: z
    .string()
    .max(1000, "وصف المبادرات السابقة يجب أن يكون أقل من 1000 حرف")
    .optional(),
});

// Step 4 Schema - Role and permissions
export const signupOrgStep4Schema = z.object({
  role: z
    .string()
    .min(2, "الرجاء إدخال الدور")
    .max(100, "اسم الدور طويل جدًا")
    .trim(),

  contactPhone: z
    .string()
    .regex(/^\d{6,14}$/, "الرجاء إدخال رقم هاتف صحيح (أرقام فقط)")
    .optional(),

  contactPhoneCountryCode: z.string().default("DZ"),
});

// Step 5 Schema - Document uploads
export const signupOrgStep5Schema = z.object({
  // officialLicense: z.string().min(1, "مطلوب تحميل الترخيص الرسمي"),
  officialLicense: z.string().optional(), //? Make optional temporarily
  logo: z.string().min(1, "مطلوب تحميل الشعار"),
  identificationCard: z.string().optional(),
});

// Step 6 Schema - Terms & Conditions
export const signupOrgStep6Schema = z.object({
  acceptConditions: z.boolean().refine((val) => val === true, {
    error: "يجب قبول الشروط والأحكام",
  }),
});

export const signupOrgStep7Schema = z.object({
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
});

export const orgRegistrationSchema = signupOrgStep1Schema
  .and(signupOrgStep2Schema)
  .and(signupOrgStep3Schema)
  .and(signupOrgStep4Schema)
  .and(signupOrgStep5Schema)
  .and(signupOrgStep6Schema)
  .and(signupOrgStep7Schema);

export type SignupOrgStep1Data = z.infer<typeof signupOrgStep1Schema>;
export type SignupOrgStep2Data = z.infer<typeof signupOrgStep2Schema>;
export type SignupOrgStep3Data = z.infer<typeof signupOrgStep3Schema>;
export type SignupOrgStep4Data = z.infer<typeof signupOrgStep4Schema>;
export type SignupOrgStep5Data = z.infer<typeof signupOrgStep5Schema>;
export type SignupOrgStep6Data = z.infer<typeof signupOrgStep6Schema>;
export type SignupOrgStep7Data = z.infer<typeof signupOrgStep7Schema>;

export type OrgRegistrationFormData = z.infer<typeof orgRegistrationSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateOrgStep = (step: number, data: any) => {
  switch (step) {
    case 1:
      return signupOrgStep1Schema.safeParse(data);
    case 2:
      return signupOrgStep7Schema.safeParse(data);
    case 3:
      return signupOrgStep2Schema.safeParse(data);
    case 4:
      return signupOrgStep3Schema.safeParse(data);
    case 5:
      return signupOrgStep4Schema.safeParse(data);
    case 6:
      return signupOrgStep5Schema.safeParse(data);
    case 7:
      return signupOrgStep6Schema.safeParse(data);

    default:
      throw new Error("Invalid step number");
  }
};

// File validation
export const validateFile = (
  file: File,
  bucketName: keyof typeof BUCKET_MIME_TYPES,
) => {
  const allowedTypes = BUCKET_MIME_TYPES[bucketName];
  const maxSize = BUCKET_SIZE_LIMITS[bucketName];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed for ${bucketName}`);
  }

  if (file.size > maxSize) {
    throw new Error(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
  }

  return true;
};

export const organizationDefaultValues: OrgRegistrationFormData = {
  // Step 1: Basic Information
  shortName: "",
  officialName: "",
  contactEmail: "",
  foundingDate: undefined,
  membersCount: undefined,
  headquarters: "",
  city: "",
  state: "",
  country: "Algeria",
  contactPhoneOrg: "",
  contactPhoneOrgCountryCode: "DZ",

  // Step 2: Organization details
  organizationType: "charity" as const,
  workAreas: [],

  // Step 3: Description fields
  shortDescription: "",
  previousInitiatives: "",

  // Step 4: Role and permissions
  role: "",
  contactPhone: "",
  contactPhoneCountryCode: "DZ",

  // Step 5: Document uploads
  officialLicense: "",
  logo: "",
  identificationCard: "",

  // Step 6: Terms & Conditions
  acceptConditions: false,

  // Step 7 (which is in reality 2): Social Links
  facebook: "",
  instagram: "",
  linkedin: "",
  twitter: "",
  youtube: "",
  other: "",
};
