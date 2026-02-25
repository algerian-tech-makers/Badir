import { OrgRegistrationFormData } from "@/schemas";
import FormInput from "@/components/form-input";
import { Controller, useFormContext } from "react-hook-form";

export default function Step2SocialLinks() {
  const { control } = useFormContext<OrgRegistrationFormData>();

  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <h2 className="text-primary-500 mb-2 text-2xl font-bold">
          حسابات التواصل الاجتماعي
        </h2>
        <p className="text-neutrals-500">
          يمكنك إضافة روابط حسابات منظمتك على وسائل التواصل الاجتماعي (اختياري)
        </p>
      </div>

      <Controller
        name="facebook"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="text"
            label="فايسبوك"
            name={field.name}
            placeholder="https://facebook.com/yourorganization"
            value={field.value || ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
            isOptional={true}
          />
        )}
      />

      <Controller
        name="instagram"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="text"
            label="أنستغرام"
            name={field.name}
            placeholder="https://instagram.com/yourorganization"
            value={field.value || ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
            isOptional={true}
          />
        )}
      />

      <Controller
        name="linkedin"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="text"
            label="لينكدين"
            name={field.name}
            placeholder="https://linkedin.com/company/yourorganization"
            value={field.value || ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
            isOptional={true}
          />
        )}
      />

      <Controller
        name="twitter"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="text"
            label="تويتر / X"
            name={field.name}
            placeholder="https://twitter.com/yourorganization"
            value={field.value || ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
            isOptional={true}
          />
        )}
      />

      <Controller
        name="youtube"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="text"
            label="يوتيوب"
            name={field.name}
            placeholder="https://youtube.com/channel/yourorganization"
            value={field.value || ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
            isOptional={true}
          />
        )}
      />

      <Controller
        name="other"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="text"
            label="منصة أخرى"
            name={field.name}
            placeholder="https://example.com/yourorganization"
            value={field.value || ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
            isOptional={true}
          />
        )}
      />

      <div className="bg-primary-50 border-primary-200 mt-6 rounded-md border p-4">
        <p className="text-neutrals-600 text-sm">
          ملاحظة: تأكد من إدخال الروابط كاملة مع بدايتها بـ https:// للحصول على
          روابط صحيحة
        </p>
      </div>
    </div>
  );
}
