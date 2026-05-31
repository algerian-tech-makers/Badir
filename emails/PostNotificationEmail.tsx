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

interface PostNotificationEmailProps {
  postTitle: string;
  authorName: string;
  postExcerpt?: string;
  postUrl: string;
  categoryName?: string;
}

export default function PostNotificationEmail({
  postTitle,
  authorName,
  postExcerpt,
  postUrl,
  categoryName,
}: PostNotificationEmailProps) {
  return (
    <Html dir="rtl">
      <Head />
      <Preview>منشور جديد: {postTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>منصة بادر</Heading>
            <Text style={subtitle}>منشور جديد</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>مرحباً،</Text>

            <Text style={paragraph}>
              تم نشر منشور جديد بواسطة <strong>{authorName}</strong> على منصة
              بادر.
            </Text>

            {/* Post Card */}
            <Section style={postCard}>
              {categoryName && (
                <Text style={categoryBadge}>{categoryName}</Text>
              )}

              <Text style={postTitle_style}>{postTitle}</Text>

              {postExcerpt && <Text style={excerpt}>{postExcerpt}</Text>}

              <Text style={authorInfo}>بواسطة: {authorName}</Text>
            </Section>

            {/* View Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={postUrl}>
                عرض المنشور
              </Button>
            </Section>

            <Text style={notificationNote}>
              تلقيت هذه الرسالة لأنك مشترك في إشعارات منصة بادر.
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
  margin: "0 0 24px 0",
};

const postCard = {
  backgroundColor: "#f7fafc",
  borderRadius: "8px",
  padding: "24px",
  marginBottom: "24px",
  border: "1px solid #e2e8f0",
};

const categoryBadge = {
  display: "inline-block",
  backgroundColor: "#3D986E",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "600",
  padding: "4px 12px",
  borderRadius: "4px",
  marginBottom: "12px",
};

const postTitle_style = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#064E43",
  margin: "0 0 12px 0",
  lineHeight: "1.4",
};

const excerpt = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#718096",
  margin: "12px 0 16px 0",
};

const authorInfo = {
  fontSize: "14px",
  color: "#718096",
  fontWeight: "500",
  margin: "0",
  paddingTop: "12px",
  borderTop: "1px solid #e2e8f0",
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

const notificationNote = {
  fontSize: "13px",
  color: "#718096",
  textAlign: "center" as const,
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
