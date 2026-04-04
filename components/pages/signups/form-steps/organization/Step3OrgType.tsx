"use client";
import { Controller, useFormContext } from "react-hook-form";
import FormInput from "@/components/form-input";
import { OrgRegistrationFormData } from "@/schemas/signupOrgSchema";
import { organizationTypeOptions, workAreaOptions } from "@/types/Profile";

export default function Step3OrgType() {
  const { control } = useFormContext<OrgRegistrationFormData>();

  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <h2 className="text-primary-500 mb-2 text-2xl font-bold">
          3. التصنيف والمجال
        </h2>
      </div>

      <div className="mb-8">
        <Controller
          name="organizationType"
          control={control}
          render={({ field, fieldState }) => (
            <FormInput
              type="radio"
              label="نوع المنظمة"
              name={field.name}
              options={organizationTypeOptions}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              rtl={true}
            />
          )}
        />
      </div>

      <div>
        <Controller
          name="workAreas"
          control={control}
          render={({ field, fieldState }) => (
            <FormInput
              type="checkbox-group"
              label="مجالات العمل"
              name={field.name}
              options={workAreaOptions}
              value={field.value || []}
              onChange={field.onChange}
              error={fieldState.error?.message}
              rtl={true}
            />
          )}
        />
      </div>
    </div>
  );
}
