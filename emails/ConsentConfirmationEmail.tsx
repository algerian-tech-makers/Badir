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
  Tailwind,
} from "react-email";

interface ConsentConfirmationEmailProps {
  firstName: string;
  consentGivenAt: string; // pre-formatted date string
  consentVersion: string;
  platformUrl: string;
}

export default function ConsentConfirmationEmail({
  firstName,
  consentGivenAt,
  consentVersion,
  platformUrl,
}: ConsentConfirmationEmailProps) {
  return (
    <Html dir="rtl" lang="ar">
      <Head />
      <Preview>بادر — تم تسجيل موافقتك على سياسة الخصوصية</Preview>
      <Tailwind>
        <Body style={bodyStyle}>
          <Container style={containerStyle}>
            {/* Header */}
            <Section style={{ marginBottom: "24px", textAlign: "center" }}>
              <Text style={headerTextStyle}>بادر</Text>
            </Section>

            <Hr style={hrStyle} />

            {/* Confirmation badge */}
            <Section style={confirmationBadgeSectionStyle}>
              <Text style={confirmationBadgeTextStyle}>
                ✓ تم تسجيل موافقتك بنجاح
              </Text>
            </Section>

            {/* Body */}
            <Section>
              <Heading style={headingStyle}>شكراً لك، {firstName}</Heading>

              <Text style={textStyle}>
                نؤكد لك أنه تم تسجيل موافقتك الصريحة على سياسة الخصوصية الخاصة
                بمنصة <strong>بادر</strong>. يُعدّ هذا السجل دليلاً على امتثالنا
                للقانون الجزائري رقم 18-07 المتعلق بحماية المعطيات ذات الطابع
                الشخصي.
              </Text>

              {/* Consent record */}
              <Section style={consentRecordSectionStyle}>
                <Text style={consentRecordHeaderTextStyle}>سجل الموافقة</Text>
                <Hr style={consentRecordHrStyle} />
                <Text style={consentRecordDetailsTextStyle}>
                  <span style={{ color: "#999" }}>التاريخ والوقت: </span>
                  {consentGivenAt}
                </Text>
                <Text
                  style={{ ...consentRecordDetailsTextStyle, marginTop: "8px" }}
                >
                  <span style={{ color: "#999" }}>نسخة الوثيقة: </span>
                  {consentVersion}
                </Text>
              </Section>

              <Text style={textStyle}>
                يمكنك في أي وقت الاطلاع على سياسة الخصوصية أو سحب موافقتك عبر
                صفحة إعدادات حسابك على المنصة.
              </Text>
            </Section>

            {/* CTA */}
            <Section style={{ margin: "32px 0", textAlign: "center" }}>
              <Button href={platformUrl} style={buttonStyle}>
                العودة إلى المنصة
              </Button>
            </Section>

            <Hr style={hrStyle} />

            {/* Footer */}
            <Section style={{ marginTop: "16px" }}>
              <Text style={footerTextStyle}>
                هذه رسالة تأكيد تلقائية. إذا لم تقم بالموافقة على سياسة الخصوصية
                مؤخراً، يرجى التواصل معنا فوراً.
              </Text>
              <Text style={copyrightTextStyle}>بادر — جميع الحقوق محفوظة</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: "#f4f4f0",
  fontFamily: "sans-serif",
};

const containerStyle = {
  margin: "40px auto",
  maxWidth: "560px", // adjusted max-w-140 to a more reasonable value
  borderRadius: "16px",
  backgroundColor: "white",
  padding: "32px 40px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const headerTextStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  letterSpacing: "-0.025em",
  color: "#1a1a1a",
  textAlign: "center" as const,
};

const hrStyle = {
  borderColor: "#e5e5e5",
  margin: "24px 0",
};

const confirmationBadgeSectionStyle = {
  margin: "24px 0",
  borderRadius: "8px",
  backgroundColor: "#f0faf4",
  padding: "16px",
  textAlign: "center" as const,
};

const confirmationBadgeTextStyle = {
  margin: 0,
  fontSize: "14px",
  fontWeight: "600",
  color: "#2d7a4f",
};

const headingStyle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#1a1a1a",
};

const textStyle = {
  marginTop: "12px",
  lineHeight: "28px",
  color: "#444",
};

const consentRecordSectionStyle = {
  margin: "16px 0",
  borderRadius: "8px",
  border: "1px solid #e5e5e5",
  padding: "16px",
};

const consentRecordHeaderTextStyle = {
  margin: 0,
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#999",
};

const consentRecordHrStyle = {
  margin: "12px 0",
  borderColor: "#f0f0f0",
};

const consentRecordDetailsTextStyle = {
  margin: "8px 0 0",
  fontSize: "14px",
  color: "#444",
};

const buttonStyle = {
  borderRadius: "8px",
  backgroundColor: "#1a1a1a",
  padding: "12px 32px",
  fontSize: "14px",
  fontWeight: "600",
  color: "white",
  textDecoration: "none",
  display: "inline-block",
};

const footerTextStyle = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#999",
};

const copyrightTextStyle = {
  fontSize: "12px",
  color: "#bbb",
};
