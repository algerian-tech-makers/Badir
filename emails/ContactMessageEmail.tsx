import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ContactMessageEmailProps {
  fullName: string;
  email: string;
  inquiryType: string;
  title: string;
  message: string;
  timestamp: string;
}

export default function ContactMessageEmail({
  fullName,
  email,
  inquiryType,
  title,
  message,
  timestamp,
}: ContactMessageEmailProps) {
  return (
    <Html dir="rtl">
      <Head />
      <Preview>
        رسالة جديدة من {fullName} - {title}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>منصة بادر</Heading>
            <Text style={subtitle}>رسالة جديدة من نموذج التواصل</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Sender Info */}
            <Section style={infoBox}>
              <Text style={sectionTitle}>معلومات المرسل</Text>

              <Text style={infoRow}>
                <strong>الاسم:</strong> {fullName}
              </Text>

              <Text style={infoRow}>
                <strong>البريد الإلكتروني:</strong>{" "}
                <a href={`mailto:${email}`} style={emailLink}>
                  {email}
                </a>
              </Text>

              <Text style={infoRow}>
                <strong>نوع الاستفسار:</strong> {inquiryType}
              </Text>

              <Text style={infoRow}>
                <strong>التاريخ والوقت:</strong> {timestamp}
              </Text>
            </Section>

            {/* Message Subject */}
            <Section style={subjectBox}>
              <Text style={sectionTitle}>عنوان الرسالة</Text>
              <Text style={subjectText}>{title}</Text>
            </Section>

            {/* Message Content */}
            <Section style={messageBox}>
              <Text style={sectionTitle}>نص الرسالة</Text>
              <Text style={messageText}>{message}</Text>
            </Section>

            {/* Action Note */}
            <Section style={actionBox}>
              <Text style={actionText}>
                <strong>للرد:</strong> استخدم البريد الإلكتروني {email}
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              هذه رسالة آلية من نظام التواصل في منصة بادر. يرجى عدم الرد على هذا
              البريد الإلكتروني.
            </Text>
            <Text style={footerText}>
              للمساعدة، تواصل معنا على:{" "}
              {/* <a href="mailto:contact@badir.space" style={link}>
                contact@badir.space
              </a> */}
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
  maxWidth: "650px",
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

const infoBox = {
  backgroundColor: "#f7fafc",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
  border: "1px solid #e2e8f0",
  borderRight: "4px solid #3D986E",
};

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#064E43",
  margin: "0 0 16px 0",
};

const infoRow = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#4a5568",
  margin: "0 0 10px 0",
};

const emailLink = {
  color: "#064E43",
  textDecoration: "underline",
};

const subjectBox = {
  marginBottom: "24px",
};

const subjectText = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#1a1a1a",
  lineHeight: "1.4",
  margin: "0",
};

const messageBox = {
  backgroundColor: "#f7fafc",
  borderRadius: "8px",
  padding: "24px",
  marginBottom: "24px",
  border: "1px solid #e2e8f0",
};

const messageText = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#4a5568",
  whiteSpace: "pre-wrap" as const,
  margin: "0",
};

const actionBox = {
  backgroundColor: "#EDF2F7",
  borderRadius: "6px",
  padding: "16px",
  borderRight: "4px solid #3D986E",
};

const actionText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#2D3748",
  margin: "0",
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
