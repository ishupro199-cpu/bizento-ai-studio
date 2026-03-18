import { Card, Row, Col, Typography, Progress } from "antd";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";

const ACCENT = "#89E900";
const CARD_BG = "#2a2a2a";
const BORDER = "#333";

const { Title, Text } = Typography;

const services = [
  { name: "API Server", status: "Operational", uptime: "99.98%", icon: ServerIcon },
  { name: "AI Pipeline", status: "Operational", uptime: "99.95%", icon: CpuChipIcon },
  { name: "Storage", status: "Operational", uptime: "99.99%", icon: CloudIcon },
  { name: "CDN", status: "Operational", uptime: "99.99%", icon: GlobeAltIcon },
  { name: "Database", status: "Operational", uptime: "99.97%", icon: CircleStackIcon },
  { name: "Auth Service", status: "Degraded", uptime: "98.50%", icon: ShieldCheckIcon },
];

const metrics = [
  { label: "Generations Today", value: "1,248", sub: "+12% from yesterday" },
  { label: "Flash Generations", value: "892", sub: "71.5% of total" },
  { label: "Pro Generations", value: "356", sub: "28.5% of total" },
  { label: "Avg Gen Time", value: "3.2s", sub: "-0.4s vs last week" },
  { label: "Queue Size", value: "12", sub: "Normal range" },
  { label: "Error Rate", value: "0.3%", sub: "Below threshold" },
];

const cpuUsage = 38;
const memoryUsage = 61;
const storageUsage = 45;

export default function AdminSystemPage() {
  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px" }}>
          System Monitoring
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          Real-time health and performance metrics
        </Text>
      </div>

      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        {metrics.map((m) => (
          <Col key={m.label} xs={12} sm={8} lg={4}>
            <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }} styles={{ body: { padding: "18px 16px" } }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", marginBottom: 4 }}>{m.value}</div>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block" }}>{m.label}</Text>
              <Text style={{ fontSize: 11, color: ACCENT, marginTop: 4, display: "block" }}>{m.sub}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={14}>
          <Card
            title={<span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Service Status</span>}
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }}
            styles={{ header: { background: "transparent", borderBottom: `1px solid ${BORDER}`, minHeight: 48 }, body: { padding: 16 } }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {services.map((s) => (
                <div
                  key={s.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid rgba(255,255,255,0.05)`,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: s.status === "Operational" ? "rgba(137,233,0,0.1)" : "rgba(245,158,11,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <s.icon
                      style={{
                        width: 17,
                        height: 17,
                        color: s.status === "Operational" ? ACCENT : "#f59e0b",
                      }}
                    />
                  </div>
                  <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, flex: 1, fontWeight: 500 }}>
                    {s.name}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{s.uptime}</Text>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: s.status === "Operational" ? ACCENT : "#f59e0b",
                      background: s.status === "Operational" ? "rgba(137,233,0,0.1)" : "rgba(245,158,11,0.1)",
                      border: `1px solid ${s.status === "Operational" ? "rgba(137,233,0,0.25)" : "rgba(245,158,11,0.25)"}`,
                      borderRadius: 20,
                      padding: "2px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    {s.status === "Operational" ? (
                      <CheckCircleIcon style={{ width: 11, height: 11 }} />
                    ) : (
                      <ExclamationTriangleIcon style={{ width: 11, height: 11 }} />
                    )}
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={<span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Resource Usage</span>}
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, height: "100%" }}
            styles={{ header: { background: "transparent", borderBottom: `1px solid ${BORDER}`, minHeight: 48 }, body: { padding: 20 } }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { label: "CPU Usage", value: cpuUsage, color: ACCENT },
                { label: "Memory", value: memoryUsage, color: "#60a5fa" },
                { label: "Storage", value: storageUsage, color: "#a78bfa" },
              ].map((r) => (
                <div key={r.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{r.label}</Text>
                    <Text style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{r.value}%</Text>
                  </div>
                  <Progress
                    percent={r.value}
                    showInfo={false}
                    strokeColor={r.color}
                    trailColor="rgba(255,255,255,0.08)"
                    size={{ height: 10 }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
