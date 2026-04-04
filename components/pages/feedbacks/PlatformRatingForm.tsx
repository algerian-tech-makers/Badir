"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import FormInput from "@/components/form-input";
import AppButton from "@/components/AppButton";
import {
  PlatformRatingFormData,
  platformRatingSchema,
  ratingOptions,
  platformSections,
  recommendationOptions,
} from "@/schemas/platformRatingSchema";
import { Card, CardContent } from "@/components/ui/card";
import { submitRating } from "@/actions/submitRating";

export default function PlatformRatingForm() {
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    reset,
  } = useForm<PlatformRatingFormData>({
    resolver: zodResolver(platformRatingSchema),
    defaultValues: {
      usefulSections: [],
      difficultiesDetails: "",
      improvementSuggestions: "",
    },
  });

  const encounteredDifficulties = watch("encounteredDifficulties");

  const onSubmit = (data: PlatformRatingFormData) => {
    startTransition(async () => {
      const result = await submitRating(data);
      if (result.success) {
        if (result.message) {
          toast.success(result.message);
          reset();
        }
      } else {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              setError(field as keyof PlatformRatingFormData, {
                message: messages[0],
              });
            }
          });
        } else if (result.error) {
          toast.error(result.error);
        }
      }
    });
  };

  return (
    <Card className="bg-neutrals-100 border-neutrals-200 rounded-3xl border shadow-sm">
      <CardContent className="p-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-12 md:space-y-8"
          dir="rtl"
        >
          {/* Platform Rating Section */}
          {/* Rating questions - each in a grid for desktop */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Controller
                name="easeOfUse"
                control={control}
                render={({ field }) => (
                  <FormInput
                    type="radio"
                    label="سهولة الاستخدام"
                    name="easeOfUse"
                    options={ratingOptions.map((option) => ({
                      value: option,
                      label: option,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.easeOfUse?.message}
                    rtl={true}
                  />
                )}
              />

              <Controller
                name="informationClarity"
                control={control}
                render={({ field }) => (
                  <FormInput
                    type="radio"
                    label="وضوح المعلومات وسهولة الوصول إليها"
                    name="informationClarity"
                    options={ratingOptions.map((option) => ({
                      value: option,
                      label: option,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.informationClarity?.message}
                    rtl={true}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Controller
                name="contentDiversity"
                control={control}
                render={({ field }) => (
                  <FormInput
                    type="radio"
                    label="تنوع المحتوى وجودته"
                    name="contentDiversity"
                    options={ratingOptions.map((option) => ({
                      value: option,
                      label: option,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.contentDiversity?.message}
                    rtl={true}
                  />
                )}
              />

              <Controller
                name="performanceSpeed"
                control={control}
                render={({ field }) => (
                  <FormInput
                    type="radio"
                    label="سرعة التصفح والأداء"
                    name="performanceSpeed"
                    options={ratingOptions.map((option) => ({
                      value: option,
                      label: option,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.performanceSpeed?.message}
                    rtl={true}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Controller
                name="generalSatisfaction"
                control={control}
                render={({ field }) => (
                  <FormInput
                    type="radio"
                    label="رضاك العام عن المنصة"
                    name="generalSatisfaction"
                    options={ratingOptions.map((option) => ({
                      value: option,
                      label: option,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.generalSatisfaction?.message}
                    rtl={true}
                  />
                )}
              />
            </div>

            {/* Useful Sections */}
            <div>
              <p className="text-neutrals-600 mb-2 font-medium">
                أي الأقسام كانت أكثر فائدة لك؟{" "}
                <span className="text-state-error">*</span>
              </p>
              <div className="flex-center flex-wrap justify-start gap-4">
                {platformSections.map((section) => (
                  <Controller
                    key={section}
                    name="usefulSections"
                    control={control}
                    render={({ field }) => {
                      const isChecked = field.value?.includes(section) || false;
                      return (
                        <FormInput
                          type="checkbox"
                          label={section}
                          name={`section-${section}`}
                          placeholder={section}
                          value={isChecked}
                          onChange={(checked) => {
                            const updatedValue = checked
                              ? [...(field.value || []), section]
                              : (field.value || []).filter(
                                  (s) => s !== section,
                                );
                            field.onChange(updatedValue);
                          }}
                          rtl={true}
                        />
                      );
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Difficulties */}
            <Controller
              name="encounteredDifficulties"
              control={control}
              render={({ field }) => (
                <FormInput
                  type="radio"
                  label="هل واجهت صعوبات أثناء استخدام المنصة؟"
                  name="encounteredDifficulties"
                  options={[
                    { value: "نعم", label: "نعم" },
                    { value: "لا", label: "لا" },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.encounteredDifficulties?.message}
                  rtl={true}
                />
              )}
            />

            {/* Conditional Difficulties Details */}
            {encounteredDifficulties === "نعم" && (
              <Controller
                name="difficultiesDetails"
                control={control}
                render={({ field }) => (
                  <FormInput
                    type="textarea"
                    label="إذا كانت الإجابة 'نعم'، يرجى التوضيح"
                    name="difficultiesDetails"
                    placeholder="أخبرنا عن التحديات التي واجهتها"
                    value={field.value}
                    onChange={field.onChange}
                    rows={3}
                    rtl={true}
                  />
                )}
              />
            )}

            {/* Improvement Suggestions */}
            <Controller
              name="improvementSuggestions"
              control={control}
              render={({ field }) => (
                <FormInput
                  type="textarea"
                  label="اقتراحاتك لتطوير المنصة"
                  name="improvementSuggestions"
                  placeholder="اقتراحاتك لتطوير المنصة"
                  value={field.value}
                  onChange={field.onChange}
                  rows={3}
                  isOptional={true}
                  rtl={true}
                />
              )}
            />

            {/* Recommendation */}
            <Controller
              name="wouldRecommend"
              control={control}
              render={({ field }) => (
                <FormInput
                  type="radio"
                  label="  هل تنصح الآخرين باستخدام منصة بادر؟"
                  name="wouldRecommend"
                  options={recommendationOptions.map((option) => ({
                    value: option,
                    label: option,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.wouldRecommend?.message}
                  rtl={true}
                />
              )}
            />

            {/* App Rating */}
            <Controller
              name="appRating"
              control={control}
              render={({ field }) => (
                <FormInput
                  type="radio"
                  label="قيم التطبيق من 1 إلى 5"
                  name="appRating"
                  options={[1, 2, 3, 4, 5].map((num) => ({
                    value: num.toString(),
                    label: num.toString(),
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.appRating?.message}
                  rtl={true}
                />
              )}
            />

            {/* Note */}
            <p className="text-neutrals-500 my-4 text-center text-xs">
              ملاحظة: جميع المعلومات التي قدمتها ستستخدم لتحسين المنصة وتجربة
              المستخدم فقط
            </p>

            {/* Submit Button */}
            <div className="mt-6 flex justify-center">
              <AppButton
                type="submit"
                size="md"
                icon={isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                disabled={isPending}
              >
                {isPending ? "جارِ الإرسال..." : "أرسل تقييمك"}
              </AppButton>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
