import z from "zod";

const UserProfileSchema = z.object({
  email: z.email("الرجاء إدخال بريد إلكتروني صحيح").trim().toLowerCase(),
  firstName: z
    .string()
    .min(2, "الاسم الأول يجب أن يكون على الأقل 2 حرف")
    .max(100, "الاسم الأول يجب أن يكون أقل من 100 حرف"),
  lastName: z
    .string()
    .min(2, "الاسم الأخير يجب أن يكون على الأقل 2 حرف")
    .max(100, "الاسم الأخير يجب أن يكون أقل من 100 حرف"),
  sex: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.enum(["male", "female", "unspecified"]).optional(),
  ),
  phone: z
    .union([
      z.string().regex(/^\d{6,14}$/, "الرجاء إدخال رقم هاتف صحيح (أرقام فقط)"),
      z.literal(""),
      z.null(), // this is for when
    ])
    .optional(),
  phoneCountryCode: z.string(),
  city: z.string().max(100, "المدينة يجب أن تكون أقل من 100 حرف").optional(),
  state: z
    .string()
    .min(1, "الولاية مطلوبة")
    .max(100, "الولاية يجب أن تكون أقل من 100 حرف"),
  country: z
    .string({ message: "البلد مطلوب" })
    .min(1, "البلد مطلوب")
    .max(100, "البلد يجب أن يكون أقل من 100 حرف"),
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
  qualifications: z.object({
    specification: z
      .string()
      .min(1, "التخصص مطلوب")
      .max(100, "التخصص يجب أن يكون أقل من 100 حرف"),
    educationalLevel: z
      .string()
      .min(1, "المستوى التعليمي مطلوب")
      .max(100, "المستوى التعليمي يجب أن يكون أقل من 100 حرف"),
    currentJob: z
      .string()
      .optional()
      .refine(
        (currentJob) => !currentJob || currentJob.length <= 100,
        "الوظيفة الحالية يجب ألا تتجاوز 100 حرف",
      ),
  }),
  bio: z
    .string()
    .optional()
    .refine(
      (bio) => !bio || bio.length <= 1000,
      "النبذة الشخصية يجب أن تكون أقل من 1000 حرف",
    )
    .nullable(),
});

export default UserProfileSchema;
export type UserProfile = z.infer<typeof UserProfileSchema>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateUserProfile(data: any) {
  return UserProfileSchema.parse(data);
}
