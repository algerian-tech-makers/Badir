import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface InitiativeStatusEmailProps {
  initiativeName: string;
  organizerName: string;
  status: "published" | "cancelled";
  rejectionReason?: string;
  initiativeLink?: string;
}

export default function InitiativeStatusEmail({
  initiativeName,
  organizerName,
  status,
  rejectionReason,
  initiativeLink = "https://badir.space/initiatives",
}: InitiativeStatusEmailProps) {
  const isPublished = status === "published";

  return (
    <Html dir="rtl">
      <Head />
      <Preview>
        {isPublished
          ? `تم نشر مبادرتك "${initiativeName}" على منصة بادر`
          : `تحديث بخصوص مبادرتك "${initiativeName}" على منصة بادر`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section
            style={{
              ...header,
              backgroundColor: isPublished ? "#064E43" : "#7C2D12",
            }}
          >
            <Heading style={heading}>منصة بادر</Heading>
            <Text style={subtitle}>
              {isPublished ? "نشر المبادرة" : "تحديث حالة المبادرة"}
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>مرحباً {organizerName}،</Text>

            {isPublished ? (
              <>
                <Text style={paragraph}>
                  يسعدنا إبلاغك بأن مبادرتك{" "}
                  <strong>&quot;{initiativeName}&quot;</strong> قد تمت الموافقة
                  عليها ونشرها على منصة بادر! 🎉
                </Text>

                <Text style={paragraph}>
                  المبادرة الآن مرئية لجميع المتطوعين على المنصة ويمكنهم التسجيل
                  والمشاركة فيها.
                </Text>

                <Section style={featureList}>
                  <Text style={featureTitle}>ما التالي؟</Text>
                  <Text style={featureItem}>
                    ✅ تابع طلبات التسجيل من المتطوعين المهتمين
                  </Text>
                  <Text style={featureItem}>
                    ✅ أضف تحديثات ومنشورات لإبقاء المشاركين على اطلاع
                  </Text>
                  <Text style={featureItem}>
                    ✅ شارك رابط المبادرة على وسائل التواصل الاجتماعي
                  </Text>
                  <Text style={featureItem}>
                    ✅ راقب عدد المشاركين والإحصائيات من لوحة التحكم
                  </Text>
                </Section>

                {/* CTA Button */}
                <Section style={buttonContainer}>
                  <Button style={button} href={initiativeLink}>
                    عرض المبادرة
                  </Button>
                </Section>

                <Text style={successNote}>
                  <strong>تهانينا!</strong> نتمنى لك التوفيق في إحداث تأثير
                  إيجابي في المجتمع من خلال هذه المبادرة.
                </Text>
              </>
            ) : (
              <>
                <Text style={paragraph}>
                  شكراً لإنشاء مبادرتك{" "}
                  <strong>&quot;{initiativeName}&quot;</strong> على منصة بادر.
                </Text>

                <Text style={paragraph}>
                  بعد مراجعة تفاصيل المبادرة، نأسف لإبلاغك بأن المبادرة لم يتم
                  قبولها للنشر في الوقت الحالي.
                </Text>

                {rejectionReason && (
                  <Section style={rejectionBox}>
                    <Text style={rejectionTitle}>سبب عدم الموافقة:</Text>
                    <Text style={rejectionText}>{rejectionReason}</Text>
                  </Section>
                )}

                <Text style={paragraph}>
                  يمكنك مراجعة تفاصيل المبادرة وتحديثها من خلال لوحة التحكم، ثم
                  إعادة تقديمها للمراجعة مرة أخرى.
                </Text>

                <Section style={guideBox}>
                  <Text style={guideTitle}>نصائح لتحسين المبادرة:</Text>
                  <Text style={guideItem}>
                    • تأكد من وضوح وصف المبادرة وأهدافها
                  </Text>
                  <Text style={guideItem}>
                    • أضف معلومات تفصيلية عن الأنشطة والمهام
                  </Text>
                  <Text style={guideItem}>
                    • حدد المتطلبات والمهارات المطلوبة بدقة
                  </Text>
                  <Text style={guideItem}>
                    • اختر التواريخ والمواقع المناسبة
                  </Text>
                </Section>

                {/* CTA Button */}
                <Section style={buttonContainer}>
                  <Button style={buttonSecondary} href={initiativeLink}>
                    تعديل المبادرة
                  </Button>
                </Section>

                <Text style={supportNote}>
                  إذا كان لديك أي استفسار أو تحتاج إلى مساعدة، لا تتردد في
                  التواصل مع فريق الدعم.
                </Text>
              </>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              هذه رسالة آلية من منصة بادر. يرجى عدم الرد على هذا البريد
              الإلكتروني.
            </Text>
            <Text style={footerText}>
              للمساعدة، تواصل معنا على:{" "}
              <a href="mailto:contact@updates.badir.space" style={link}>
                contact@updates.badir.space
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: 'Arial, "Segoe UI", sans-serif',
  padding: "20px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

const header = {
  backgroundColor: "#064E43",
  padding: "32px 24px",
  textAlign: "center" as const,
};

const heading = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const subtitle = {
  color: "#E0F4F1",
  fontSize: "16px",
  margin: "0",
};

const content = {
  padding: "32px 24px",
};

const greeting = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 16px 0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4a5568",
  margin: "0 0 16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#064E43",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const buttonSecondary = {
  backgroundColor: "#D97706",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const successNote = {
  backgroundColor: "#F0FDF4",
  border: "1px solid #86EFAC",
  borderRadius: "6px",
  padding: "16px",
  fontSize: "14px",
  color: "#166534",
  margin: "24px 0 0 0",
};

const supportNote = {
  backgroundColor: "#FFF7ED",
  border: "1px solid #FED7AA",
  borderRadius: "6px",
  padding: "16px",
  fontSize: "14px",
  color: "#9A3412",
  margin: "24px 0 0 0",
};

const rejectionBox = {
  backgroundColor: "#FEF2F2",
  border: "1px solid #FECACA",
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0",
};

const rejectionTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#991B1B",
  margin: "0 0 8px 0",
};

const rejectionText = {
  fontSize: "14px",
  color: "#7F1D1D",
  margin: "0",
  lineHeight: "20px",
};

const featureList = {
  backgroundColor: "#F0F9FF",
  border: "1px solid #BAE6FD",
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0",
};

const featureTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#075985",
  margin: "0 0 12px 0",
};

const featureItem = {
  fontSize: "14px",
  color: "#0C4A6E",
  margin: "8px 0",
  lineHeight: "20px",
};

const guideBox = {
  backgroundColor: "#FFFBEB",
  border: "1px solid #FDE68A",
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0",
};

const guideTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#92400E",
  margin: "0 0 12px 0",
};

const guideItem = {
  fontSize: "14px",
  color: "#78350F",
  margin: "6px 0",
  lineHeight: "20px",
};

const footer = {
  backgroundColor: "#f7fafc",
  padding: "24px",
  borderTop: "1px solid #e2e8f0",
};

const footerText = {
  fontSize: "14px",
  color: "#718096",
  textAlign: "center" as const,
  margin: "8px 0",
};

const link = {
  color: "#064E43",
  textDecoration: "underline",
};
