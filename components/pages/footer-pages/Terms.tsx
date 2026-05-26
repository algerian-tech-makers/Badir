import { Scale } from "lucide-react";
import AppButton from "@/components/AppButton";
import Link from "next/link";
import TermsPdfPreview from "@/components/terms/TermsPdfPreview";

export default function Terms() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:px-8" dir="rtl">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center justify-center">
        <div className="bg-primary-500 mb-4 rounded-full p-4">
          <Scale className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-primary-500 section-title mb-2 font-bold">
          شروط الاستخدام لمنصة بادر
        </h2>
        <p className="text-neutrals-600 text-secondary-sm max-w-2xl text-center font-semibold">
          اقرأ بعناية وتأكد من استخدام منصتنا وفقًا لشروط استخدامنا
        </p>
      </div>
      <TermsPdfPreview
        src="/docs/القانون الداخلي لمنصة بادر.pdf"
        viewerStyle={{ height: "75vh" }}
      />

      {/* 
      <FooterPageSection title="مقدمة">
        <p className="mb-2">
          يخضع استخدامك لمنصة بادر لهذه الشروط والأحكام، والتي قد تتغير عند
          الضرورة.
        </p>
        <p>استمرارك في الاستخدام يعني اطلاعك على التحديثات وموافقتك عليها.</p>
      </FooterPageSection>

      <FooterPageSection title="قبول الشروط">
        <FooterPageItem text="بدخولك المنصة، فأنت توافق على الالتزام الكامل بهذه الشروط" />
        <FooterPageItem text="إن لم توافق، نرجو عدم استخدام المنصة" />
      </FooterPageSection>

      <FooterPageSection title="الاستخدام المقبول">
        <FooterPageItem text="استخدام المنصة لأغراض مشروعة فقط" />
        <FooterPageItem text="احترام الآخرين وعدم الإساءة أو نشر المعلومات المضللة" />
        <FooterPageItem text="عدم انتهاك خصوصية أي مستخدم أو التشهير به" />
      </FooterPageSection>

      <FooterPageSection title="الملكية الفكرية">
        <FooterPageItem text="جميع حقوق المنصة محفوظة (التصميم، البرمجيات، المحتوى)" />
        <FooterPageItem text="تبقى حقوق ما تنشره ملكًا لك، مع منح المنصة حق استخدامه لتطوير خدماتها" />
        <FooterPageItem text="يُمنع أي خرق لحقوق الملكية الفكرية الخاصة بالمنصة أو بالغير" />
      </FooterPageSection>

      <FooterPageSection title="المسؤولية">
        <FooterPageItem text="المنصة غير مسؤولة عن أي أضرار ناتجة عن سوء الاستخدام أو الأعطال الخارجة عن إرادتها" />
        <FooterPageItem text="حماية معلوماتك الشخصية مسؤوليتك" />
        <FooterPageItem text="يرجى الإبلاغ عن أي خروقات أو مشاكل" />
      </FooterPageSection>

      <FooterPageSection title="قواعد الحساب">
        <FooterPageItem text="تقديم معلومات صحيحة عند التسجيل" />
        <FooterPageItem text="الحفاظ على سرية معلومات الدخول" />
        <FooterPageItem text="عدم مشاركة الحساب مع أي شخص" />
        <FooterPageItem text="يحق للمنصة إيقاف الحساب عند مخالفة السياسات" />
      </FooterPageSection>

      <FooterPageSection title="الأنشطة المحظورة">
        <FooterPageItem text="نشر محتوى مخالف للتعاليم ديننا أو يدعو للعنف أو الكراهية أو السياسة" />
        <FooterPageItem text="محاولة اختراق المنصة أو تعطيلها" />
        <FooterPageItem text="الوصول غير المصرح به لبيانات الآخرين" />
        <FooterPageItem text="استخدام المنصة تجاريًا دون إذن" />
      </FooterPageSection>

      <FooterPageSection title="إنهاء الخدمة">
        <p className="mb-2">
          يحق للمنصة تعليق أو إنهاء الحساب عند الاشتباه في مخالفة الشروط، دون
          تحمل مسؤولية عن أي خسائر قد تنتج عن ذلك.
        </p>
      </FooterPageSection> */}

      {/* Contact Section */}
      <div className="mt-10 mb-6 text-center">
        <h2 className="text-primary-500 text-primary-sm mb-4 font-bold">
          تواصل معنا
        </h2>
        <p className="text-neutrals-600 text-paragraph-lg mb-6 font-medium">
          إذا كانت لديك أسئلة حول شروط الاستخدام هذه، يرجى{" "}
          <Link
            className="text-primary-500 hover:text-primary-400 underline"
            href="/contact"
          >
            التواصل معنا
          </Link>
        </p>

        <AppButton type="primary" size="sm" border="rounded" url="/">
          إلى الصفحة الرئيسية
        </AppButton>
      </div>
    </div>
  );
}
