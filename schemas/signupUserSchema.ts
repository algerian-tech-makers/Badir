import { z } from "zod";

export const step1Schema = z.object({
  dateOfBirth: z
    .string()
    .min(1, "تاريخ الميلاد مطلوب")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13;
    }, "يجب أن تكون 13 سنة على الأقل"),
  sex: z.enum(["male", "female"], {
    error: "الجنس مطلوب",
  }),
  phone: z
    .string()
    .min(1, "رقم الهاتف مطلوب")
    .regex(/^\d{6,14}$/, "الرجاء إدخال رقم هاتف صحيح (أرقام فقط)"),
  phoneCountryCode: z.string().default("DZ").optional(),
  city: z.string().max(100, "المدينة يجب أن تكون أقل من 100 حرف").optional(),
  state: z
    .string()
    .min(1, "الولاية مطلوبة")
    .max(100, "الولاية يجب أن تكون أقل من 100 حرف"),
  country: z
    .string()
    .max(100, "البلد يجب أن يكون أقل من 100 حرف")
    .default("Algeria"),
  latitude: z
    .number()
    .min(-90, "خط العرض غير صحيح")
    .max(90, "خط العرض غير صحيح")
    .optional(),
  longitude: z
    .number()
    .min(-180, "خط الطول غير صحيح")
    .max(180, "خط الطول غير صحيح")
    .optional(),
});

export const step2Schema = z.object({
  specification: z
    .string()
    .min(1, "التخصص مطلوب")
    .max(100, "التخصص يجب أن يكون أقل من 100 حرف"),
  educationalLevel: z
    .string()
    .min(1, "المستوى التعليمي مطلوب")
    .max(100, "المستوى التعليمي يجب أن يكون أقل من 100 حرف"),
  customEducationalLevel: z
    .string()
    .max(100, "المستوى التعليمي المخصص يجب أن يكون أقل من 100 حرف")
    .optional(),
  currentJob: z
    .string()
    .optional()
    .refine(
      (currentJob) => !currentJob || currentJob.length <= 100,
      "الوظيفة الحالية يجب ألا تتجاوز 100 حرف",
    ),
  bio: z
    .string()
    .optional()
    .refine(
      (bio) => !bio || bio.length <= 1000,
      "النبذة الشخصية يجب أن تكون أقل من 1000 حرف",
    ),
  userType: z.enum(["helper", "participant", "both"], {
    error: "نوع المستخدم مطلوب",
  }),
});

export const step3Schema = z.object({
  acceptConditions: z.boolean().refine((val) => val === true, {
    error: "يجب قبول الشروط والأحكام",
  }),
});

// Combined schema for all steps
export const registrationSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
});

// TypeScript types
export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Options for select inputs
export const sexOptions = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
];

export const educationalLevelOptions = [
  { value: "postgraduate", label: "دراسات عليا" },
  { value: "university", label: "جامعي" },
  { value: "secondary", label: "ثانوي" },
  { value: "other", label: "أخرى" },
];

export const userTypeOptions = [
  { value: "both", label: "كلاهما" },
  { value: "participant", label: "مستفيد" },
  { value: "helper", label: "متطوع" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateStep = (step: number, data: any) => {
  switch (step) {
    case 1:
      return step1Schema.safeParse(data);
    case 2:
      return step2Schema.safeParse(data);
    case 3:
      return step3Schema.safeParse(data);
    default:
      throw new Error("Invalid step number");
  }
};

export const profileDefaultValues: RegistrationFormData = {
  dateOfBirth: "",
  sex: "male",
  phone: "",
  phoneCountryCode: "DZ",
  city: "",
  state: "",
  country: "Algeria",
  latitude: undefined,
  longitude: undefined,

  specification: "",
  educationalLevel: "",
  customEducationalLevel: "",
  currentJob: "",
  bio: "",
  userType: "both",

  acceptConditions: false,
};
