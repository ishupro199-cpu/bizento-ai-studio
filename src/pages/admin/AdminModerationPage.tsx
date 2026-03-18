import { useState } from "react";
import { Card, Tag, Button, Typography, Badge } from "antd";
import {
  TrashIcon,
  CheckCircleIcon,
  FlagIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

const ACCENT = "#89E900";
const CARD_BG = "#2a2a2a";
const BORDER = "#333";

const { Title, Text } = Typography;

const GRADIENTS = [
  "linear-gradient(135deg, rgba(137,233,0,0.2), rgba(96,165,250,0.12))",
  "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(137,233,0,0.12))",
  "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(248,113,113,0.12))",
  "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(137,233,0,0.12))",
  "linear-gradient(135deg, rgba(250,204,21,0.2), rgba(245,158,11,0.12))",
  "linear-gradient(135deg, rgba(248,113,113,0.2), rgba(167,139,250,0.12))",
];

const statuses = ["Approved", "Pending", "Flagged"] as const;

const initialItems = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  user: ["jane@example.com", "mike@example.com", "alex@example.com"][i % 3],
  prompt: `Generated image ${i + 1} — AI product photography`,
  status: statuses[i % 3],
  gradient: GRADIENTS[i % GRADIENTS.length],
}));

const statusConfig = {
  Approved: { color: ACCENT, bg: "rgba(137,233,0,0.1)", border: "rgba(137,233,0,0.25)" },
  Pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  Flagged: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
};

export default function AdminModerationPage() {
  const [items, setItems] = useState(initialItems);

  const counts = {
    total: items.length,
    approved: items.filter((i) => i.status === "Approved").length,
    pending: items.filter((i) => i.status === "Pending").length,
    flagged: items.filter((i) => i.status === "Flagged").length,
  };

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px" }}>
          Content Moderation
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          Review, approve, and remove AI-generated content
        </Text>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total", value: counts.total, color: "rgba(255,255,255,0.6)" },
          { label: "Approved", value: counts.approved, color: ACCENT },
          { label: "Pending", value: counts.pending, color: "#f59e0b" },
          { label: "Flagged", value: counts.flagged, color: "#f87171" },
        ].map((s) => (
          <Card key={s.label} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, flex: 1 }} styles={{ body: { padding: "14px 18px" } }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.label}</Text>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {items.map((item) => {
          const sc = statusConfig[item.status];
          return (
            <Card
              key={item.id}
              style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", padding: 0 }}
              styles={{ body: { padding: 0 } }}
            >
              <div
                style={{
                  aspectRatio: "4/3",
                  background: item.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: `1px solid ${BORDER}`,
                }}
              >
                <PhotoIcon style={{ width: 36, height: 36, color: "rgba(255,255,255,0.15)" }} />
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                    {item.user}
                  </Text>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: sc.color,
                      background: sc.bg,
                      border: `1px solid ${sc.border}`,
                      borderRadius: 20,
                      padding: "2px 8px",
                    }}
                  >
                    {item.status}
                  </span>
                </div>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 10 }}>
                  {item.prompt}
                </Text>
                <div style={{ display: "flex", gap: 6 }}>
                  {item.status !== "Approved" && (
                    <button
                      style={{
                        flex: 1,
                        height: 28,
                        border: "none",
                        borderRadius: 7,
                        background: "rgba(137,233,0,0.1)",
                        color: ACCENT,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <CheckCircleIcon style={{ width: 12, height: 12 }} />
                      Approve
                    </button>
                  )}
                  {item.status !== "Flagged" && (
                    <button
                      style={{
                        flex: 1,
                        height: 28,
                        border: "none",
                        borderRadius: 7,
                        background: "rgba(245,158,11,0.1)",
                        color: "#f59e0b",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <FlagIcon style={{ width: 12, height: 12 }} />
                      Flag
                    </button>
                  )}
                  <button
                    onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                    style={{
                      width: 28,
                      height: 28,
                      border: "none",
                      borderRadius: 7,
                      background: "rgba(248,113,113,0.1)",
                      color: "#f87171",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TrashIcon style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
