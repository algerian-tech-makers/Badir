"use client";

import { Controller, useFormContext } from "react-hook-form";
import FormInput from "@/components/FormInput";
import { SignupOrgStep1Data } from "@/schemas";
import { useMemo } from "react";
import { countryList } from "@/data/statics";

export default function Step1BasicInfoForm() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SignupOrgStep1Data>();

  const COUNTRIES = useMemo(() => {
    return countryList.sort().map((country) => ({
      value: country.labelEn,
      label: country.label,
    }));
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="mb-8 text-right">
        <h2 className="text-primary-sm text-primary-500 mb-2 font-bold">
          1. بيانات المنظمة
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Controller
          name="officialName"
          control={control}
          render={({ field, fieldState }) => (
            <FormInput
              type="text"
              label="الاسم الرسمي للمنظمة"
              name={field.name}
              placeholder="الاسم الرسمي"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              rtl={true}
            />
          )}
        />
        <Controller
          name="shortName"
          control={control}
          render={({ field, fieldState }) => (
            <FormInput
              type="text"
              label="الاسم المختصر"
              isOptional={true}
              name={field.name}
              placeholder="الاسم المختصر"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              rtl={true}
            />
          )}
        />
      </div>

      <Controller
        name="contactEmail"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="email"
            label="البريد الإلكتروني"
            name={field.name}
            placeholder="البريد الإلكتروني"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
          />
        )}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Controller
          name="foundingDate"
          control={control}
          render={({ field, fieldState }) => (
            <FormInput
              type="date"
              label="تاريخ التأسيس"
              name={field.name}
              placeholder="ي ي / ش ش / س س س س"
              value={
                field.value
                  ? new Date(field.value).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                field.onChange(e && typeof e === "string" ? new Date(e) : null)
              }
              error={fieldState.error?.message}
              rtl={true}
            />
          )}
        />

        <Controller
          name="membersCount"
          control={control}
          render={({ field, fieldState }) => (
            <FormInput
              type="number"
              label="عدد الأعضاء"
              name={field.name}
              placeholder="عدد الأعضاء"
              value={field.value?.toString() || ""}
              onChange={(e) => {
                const val = e ? parseInt(e.toString(), 10) : undefined;
                field.onChange(
                  val !== undefined && !isNaN(val) ? val : undefined,
                );
              }}
              error={fieldState.error?.message}
              rtl={true}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Controller
          name="city"
          control={control}
          render={({ field, fieldState }) => (
            <FormInput
              type="text"
              label="المدينة"
              name={field.name}
              placeholder="المدينة"
              isOptional={true}
              value={field.value || ""}
              onChange={field.onChange}
              error={fieldState.error?.message}
              rtl={true}
            />
          )}
        />

        <Controller
          name="headquarters"
          control={control}
          render={({ field, fieldState }) => (
            <FormInput
              type="text"
              label="المقر الرئيسي"
              name={field.name}
              placeholder="المقر الرئيسي"
              value={field.value || ""}
              onChange={field.onChange}
              error={fieldState.error?.message}
              rtl={true}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Controller
          name="state"
          control={control}
          render={({ field, fieldState }) => (
            <FormInput
              type="text"
              label="الولاية"
              name={field.name}
              placeholder="الولاية"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              rtl={true}
            />
          )}
        />

        <Controller
          name="country"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <FormInput
              type="select"
              options={COUNTRIES}
              name="country"
              label="البلد"
              placeholder="الجزائر"
              value={value || "Algeria"}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.country?.message}
            />
          )}
        />
      </div>

      <Controller
        name="contactPhoneOrg"
        control={control}
        render={({ field, fieldState }) => (
          <FormInput
            type="tel"
            label="رقم الهاتف"
            name={field.name}
            placeholder="000000000"
            value={field.value || ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
            rtl={true}
            countryCode={control._formValues.contactPhoneCountryCode || "DZ"}
            onCountryChange={(code) => {
              control._formValues.contactPhoneCountryCode = code;
            }}
          />
        )}
      />
    </div>
  );
}
