import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";
import type { CSSProperties } from "react";

interface InactivityWarningEmailProps {
  firstName: string;
  daysRemaining: string;
  platformUrl: string;
}

const styles: Record<string, CSSProperties> = {
  body: {
    backgroundColor: "#f4f4f0",
    fontFamily: "sans-serif",
  },
  container: {
    margin: "40px auto",
    maxWidth: "560px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    padding: "32px 40px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  logoSection: {
    marginBottom: "24px",
    textAlign: "center",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "-0.025em",
    color: "#1a1a1a",
  },
  divider: {
    borderColor: "#e5e5e5",
  },
  warningSection: {
    margin: "24px 0",
    borderRadius: "8px",
    backgroundColor: "#fff8f0",
    padding: "16px 24px",
    textAlign: "center",
  },
  warningText: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "#b45309",
  },
  heading: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  text: {
    lineHeight: "28px",
    color: "#444444",
  },
  firstParagraph: {
    marginTop: "12px",
  },
  buttonSection: {
    margin: "32px 0",
    textAlign: "center",
  },
  button: {
    borderRadius: "8px",
    backgroundColor: "#1a1a1a",
    padding: "12px 32px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    textDecoration: "none",
  },
  footerSection: {
    marginTop: "16px",
  },
  footerText: {
    fontSize: "12px",
    lineHeight: "20px",
    color: "#999999",
  },
  footerLocation: {
    fontSize: "12px",
    color: "#bbbbbb",
  },
};

export default function InactivityWarningEmail({
  firstName,
  daysRemaining,
  platformUrl,
}: InactivityWarningEmailProps) {
  return (
    <Html dir="rtl" lang="ar">
      <Head />
      <Preview>بادر — سيتم حذف بياناتك خلال {daysRemaining} يوماً</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.logoSection}>
            <Text style={styles.logoText}>بادر</Text>
          </Section>

          <Hr style={styles.divider} />

          <Section style={styles.warningSection}>
            <Text style={styles.warningText}>⚠ تنبيه بشأن حسابك</Text>
          </Section>

          <Section>
            <Heading style={styles.heading}>مرحباً {firstName}،</Heading>

            <Text
              style={{
                ...styles.text,
                ...styles.firstParagraph,
              }}
            >
              لاحظنا أنك لم تنشط على منصة <strong>بادر</strong> منذ فترة طويلة.
              وفقاً لسياسة الخصوصية التي وافقت عليها، سيتم حذف بياناتك الشخصية
              خلال <strong>{daysRemaining} يوماً</strong> من تاريخ هذه الرسالة.
            </Text>

            <Text style={styles.text}>
              إذا كنت ترغب في الاحتفاظ بحسابك، يكفي أن تقوم بتسجيل الدخول مرة
              واحدة لتجديد نشاطك.
            </Text>
          </Section>

          <Section style={styles.buttonSection}>
            <Button href={platformUrl} style={styles.button}>
              تسجيل الدخول والإبقاء على حسابي
            </Button>
          </Section>

          <Hr style={styles.divider} />

          <Section style={styles.footerSection}>
            <Text style={styles.footerText}>
              إذا لم تعد ترغب في استخدام المنصة، لا داعي لاتخاذ أي إجراء. سيتم
              حذف بياناتك تلقائياً عند انتهاء المدة المذكورة.
            </Text>

            <Text style={styles.footerLocation}>بادر، الجزائر</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
