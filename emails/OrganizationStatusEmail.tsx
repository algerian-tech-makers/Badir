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

interface OrganizationStatusEmailProps {
  organizationName: string;
  ownerName: string;
  status: "approved" | "rejected";
  rejectionReason?: string;
  dashboardLink?: string;
}

export default function OrganizationStatusEmail({
  organizationName,
  ownerName,
  status,
  rejectionReason,
  dashboardLink = "https://badir.space/profile",
}: OrganizationStatusEmailProps) {
  const isApproved = status === "approved";

  return (
    <Html dir="rtl">
      <Head />
      <Preview>
        {isApproved
          ? `تم قبول منظمتك "${organizationName}" على منصة بادر`
          : `تحديث بخصوص طلب منظمتك "${organizationName}" على منصة بادر`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section
            style={{
              ...header,
              backgroundColor: isApproved ? "#064E43" : "#7C2D12",
            }}
          >
            <Heading style={heading}>منصة بادر</Heading>
            <Text style={subtitle}>
              {isApproved ? "قبول المنظمة" : "تحديث حالة المنظمة"}
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>مرحباً {ownerName}،</Text>

            {isApproved ? (
              <>
                <Text style={paragraph}>
                  يسعدنا إبلاغك بأن منظمتك{" "}
                  <strong>&quot;{organizationName}&quot;</strong> قد تمت
                  الموافقة عليها ونشرها على منصة بادر!
                </Text>

                <Text style={paragraph}>
                  يمكنك الآن البدء في إنشاء ونشر المبادرات التطوعية والتواصل مع
                  المتطوعين المهتمين بأنشطتكم.
                </Text>

                <Section style={featureList}>
                  <Text style={featureTitle}>الخطوات التالية:</Text>
                  <Text style={featureItem}>
                    إنشاء أول مبادرة تطوعية لمنظمتك
                  </Text>
                  <Text style={featureItem}>
                    إكمال ملف المنظمة بالتفاصيل الإضافية
                  </Text>
                  <Text style={featureItem}>
                    استكشاف المتطوعين والتواصل معهم
                  </Text>
                </Section>

                {/* CTA Button */}
                <Section style={buttonContainer}>
                  <Button style={button} href={dashboardLink}>
                    انتقل إلى لوحة التحكم
                  </Button>
                </Section>

                <Text style={successNote}>
                  <strong>مبروك!</strong> نتطلع للعمل معكم لخلق تأثير إيجابي في
                  المجتمع.
                </Text>
              </>
            ) : (
              <>
                <Text style={paragraph}>
                  شكراً لتقديم طلب تسجيل منظمتك{" "}
                  <strong>&quot;{organizationName}&quot;</strong> على منصة بادر.
                </Text>

                <Text style={paragraph}>
                  بعد مراجعة البيانات المقدمة، نأسف لإبلاغك بأن طلبك لم يتم
                  قبوله في الوقت الحالي.
                </Text>

                {rejectionReason && (
                  <Section style={rejectionBox}>
                    <Text style={rejectionTitle}>سبب الرفض:</Text>
                    <Text style={rejectionText}>{rejectionReason}</Text>
                  </Section>
                )}

                <Text style={paragraph}>
                  يمكنك مراجعة البيانات المطلوبة وتحديث معلومات منظمتك من خلال
                  لوحة التحكم.
                </Text>

                {/* CTA Button */}
                <Section style={buttonContainer}>
                  <Button style={buttonSecondary} href={dashboardLink}>
                    مراجعة بيانات المنظمة
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
