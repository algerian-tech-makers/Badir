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

interface PasswordResetEmailProps {
  resetLink: string;
  userName: string;
  expiryMinutes: number;
}

export default function PasswordResetEmail({
  resetLink,
  userName,
  expiryMinutes = 30,
}: PasswordResetEmailProps) {
  return (
    <Html dir="rtl">
      <Head />
      <Preview>طلب إعادة تعيين كلمة المرور لحسابك في منصة بادر</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>منصة بادر</Heading>
            <Text style={subtitle}>إعادة تعيين كلمة المرور</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>مرحباً {userName}،</Text>

            <Text style={paragraph}>
              تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في منصة بادر.
            </Text>

            <Text style={paragraph}>
              انقر على الزر أدناه لإنشاء كلمة مرور جديدة:
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={resetLink}>
                إعادة تعيين كلمة المرور
              </Button>
            </Section>

            <Text style={expiryText}>
              هذا الرابط صالح لمدة {expiryMinutes} دقيقة فقط.
            </Text>

            <Text style={securityNote}>
              <strong>ملاحظة أمنية:</strong> إذا لم تطلب إعادة تعيين كلمة
              المرور، يمكنك تجاهل هذه الرسالة بأمان. لن يتم إجراء أي تغييرات على
              حسابك.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              هذه رسالة آلية من منصة بادر. يرجى عدم الرد على هذا البريد
              الإلكتروني.
            </Text>
            <Text style={footerText}>
              للمساعدة، تواصل معنا على:{" "}
              <a href="mailto:help.badir@gmail.com" style={link}>
                help.badir@gmail.com
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
  backgroundColor: "#F9F7F3",
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

const expiryText = {
  fontSize: "14px",
  color: "#718096",
  textAlign: "center" as const,
  margin: "16px 0 24px 0",
};

const securityNote = {
  backgroundColor: "#FFF5F5",
  border: "1px solid #FEB2B2",
  borderRadius: "6px",
  padding: "16px",
  fontSize: "14px",
  color: "#742A2A",
  margin: "24px 0 0 0",
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
