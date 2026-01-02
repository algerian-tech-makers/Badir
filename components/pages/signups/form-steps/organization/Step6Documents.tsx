"use client";
import { Controller, useFormContext } from "react-hook-form";
import FormInput from "@/components/FormInput";
import { OrgRegistrationFormData } from "@/schemas/signupOrgSchema";
import { BUCKET_MIME_TYPES, BUCKET_SIZE_LIMITS } from "@/types/Statics";
import { handleFileUpload, mimeTypeToExtension } from "@/lib/utils";

export default function Step6Documents() {
  const { control } = useFormContext<OrgRegistrationFormData>();

  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <h2 className="text-primary-500 mb-2 text-2xl font-bold">
          6. الوثائق والمرفقات
        </h2>
      </div>

      <Controller
        name="officialLicense"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="file"
            label="نسخة من الترخيص أو الاعتماد الرسمي"
            name={field.name}
            placeholder="اختر ملف PDF"
            value={field.value || ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
            fileAccept={BUCKET_MIME_TYPES.documents.map(mimeTypeToExtension)}
            fileMaxSize={BUCKET_SIZE_LIMITS.documents / 1024 / 1024}
            onFileChange={(file, onChange) =>
              handleFileUpload(file, BUCKET_SIZE_LIMITS.documents, (value) =>
                onChange(JSON.stringify(value)),
              )
            }
            isOptional={true} //? Make optional temporarily
          />
        )}
      />

      <Controller
        name="logo"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="file"
            label="الشعار الرسمي"
            name={field.name}
            placeholder="اختر صورة"
            value={field.value || ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
            fileAccept={BUCKET_MIME_TYPES.avatars.map(mimeTypeToExtension)}
            fileMaxSize={BUCKET_SIZE_LIMITS.avatars / 1024 / 1024}
            onFileChange={(file, onChange) =>
              handleFileUpload(file, BUCKET_SIZE_LIMITS.avatars, (value) =>
                onChange(JSON.stringify(value)),
              )
            }
          />
        )}
      />

      <Controller
        name="identificationCard"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="file"
            label="بطاقة تعريفية / بروشور تعريفي"
            name={field.name}
            placeholder="اختر ملف"
            isOptional={true}
            value={field.value || ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
            fileAccept={BUCKET_MIME_TYPES.documents.map(mimeTypeToExtension)}
            fileMaxSize={BUCKET_SIZE_LIMITS.documents / 1024 / 1024}
            onFileChange={(file, onChange) =>
              handleFileUpload(file, BUCKET_SIZE_LIMITS.documents, (value) =>
                onChange(JSON.stringify(value)),
              )
            }
          />
        )}
      />
    </div>
  );
}
