import { sanitizeHTMLServer } from "@/lib/santitize-server";
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

interface InitiativePostNotificationEmailProps {
  initiativeName: string;
  postTitle?: string;
  postContent: string;
  authorName: string;
  postUrl: string;
}

export default function InitiativePostNotificationEmail({
  initiativeName,
  postTitle,
  postContent,
  authorName,
  postUrl,
}: InitiativePostNotificationEmailProps) {
  // Create excerpt from content (strip HTML, limit to 200 chars)
  const contentExcerpt = sanitizeHTMLServer(postContent)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);

  return (
    <Html dir="rtl">
      <Head />
      <Preview>تحديث جديد في مبادرة {initiativeName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>منصة بادر</Heading>
            <Text style={subtitle}>تحديث مبادرة</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>مرحباً،</Text>

            <Text style={paragraph}>
              تم نشر تحديث جديد في مبادرة{" "}
              <strong style={initiativeBadge}>{initiativeName}</strong> التي أنت
              مشترك فيها.
            </Text>

            {/* Post Card */}
            <Section style={postCard}>
              {postTitle && <Text style={postTitleStyle}>{postTitle}</Text>}

              <Text style={excerpt}>{contentExcerpt}...</Text>

              <Text style={authorInfo}>بواسطة: {authorName}</Text>
            </Section>

            {/* View Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={postUrl}>
                عرض التحديث الكامل
              </Button>
            </Section>

            <Text style={notificationNote}>
              تلقيت هذه الرسالة لأنك مشترك في هذه المبادرة. يمكنك إدارة إعدادات
              الإشعارات من حسابك.
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
  backgroundColor: "#FAF9F5",
  fontFamily: 'Arial, "Segoe UI", sans-serif',
  padding: "20px 0",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "600px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.25)",
};

const header = {
  backgroundColor: "#064E43",
  padding: "30px 20px",
  textAlign: "center" as const,
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
};

const heading = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 10px 0",
};

const subtitle = {
  color: "#E0F4F1",
  fontSize: "16px",
  margin: "0",
};

const content = {
  padding: "30px 40px",
};

const greeting = {
  fontSize: "16px",
  color: "#3E3D37",
  margin: "0 0 20px 0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#3E3D37",
  margin: "0 0 20px 0",
};

const initiativeBadge = {
  color: "#3D986E",
  fontWeight: "bold" as const,
};

const postCard = {
  backgroundColor: "#E0F4F1",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #87B6A0",
  margin: "20px 0",
};

const postTitleStyle = {
  fontSize: "20px",
  fontWeight: "bold" as const,
  color: "#064E43",
  margin: "0 0 15px 0",
};

const excerpt = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#605F57",
  margin: "0 0 15px 0",
};

const authorInfo = {
  fontSize: "14px",
  color: "#91915B",
  margin: "0",
  fontStyle: "italic" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#3D986E",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 40px",
  borderRadius: "8px",
};

const notificationNote = {
  fontSize: "14px",
  color: "#91915B",
  margin: "30px 0 0 0",
  lineHeight: "1.5",
};

const footer = {
  backgroundColor: "#262520",
  padding: "20px 40px",
  borderBottomLeftRadius: "8px",
  borderBottomRightRadius: "8px",
};

const footerText = {
  fontSize: "13px",
  color: "#C9C7BF",
  margin: "0 0 10px 0",
  lineHeight: "1.5",
};

const link = {
  color: "#70B595",
  textDecoration: "underline",
};
