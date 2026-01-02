"use client";

import AppButton from "@/components/AppButton";
import HeroCarousel from "@/components/pages/landing/HeroCarousel";
import { ArrowUpLeft } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { SplitText } from "gsap/all";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMediaQuery } from "react-responsive";

export default function Hero() {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  useGSAP(() => {
    document.fonts.ready.then(() => {
      const heroTitle = new SplitText(".hero-title", { type: "words" });
      const heroSplit = new SplitText(".hero-description", { type: "words" });

      gsap.from(heroTitle.words, {
        yPercent: 100,
        opacity: 0,
        duration: 1.5,
        ease: "expo.out",
        stagger: 0.1,
      });
      gsap.from(heroSplit.words, {
        direction: "rtl",
        opacity: 0,
        autoAlpha: 0,
        filter: "blur(8px)",
        xPercent: isMobile ? 0 : 100,
        duration: 1.5,
        ease: "expo.out",
        stagger: 0.05,
        delay: 1,
      });
    });
  }, []);
  return (
    <section
      className="flex-center-column xl:flex-center items-stretch justify-evenly"
      dir="rtl"
    >
      <div className="flex-center-column h-full flex-1/2 items-center justify-center gap-10 max-xl:text-center xl:pr-8">
        <div className="flex-center-column h-full justify-center gap-10">
          <h1 className="hero-title text-neutrals-700 text-hero-md lg:text-hero-lg mb-4 font-bold">
            <span className="text-primary-500 max-xl:block max-xl:w-full">
              بــادِر
            </span>{" "}
            .. بصُنع الأثر
          </h1>
          <p className="hero-description text-primary-sm font-bold">
            نُقرّب المسافة بين من يريد العطاء ومن يحتاجه، ليكبر الأثر معًا.
          </p>
          <div className="flex-center gap-4 py-6 max-xl:justify-center max-sm:items-end">
            <AppButton
              type="outline"
              border="rounded"
              size="lg"
              url="/initiatives"
            >
              اكتشف المبادرات
            </AppButton>
            <AppButton
              type="primary"
              icon={<ArrowUpLeft className="h-4 w-4 sm:h-6 sm:w-6" />}
              border="rounded"
              size="lg"
              url="/signup/user"
            >
              تطوَّع الآن
            </AppButton>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-1/2 items-center justify-center p-4">
        <HeroCarousel />
      </div>
    </section>
  );
}
