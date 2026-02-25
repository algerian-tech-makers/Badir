"use client";

import { Controller, useFormContext } from "react-hook-form";
import FormInput from "@/components/form-input";
import { SignupOrgStep6Data } from "@/schemas";

export default function Step7TemsAndConditions() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SignupOrgStep6Data>();

  return (
    <div className="space-y-6" dir="rtl">
      <div className="mb-8 text-right">
        <h2 className="text-primary-sm text-primary-500 mb-2 font-bold">
          7. الموافقة والتعهد
        </h2>
      </div>

      <div className="flex items-start gap-3" dir="rtl">
        <Controller
          name="acceptConditions"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormInput
              type="checkbox"
              name="acceptConditions"
              label=""
              value={value}
              onChange={onChange}
              error={errors.acceptConditions?.message}
              className="w-fit md:w-max"
            />
          )}
        />

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2">
          <p className="text-secondary-md text-neutrals-700 w-full leading-relaxed font-semibold">
            أقر بأن جميع البيانات المقدمة صحيحة، وأتعهد بالالتزام بضوابط العمل
            التطوعي وقيم منصة بادر، والمحافظة على سمعتها أثناء مشاركتي في
            أنشطتها.
          </p>
        </div>
      </div>
    </div>
  );
}
