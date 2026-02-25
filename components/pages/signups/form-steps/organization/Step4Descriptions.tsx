"use client";
import { Controller, useFormContext } from "react-hook-form";
import FormInput from "@/components/form-input";
import { OrgRegistrationFormData } from "@/schemas/signupOrgSchema";

export default function Step4Description() {
  const { control } = useFormContext<OrgRegistrationFormData>();

  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <h2 className="text-primary-500 mb-2 text-2xl font-bold">
          4. نبذة عن المنظمة
        </h2>
      </div>

      <Controller
        name="shortDescription"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="textarea"
            label="الوصف المختصر"
            name={field.name}
            placeholder="صف منظمتكم باختصار"
            rows={6}
            value={field.value || ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
          />
        )}
      />

      <Controller
        name="previousInitiatives"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="textarea"
            label="أبرز المشاريع أو المبادرات السابقة"
            name={field.name}
            placeholder="أبرز المشاريع أو المبادرات السابقة"
            rows={6}
            isOptional={true}
            value={field.value || ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
          />
        )}
      />
    </div>
  );
}
