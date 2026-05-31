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

interface FeedbackReceivedEmailProps {
  userName?: string;
  userEmail?: string;
  easeOfUse?: string;
  informationClarity?: string;
  contentDiversity?: string;
  performanceSpeed?: string;
  generalSatisfaction?: string;
  encounteredDifficulties?: string;
  difficultiesDetails?: string;
  improvementSuggestions?: string;
  wouldRecommend?: string;
  appRating?: string;
  timestamp: string;
}

export default function FeedbackReceivedEmail({
  userName = "مستخدم مجهول",
  userEmail = "غير محدد",
  easeOfUse,
  informationClarity,
  contentDiversity,
  performanceSpeed,
  generalSatisfaction,
  encounteredDifficulties,
  difficultiesDetails,
  improvementSuggestions,
  wouldRecommend,
  appRating,
  timestamp,
}: FeedbackReceivedEmailProps) {
  // Determine if this is critical feedback
  const isCritical =
    easeOfUse === "سيء جداً" ||
    informationClarity === "سيء جداً" ||
    contentDiversity === "سيء جداً" ||
    performanceSpeed === "سيء جداً" ||
    generalSatisfaction === "سيء جداً" ||
    (appRating && parseInt(appRating) <= 2);

  return (
    <Html dir="rtl">
      <Head />
      <Preview>
        {isCritical ? "تقييم حرج - " : ""}تقييم جديد للمنصة من {userName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={isCritical ? criticalHeader : header}>
            <Heading style={heading}>منصة بادر</Heading>
            <Text style={subtitle}>
              {isCritical
                ? "تقييم حرج للمنصة - يتطلب متابعة"
                : "تقييم جديد للمنصة"}
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Critical Alert */}
            {isCritical && (
              <Section style={criticalAlert}>
                <Text style={criticalAlertText}>
                  <strong>تنبيه:</strong> هذا التقييم يحتوي على ملاحظات حرجة
                  تتطلب متابعة فورية
                </Text>
              </Section>
            )}

            {/* User Info */}
            <Section style={infoBox}>
              <Text style={sectionTitle}>معلومات المستخدم</Text>
              <Text style={infoRow}>
                <strong>الاسم:</strong> {userName}
              </Text>
              <Text style={infoRow}>
                <strong>البريد الإلكتروني:</strong> {userEmail}
              </Text>
              <Text style={infoRow}>
                <strong>التاريخ والوقت:</strong> {timestamp}
              </Text>
            </Section>

            {/* Rating Scores */}
            <Section style={scoresSection}>
              <Text style={sectionTitle}>التقييمات</Text>

              {easeOfUse && (
                <RatingRow
                  label="سهولة الاستخدام"
                  value={easeOfUse}
                  isCritical={easeOfUse === "سيء جداً"}
                />
              )}

              {informationClarity && (
                <RatingRow
                  label="وضوح المعلومات"
                  value={informationClarity}
                  isCritical={informationClarity === "سيء جداً"}
                />
              )}

              {contentDiversity && (
                <RatingRow
                  label="تنوع المحتوى"
                  value={contentDiversity}
                  isCritical={contentDiversity === "سيء جداً"}
                />
              )}

              {performanceSpeed && (
                <RatingRow
                  label="سرعة الأداء"
                  value={performanceSpeed}
                  isCritical={performanceSpeed === "سيء جداً"}
                />
              )}

              {generalSatisfaction && (
                <RatingRow
                  label="الرضا العام"
                  value={generalSatisfaction}
                  isCritical={generalSatisfaction === "سيء جداً"}
                />
              )}

              {appRating && (
                <RatingRow
                  label="تقييم التطبيق"
                  value={`${appRating} من 5`}
                  isCritical={parseInt(appRating) <= 2}
                />
              )}

              {wouldRecommend && (
                <RatingRow
                  label="هل ينصح بالمنصة"
                  value={wouldRecommend}
                  isCritical={false}
                />
              )}
            </Section>

            {/* Difficulties */}
            {encounteredDifficulties && (
              <Section style={feedbackBox}>
                <Text style={sectionTitle}>الصعوبات التي واجهها المستخدم</Text>
                <Text style={feedbackText}>
                  <strong>واجه صعوبات:</strong> {encounteredDifficulties}
                </Text>
                {difficultiesDetails && (
                  <Text style={feedbackText}>
                    <strong>التفاصيل:</strong> {difficultiesDetails}
                  </Text>
                )}
              </Section>
            )}

            {/* Improvement Suggestions */}
            {improvementSuggestions && (
              <Section style={feedbackBox}>
                <Text style={sectionTitle}>اقتراحات التطوير</Text>
                <Text style={feedbackText}>{improvementSuggestions}</Text>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              هذه رسالة آلية من نظام تقييم منصة بادر. يرجى عدم الرد على هذا
              البريد الإلكتروني.
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

function RatingRow({
  label,
  value,
  isCritical,
}: {
  label: string;
  value: string;
  isCritical: boolean;
}) {
  return (
    <Text style={isCritical ? criticalRatingRow : ratingRow}>
      <strong>{label}:</strong> {value}
    </Text>
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

const criticalHeader = {
  backgroundColor: "#C53030",
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

const criticalAlert = {
  backgroundColor: "#FFF5F5",
  border: "2px solid #FC8181",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "24px",
};

const criticalAlertText = {
  fontSize: "14px",
  color: "#742A2A",
  margin: "0",
  textAlign: "center" as const,
};

const infoBox = {
  backgroundColor: "#f7fafc",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
  border: "1px solid #e2e8f0",
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
  margin: "0 0 8px 0",
};

const scoresSection = {
  marginBottom: "24px",
};

const ratingRow = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#4a5568",
  padding: "12px 16px",
  marginBottom: "10px",
  backgroundColor: "#f7fafc",
  borderRadius: "6px",
  borderRight: "4px solid #3D986E",
};

const criticalRatingRow = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#742A2A",
  padding: "12px 16px",
  marginBottom: "10px",
  backgroundColor: "#FFF5F5",
  borderRadius: "6px",
  borderRight: "4px solid #C53030",
};

const feedbackBox = {
  backgroundColor: "#f7fafc",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "20px",
  border: "1px solid #e2e8f0",
};

const feedbackText = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#4a5568",
  margin: "0 0 12px 0",
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
