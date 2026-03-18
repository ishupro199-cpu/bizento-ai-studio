import { Card, Row, Col, Statistic, Tag, Skeleton, Typography, Progress } from "antd";
import {
  UsersIcon,
  BoltIcon,
  CreditCardIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  CameraIcon,
  FilmIcon,
  MegaphoneIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useAdminStats } from "@/hooks/useAdminStats";

const ACCENT = "#89E900";
const CARD_BG = "#2a2a2a";
const BORDER = "#333";

const { Title, Text } = Typography;

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TOOL_ICONS: Record<string, React.ElementType> = {
  "Generate Catalog": Squares2X2Icon,
  "Product Photography": CameraIcon,
  "Cinematic Ads": FilmIcon,
  "Ad Creatives": MegaphoneIcon,
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  loading: boolean;
  suffix?: string;
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg, loading, suffix }: StatCardProps) {
  return (
    <Card
      style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }}
      styles={{ body: { padding: "18px 20px" } }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.3px", display: "block", marginBottom: 8 }}>
            {label}
          </Text>
          {loading ? (
            <Skeleton.Input active style={{ width: 80, height: 28 }} />
          ) : (
            <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1 }}>
              {value}
              {suffix && <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>{suffix}</span>}
            </div>
          )}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon style={{ width: 20, height: 20, color: iconColor }} />
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, display: "inline-block", animation: "pulse 2s infinite" }} />
        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Live</Text>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const { stats, recentActivity, activityLoading, last7Days, modelSplit, avgGenerationTime, aiSuccessRate } = useAdminStats();

  const dailyData = last7Days();
  const maxDaily = Math.max(...dailyData.map((d) => d.count), 1);
  const { flashPct, proPct } = modelSplit();
  const avgTime = avgGenerationTime();
  const aiRate = aiSuccessRate();

  const statCards = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: UsersIcon, iconColor: "#60a5fa", iconBg: "rgba(96,165,250,0.12)" },
    { label: "Total Generations", value: stats.totalGenerations.toLocaleString(), icon: BoltIcon, iconColor: ACCENT, iconBg: "rgba(137,233,0,0.12)" },
    { label: "Credits Used", value: stats.totalCreditsUsed.toLocaleString(), icon: CreditCardIcon, iconColor: "#f59e0b", iconBg: "rgba(245,158,11,0.12)" },
    { label: "Flash Gens", value: stats.flashGenerations.toLocaleString(), icon: ArrowTrendingUpIcon, iconColor: "#34d399", iconBg: "rgba(52,211,153,0.12)" },
    { label: "Pro Gens", value: stats.proGenerations.toLocaleString(), icon: SparklesIcon, iconColor: "#a78bfa", iconBg: "rgba(167,139,250,0.12)" },
    { label: "Real AI Images", value: stats.realImageGenerations.toLocaleString(), icon: CameraIcon, iconColor: ACCENT, iconBg: "rgba(137,233,0,0.08)" },
  ];

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px" }}>
            Dashboard
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            Welcome back — here's what's happening at Pixalera.
          </Text>
        </div>
        <Tag color={ACCENT} style={{ color: "#000", fontWeight: 600, borderRadius: 20, fontSize: 11, padding: "3px 10px", border: "none" }}>
          ● Live Data
        </Tag>
      </div>

      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        {statCards.map((card) => (
          <Col key={card.label} xs={12} sm={8} lg={4}>
            <StatCard {...card} loading={stats.loading} />
          </Col>
        ))}
      </Row>

      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12}>
          <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }} styles={{ body: { padding: 20 } }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(137,233,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ClockIcon style={{ width: 22, height: 22, color: ACCENT }} />
              </div>
              <div>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block" }}>Avg. Generation Time</Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
                  {stats.loading ? "—" : avgTime > 0 ? `${avgTime}s` : "N/A"}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }} styles={{ body: { padding: 20 } }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(137,233,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircleIcon style={{ width: 22, height: 22, color: ACCENT }} />
              </div>
              <div>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block" }}>AI Success Rate</Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
                  {stats.loading ? "—" : `${aiRate}%`}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={14}>
          <Card
            title={<span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Daily Generations — Last 7 Days</span>}
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }}
            styles={{ header: { background: "transparent", borderBottom: `1px solid ${BORDER}`, minHeight: 48 }, body: { padding: 20 } }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 130 }}>
              {dailyData.map((d) => (
                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{d.count || ""}</span>
                  <div
                    style={{
                      width: "100%",
                      borderRadius: "4px 4px 0 0",
                      background: `linear-gradient(180deg, ${ACCENT} 0%, rgba(137,233,0,0.6) 100%)`,
                      transition: "height 0.5s ease",
                      height: `${Math.max((d.count / maxDaily) * 100, d.count > 0 ? 6 : 0)}%`,
                      minHeight: d.count > 0 ? 4 : 0,
                    }}
                  />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{d.label}</span>
                </div>
              ))}
            </div>
            {stats.totalGenerations === 0 && !stats.loading && (
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", display: "block", textAlign: "center", marginTop: 12 }}>
                No generations yet — data appears here in real time
              </Text>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={<span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Model Usage</span>}
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, height: "100%" }}
            styles={{ header: { background: "transparent", borderBottom: `1px solid ${BORDER}`, minHeight: 48 }, body: { padding: 20 } }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Flash Model</Text>
                  <Text style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{flashPct}%</Text>
                </div>
                <Progress
                  percent={flashPct}
                  showInfo={false}
                  strokeColor={ACCENT}
                  trailColor="rgba(255,255,255,0.08)"
                  size={{ height: 8 }}
                />
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, display: "block" }}>
                  {stats.flashGenerations} jobs
                </Text>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Pro Model</Text>
                  <Text style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{proPct}%</Text>
                </div>
                <Progress
                  percent={proPct}
                  showInfo={false}
                  strokeColor="rgba(137,233,0,0.55)"
                  trailColor="rgba(255,255,255,0.08)"
                  size={{ height: 8 }}
                />
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, display: "block" }}>
                  {stats.proGenerations} jobs
                </Text>
              </div>
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 10 }}>
                  AI Pipeline
                </Text>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Real AI Images</Text>
                  <Text style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>{aiRate}%</Text>
                </div>
                <Progress
                  percent={aiRate}
                  showInfo={false}
                  strokeColor={ACCENT}
                  trailColor="rgba(255,255,255,0.08)"
                  size={{ height: 6 }}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClockIcon style={{ width: 15, height: 15, color: ACCENT }} />
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Recent Activity</span>
          </div>
        }
        style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }}
        styles={{ header: { background: "transparent", borderBottom: `1px solid ${BORDER}`, minHeight: 48 }, body: { padding: 20 } }}
      >
        {activityLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton.Input key={i} active style={{ width: "100%", height: 36 }} />
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", display: "block", textAlign: "center", padding: "20px 0" }}>
            No activity yet — generations will appear here in real time
          </Text>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentActivity.slice(0, 8).map((a) => {
              const Icon = TOOL_ICONS[a.tool] || BoltIcon;
              return (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid rgba(255,255,255,0.05)`,
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(137,233,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 15, height: 15, color: ACCENT }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.description}
                    </Text>
                    <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      {a.tool} · {a.model === "pro" ? "Pro" : "Flash"}
                      {a.hasRealImages && <span style={{ color: ACCENT, marginLeft: 6 }}>· AI image</span>}
                    </Text>
                  </div>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                    {timeAgo(a.timestamp)}
                  </Text>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
