"use client";
import { Controller, useFormContext } from "react-hook-form";
import FormInput from "@/components/form-input";
import { OrgRegistrationFormData } from "@/schemas/signupOrgSchema";

export default function Step5PersonalContact() {
  const { control, setValue, watch } =
    useFormContext<OrgRegistrationFormData>();

  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <h2 className="text-primary-500 mb-2 text-2xl font-bold">
          5. معلومات ممثل المنظمة في منصة بادر
        </h2>
      </div>

      <Controller
        name="role"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="text"
            label="المنصب / الدور في المنظمة"
            name={field.name}
            placeholder="المنصب / الدور"
            value={field.value || ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
          />
        )}
      />

      <div className="flex flex-col space-y-2">
        <Controller
          name="contactPhone"
          control={control}
          render={({ field, fieldState }) => {
            const countryCode = watch("contactPhoneCountryCode");
            return (
              <FormInput
                type="tel"
                label="رقم الهاتف الشخصي"
                name={field.name}
                placeholder="000000000"
                value={field.value || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                rtl={true}
                countryCode={countryCode || "DZ"}
                onCountryChange={(code) => {
                  setValue("contactPhoneCountryCode", code);
                }}
              />
            );
          }}
        />
      </div>
    </div>
  );
}
