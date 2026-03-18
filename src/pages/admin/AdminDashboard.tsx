import { Card, Row, Col, Skeleton, Typography, Progress, Select, Table, Tag, Avatar } from "antd";
import {
  UsersIcon,
  BoltIcon,
  CreditCardIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ACCENT = "#89E900";
const CARD_BG = "#242424";
const BORDER = "#2e2e2e";

const { Title, Text } = Typography;

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  loading: boolean;
  trend?: number;
  suffix?: string;
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg, loading, trend, suffix }: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;
  return (
    <Card
      style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }}
      styles={{ body: { padding: "20px 22px" } }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", letterSpacing: "0.2px", display: "block", marginBottom: 10 }}>
            {label}
          </Text>
          {loading ? (
            <Skeleton.Input active style={{ width: 80, height: 28 }} />
          ) : (
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1 }}>
              {value}
              {suffix && <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.45)", marginLeft: 4 }}>{suffix}</span>}
            </div>
          )}
          {trend !== undefined && !loading && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}>
              {isPositive
                ? <ArrowTrendingUpIcon style={{ width: 13, height: 13, color: ACCENT }} />
                : <ArrowTrendingDownIcon style={{ width: 13, height: 13, color: "#f87171" }} />}
              <Text style={{ fontSize: 11, color: isPositive ? ACCENT : "#f87171", fontWeight: 600 }}>
                {isPositive ? "+" : ""}{trend}% /Month
              </Text>
            </div>
          )}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon style={{ width: 22, height: 22, color: iconColor }} />
        </div>
      </div>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1e1e1e", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, margin: "0 0 4px" }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color, fontSize: 13, fontWeight: 600, margin: 0 }}>
            {p.value} <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{p.name}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { stats, last7Days, modelSplit, avgGenerationTime, aiSuccessRate } = useAdminStats();
  const [chartRange, setChartRange] = useState("7d");
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(6));
    const unsub = onSnapshot(q, (snap) => {
      setRecentUsers(snap.docs.map((d) => {
        const data = d.data();
        return {
          key: d.id,
          name: data.name || data.email?.split("@")[0] || "User",
          email: data.email || "",
          plan: data.plan || "free",
          credits: data.creditsRemaining ?? 0,
          status: data.suspended ? "Suspended" : "Active",
          joinedAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        };
      }));
      setUsersLoading(false);
    }, () => setUsersLoading(false));
    return () => unsub();
  }, []);

  const dailyData = last7Days();
  const { flashPct, proPct } = modelSplit();
  const avgTime = avgGenerationTime();
  const aiRate = aiSuccessRate();

  const chartData = dailyData.map((d) => ({
    day: d.label,
    Generations: d.count,
    Credits: Math.round(d.count * 1.4),
  }));

  const pieData = [
    { name: "Flash", value: stats.flashGenerations || 1, color: ACCENT },
    { name: "Pro", value: stats.proGenerations || 1, color: "#a78bfa" },
  ];

  const performanceMetrics = [
    { label: "AI Success Rate", value: aiRate, color: ACCENT },
    { label: "Flash Usage", value: flashPct, color: "#60a5fa" },
    { label: "Pro Usage", value: proPct, color: "#a78bfa" },
  ];

  const planColors: Record<string, string> = {
    pro: "#a78bfa",
    starter: "#60a5fa",
    free: "#6b7280",
  };

  const userColumns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar size={30} style={{ background: `hsl(${(record.name.charCodeAt(0) * 47) % 360}, 55%, 45%)`, fontWeight: 700, fontSize: 11 }}>
            {record.name[0].toUpperCase()}
          </Avatar>
          <div>
            <Text style={{ color: "#fff", fontWeight: 500, fontSize: 13, display: "block", lineHeight: 1.3 }}>{record.name}</Text>
            <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (plan: string) => (
        <Tag style={{ background: `${planColors[plan] || "#6b7280"}18`, border: `1px solid ${planColors[plan] || "#6b7280"}35`, color: planColors[plan] || "#6b7280", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
          {plan.charAt(0).toUpperCase() + plan.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Credits",
      dataIndex: "credits",
      key: "credits",
      render: (v: number) => <Text style={{ color: v === 0 ? "#f87171" : "rgba(255,255,255,0.7)", fontSize: 13 }}>{v}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => (
        <Tag style={{
          background: s === "Active" ? "rgba(137,233,0,0.10)" : "rgba(248,113,113,0.10)",
          border: `1px solid ${s === "Active" ? "rgba(137,233,0,0.25)" : "rgba(248,113,113,0.25)"}`,
          color: s === "Active" ? ACCENT : "#f87171",
          borderRadius: 20, fontSize: 11, fontWeight: 600, padding: "2px 10px",
        }}>
          ● {s}
        </Tag>
      ),
    },
    {
      title: "Joined",
      dataIndex: "joinedAt",
      key: "joinedAt",
      render: (d: Date) => <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{timeAgo(d)}</Text>,
    },
  ];

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>
            Dashboard
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>
            Welcome back — here's what's happening at Pixalera.
          </Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, display: "inline-block" }} />
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Live Data</Text>
        </div>
      </div>

      <Row gutter={[14, 14]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} lg={6}>
          <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} icon={UsersIcon} iconColor="#60a5fa" iconBg="rgba(96,165,250,0.12)" loading={stats.loading} trend={17} />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard label="Total Generations" value={stats.totalGenerations.toLocaleString()} icon={BoltIcon} iconColor={ACCENT} iconBg="rgba(137,233,0,0.10)" loading={stats.loading} trend={11} />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard label="Credits Used" value={stats.totalCreditsUsed.toLocaleString()} icon={CreditCardIcon} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.10)" loading={stats.loading} trend={-3} />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard label="Real AI Images" value={stats.realImageGenerations.toLocaleString()} icon={SparklesIcon} iconColor="#a78bfa" iconBg="rgba(167,139,250,0.10)" loading={stats.loading} trend={24} />
        </Col>
      </Row>

      <Row gutter={[14, 14]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={15}>
          <Card
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14, height: "100%" }}
            styles={{ body: { padding: "18px 20px 14px" } }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: 600, display: "block" }}>Generation Analytics</Text>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
                    {stats.totalGenerations.toLocaleString()}
                  </div>
                  <span style={{ fontSize: 11, color: ACCENT, fontWeight: 600, background: "rgba(137,233,0,0.10)", padding: "2px 7px", borderRadius: 20 }}>
                    +15% /Month
                  </span>
                </div>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Excellent performance this period</Text>
              </div>
              <Select
                value={chartRange}
                onChange={setChartRange}
                size="small"
                style={{ width: 90 }}
                options={[
                  { label: "7 Days", value: "7d" },
                  { label: "30 Days", value: "30d" },
                  { label: "Monthly", value: "monthly" },
                ]}
              />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.45)", paddingTop: 8 }} />
                <Line type="monotone" dataKey="Generations" stroke={ACCENT} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: ACCENT }} />
                <Line type="monotone" dataKey="Credits" stroke="rgba(137,233,0,0.35)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14, height: "100%" }}
            styles={{ body: { padding: "18px 20px" } }}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: 600, display: "block", marginBottom: 4 }}>Performance</Text>
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 16 }}>AI pipeline metrics</Text>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <PieChart width={140} height={140}>
                <Pie data={pieData} cx={65} cy={65} innerRadius={42} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip formatter={(v: any, name: any) => [v, name]} contentStyle={{ background: "#1e1e1e", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 18 }}>
              {pieData.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: "inline-block" }} />
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{d.name}</Text>
                </div>
              ))}
            </div>

            {performanceMetrics.map((m) => (
              <div key={m.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{m.label}</Text>
                  <Text style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>{m.value}%</Text>
                </div>
                <Progress percent={m.value} showInfo={false} strokeColor={m.color} trailColor="rgba(255,255,255,0.06)" size={{ height: 5 }} />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Row gutter={[14, 14]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }}
            styles={{ body: { padding: "18px 20px 14px" } }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: 600, display: "block" }}>Revenue Profile</Text>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", marginTop: 2 }}>
                  ${(stats.totalCreditsUsed * 0.05).toFixed(2)}
                  <span style={{ fontSize: 11, color: ACCENT, fontWeight: 600, marginLeft: 8, background: "rgba(137,233,0,0.10)", padding: "2px 7px", borderRadius: 20 }}>+11% /Month</span>
                </div>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Your performance is excellent</Text>
              </div>
              <Select size="small" defaultValue="monthly" style={{ width: 90 }} options={[{ label: "Monthly", value: "monthly" }, { label: "Weekly", value: "weekly" }]} />
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Credits" stroke="#a78bfa" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Row gutter={[14, 14]}>
            <Col span={12}>
              <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "18px 20px" } }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(137,233,0,0.10)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <ClockIcon style={{ width: 20, height: 20, color: ACCENT }} />
                </div>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", display: "block", marginBottom: 4 }}>Avg. Gen Time</Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
                  {stats.loading ? "—" : avgTime > 0 ? `${avgTime}s` : "N/A"}
                </div>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, display: "block" }}>per generation</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "18px 20px" } }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(52,211,153,0.10)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <CheckCircleIcon style={{ width: 20, height: 20, color: "#34d399" }} />
                </div>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", display: "block", marginBottom: 4 }}>AI Success Rate</Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
                  {stats.loading ? "—" : `${aiRate}%`}
                </div>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, display: "block" }}>real AI images</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "18px 20px" } }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(96,165,250,0.10)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <BoltIcon style={{ width: 20, height: 20, color: "#60a5fa" }} />
                </div>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", display: "block", marginBottom: 4 }}>Flash Jobs</Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
                  {stats.loading ? "—" : stats.flashGenerations.toLocaleString()}
                </div>
                <Text style={{ fontSize: 11, color: "#60a5fa", marginTop: 4, display: "block" }}>{flashPct}% of total</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "18px 20px" } }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(167,139,250,0.10)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <SparklesIcon style={{ width: 20, height: 20, color: "#a78bfa" }} />
                </div>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", display: "block", marginBottom: 4 }}>Pro Jobs</Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
                  {stats.loading ? "—" : stats.proGenerations.toLocaleString()}
                </div>
                <Text style={{ fontSize: 11, color: "#a78bfa", marginTop: 4, display: "block" }}>{proPct}% of total</Text>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Card
        style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: 600, display: "block" }}>Recent Users</Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Keep track of new signups</Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Select size="small" defaultValue="all" style={{ width: 100 }} options={[{ label: "All Status", value: "all" }, { label: "Active", value: "active" }, { label: "Suspended", value: "suspended" }]} />
          </div>
        </div>
        <Table
          dataSource={recentUsers}
          columns={userColumns}
          rowKey="key"
          loading={usersLoading}
          pagination={false}
          style={{ background: "transparent" }}
          size="small"
        />
      </Card>
    </div>
  );
}
