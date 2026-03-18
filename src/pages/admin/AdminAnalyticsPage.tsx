import { Card, Row, Col, Tag, Typography, Progress, Select } from "antd";
import {
  BoltIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  SparklesIcon,
  Squares2X2Icon,
  CameraIcon,
  FilmIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import { useAdminStats } from "@/hooks/useAdminStats";

const ACCENT = "#89E900";
const CARD_BG = "#2a2a2a";
const BORDER = "#333";

const { Title, Text } = Typography;

export default function AdminAnalyticsPage() {
  const { stats, last7Days, toolBreakdown, modelSplit } = useAdminStats();

  const dailyData = last7Days();
  const maxDaily = Math.max(...dailyData.map((d) => d.count), 1);
  const tools = toolBreakdown();
  const maxTool = Math.max(...tools.map((t) => t.count), 1);
  const { flashPct, proPct } = modelSplit();

  const toolIcons: Record<string, React.ElementType> = {
    "Generate Catalog": Squares2X2Icon,
    "Product Photography": CameraIcon,
    "Cinematic Ads": FilmIcon,
    "Ad Creatives": MegaphoneIcon,
  };

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px" }}>
            Analytics
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>AI usage and performance metrics</Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Tag style={{ background: "rgba(137,233,0,0.1)", border: "1px solid rgba(137,233,0,0.25)", color: ACCENT, borderRadius: 20, fontSize: 11, padding: "3px 10px" }}>
            ● Live from Firebase
          </Tag>
          <Select
            defaultValue="7d"
            style={{ width: 110 }}
            options={[
              { label: "Last 7 days", value: "7d" },
              { label: "Last 30 days", value: "30d" },
              { label: "All time", value: "all" },
            ]}
          />
        </div>
      </div>

      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        {[
          { label: "Total Generations", value: stats.totalGenerations, icon: BoltIcon, color: ACCENT, bg: "rgba(137,233,0,0.12)" },
          { label: "Flash Generations", value: stats.flashGenerations, icon: ArrowTrendingUpIcon, color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
          { label: "Pro Generations", value: stats.proGenerations, icon: ChartBarIcon, color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
          { label: "Real AI Images", value: stats.realImageGenerations, icon: SparklesIcon, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
        ].map((item) => (
          <Col key={item.label} xs={12} sm={6}>
            <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }} styles={{ body: { padding: 20 } }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    {item.label}
                  </Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
                    {stats.loading ? "—" : item.value.toLocaleString()}
                  </div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <item.icon style={{ width: 20, height: 20, color: item.color }} />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={15}>
          <Card
            title={<span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Daily Generations</span>}
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }}
            styles={{ header: { background: "transparent", borderBottom: `1px solid ${BORDER}`, minHeight: 48 }, body: { padding: 20 } }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160 }}>
              {dailyData.map((d) => (
                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{d.count || ""}</span>
                  <div
                    style={{
                      width: "100%",
                      borderRadius: "4px 4px 0 0",
                      background: `linear-gradient(180deg, ${ACCENT} 0%, rgba(137,233,0,0.5) 100%)`,
                      transition: "height 0.5s ease",
                      height: `${Math.max((d.count / maxDaily) * 100, d.count > 0 ? 5 : 0)}%`,
                    }}
                  />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{d.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card
            title={<span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Model Split</span>}
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, height: "100%" }}
            styles={{ header: { background: "transparent", borderBottom: `1px solid ${BORDER}`, minHeight: 48 }, body: { padding: 20 } }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Nano Bana Flash</Text>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{flashPct}%</Text>
                </div>
                <Progress percent={flashPct} showInfo={false} strokeColor={ACCENT} trailColor="rgba(255,255,255,0.08)" size={{ height: 10 }} />
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, display: "block" }}>{stats.flashGenerations} jobs</Text>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Nano Bana Pro</Text>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{proPct}%</Text>
                </div>
                <Progress percent={proPct} showInfo={false} strokeColor="rgba(137,233,0,0.5)" trailColor="rgba(255,255,255,0.08)" size={{ height: 10 }} />
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, display: "block" }}>{stats.proGenerations} jobs</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={<span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Tool Usage Breakdown</span>}
        style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }}
        styles={{ header: { background: "transparent", borderBottom: `1px solid ${BORDER}`, minHeight: 48 }, body: { padding: 20 } }}
      >
        {tools.length === 0 || stats.totalGenerations === 0 ? (
          <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", display: "block", textAlign: "center", padding: "20px 0" }}>
            Tool breakdown populates automatically as generations occur
          </Text>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {tools.map((t) => {
              const Icon = toolIcons[t.name] || BoltIcon;
              return (
                <div key={t.name}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(137,233,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon style={{ width: 14, height: 14, color: ACCENT }} />
                      </div>
                      <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{t.name}</Text>
                    </div>
                    <Text style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{t.count} generations</Text>
                  </div>
                  <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 5,
                        background: t.color,
                        width: `${(t.count / maxTool) * 100}%`,
                        transition: "width 0.7s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
