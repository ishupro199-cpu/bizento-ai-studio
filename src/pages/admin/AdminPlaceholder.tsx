import { Card, Typography } from "antd";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

const ACCENT = "#89E900";
const CARD_BG = "#2a2a2a";
const BORDER = "#333";

const { Title, Text } = Typography;

const PAGE_DESCRIPTIONS: Record<string, string> = {
  "Billing & Plans": "Manage subscription plans, pricing tiers, coupons, and payment history.",
  "Credits": "Define credit costs per feature, manually add/remove credits, and view usage logs.",
  "AI Tools": "Enable or disable AI tools, set cost per usage, and manage prompt templates.",
  "Projects": "Track generated images and videos, browse user project history, and moderate outputs.",
  "Marketing": "Manage email campaigns, referral tracking, affiliate systems, and promo banners.",
  "CMS": "Edit landing pages, FAQs, Terms & Privacy, and announcement bars.",
  "Blog": "Create, edit, and schedule blog posts with SEO fields and rich text editor.",
  "Prompt Library": "Add, edit, and organize AI prompts with categories, tags, and usage analytics.",
  "Notifications": "Send in-app and email notifications to users with scheduling and analytics.",
  "Settings": "Configure app settings, billing, AI keys, email, security, and integrations.",
  "Support": "Manage user support tickets, track status, and resolve or escalate issues.",
  "Logs": "View payment logs, credit logs, admin activity logs, and API usage logs.",
  "Moderation": "Review flagged content, ban users, and manage platform safety.",
  "System": "Monitor system health, server metrics, and AI pipeline performance.",
};

export default function AdminPlaceholder({ title }: { title: string }) {
  const description = PAGE_DESCRIPTIONS[title] || "This section is under development.";

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px" }}>
          {title}
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{description}</Text>
      </div>

      <Card
        style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }}
        styles={{ body: { padding: 0 } }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(137,233,0,0.08)",
              border: `1px solid rgba(137,233,0,0.2)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <WrenchScrewdriverIcon style={{ width: 30, height: 30, color: ACCENT }} />
          </div>
          <Text
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "rgba(255,255,255,0.8)",
              display: "block",
              marginBottom: 8,
              letterSpacing: "-0.3px",
            }}
          >
            {title} — Coming Soon
          </Text>
          <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", maxWidth: 380, lineHeight: 1.6 }}>
            {description}
          </Text>
          <div
            style={{
              marginTop: 24,
              padding: "6px 16px",
              borderRadius: 20,
              background: "rgba(137,233,0,0.08)",
              border: `1px solid rgba(137,233,0,0.2)`,
              fontSize: 12,
              color: ACCENT,
              fontWeight: 600,
            }}
          >
            In Development
          </div>
        </div>
      </Card>
    </div>
  );
}
