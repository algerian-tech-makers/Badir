import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from "react-email";

interface ConsentRequestEmailProps {
  firstName: string;
  consentPageUrl: string;
  consentVersion: string;
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

export default function ConsentRequestEmail({
  firstName,
  consentPageUrl,
  consentVersion,
}: ConsentRequestEmailProps) {
  return (
    <Html dir="rtl" lang="ar">
      <Head />
      <Preview>بادر — نطلب منك الموافقة على سياسة الخصوصية المحدّثة</Preview>
      <Tailwind>
        <Body style={bodyStyle}>
          <Container style={containerStyle}>
            {/* Header */}

            <Section style={{ marginBottom: "24px", textAlign: "center" }}>
              <Text style={headerTextStyle}>بادر</Text>
            </Section>

            <Hr style={hrStyle} />
            {/* Body */}

            <Section style={{ marginTop: "24px" }}>
              <Heading style={headingStyle}>مرحباً {firstName}،</Heading>

              <Text style={textStyle}>
                نودّ إعلامك بأنّنا أصدرنا وثيقة سياسة الخصوصية الخاصة بمنصة{" "}
                <strong>بادر</strong>، التي تشرح بالتفصيل كيفية جمع بياناتك
                الشخصية ومعالجتها وحمايتها، وفقاً للقانون الجزائري رقم 18-07
                المتعلق بحماية المعطيات ذات الطابع الشخصي.
              </Text>

              <Text style={textStyle}>
                نطلب منك قراءة هذه الوثيقة والموافقة عليها صراحةً للاستمرار في
                استخدام المنصة. لن تظهر لك هذه الرسالة مرة أخرى بعد تأكيد
                موافقتك.
              </Text>
            </Section>

            {/* CTA */}

            <Section style={{ margin: "32px 0", textAlign: "center" }}>
              <Button href={consentPageUrl} style={buttonStyle}>
                قراءة سياسة الخصوصية والموافقة عليها
              </Button>
            </Section>

            <Hr style={hrStyle} />
            {/* Footer */}

            <Section style={{ marginTop: "16px" }}>
              <Text style={footerTextStyle}>
                إذا كنت لا تتوقع تلقّي هذا البريد، يمكنك تجاهله. هذه الرسالة
                أُرسلت تلقائياً إلى جميع المستخدمين المسجّلين على منصة بادر.
              </Text>

              <Text style={copyrightTextStyle}>
                نسخة الوثيقة: {consentVersion} — بادر، الجزائر
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
