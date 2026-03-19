import { useState, useEffect } from "react";
import { Table, Card, Input, Select, Tag, Typography, Skeleton } from "antd";
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserMinusIcon,
  CreditCardIcon,
  BoltIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";

const CARD_BG = "#242424";
const BORDER = "#2e2e2e";
const ACCENT = "#89E900";

const { Title, Text } = Typography;

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  plan_change:   { label: "Plan Changed",  color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  credit_adjust: { label: "Credits Adj.",  color: ACCENT,    bg: "rgba(137,233,0,0.10)" },
  user_suspend:  { label: "Suspended",     color: "#f87171", bg: "rgba(248,113,113,0.10)" },
  user_activate: { label: "Activated",     color: "#34d399", bg: "rgba(52,211,153,0.10)" },
  user_delete:   { label: "Deleted",       color: "#f87171", bg: "rgba(248,113,113,0.10)" },
  admin_login:   { label: "Admin Login",   color: "#a78bfa", bg: "rgba(167,139,250,0.10)" },
  system:        { label: "System",        color: "#6b7280", bg: "rgba(107,114,128,0.10)" },
};

interface AdminLog {
  id: string;
  action: string;
  adminEmail: string;
  targetUserEmail: string;
  details: string;
  meta: Record<string, any>;
  createdAt: Date;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    const q = query(
      collection(db, "adminLogs"),
      orderBy("createdAt", "desc"),
      limit(200)
    );

    const unsub = onSnapshot(q, (snap) => {
      setLogs(
        snap.docs.map((d) => {
          const data = d.data();
          const raw = data.createdAt;
          return {
            id: d.id,
            action: data.action || "system",
            adminEmail: data.adminEmail || "system",
            targetUserEmail: data.targetUserEmail || "",
            details: data.details || "",
            meta: data.meta || {},
            createdAt: raw instanceof Timestamp ? raw.toDate() : raw ? new Date(raw) : new Date(),
          };
        })
      );
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, []);

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.targetUserEmail.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const columns = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string) => {
        const cfg = ACTION_CONFIG[action] || ACTION_CONFIG.system;
        return (
          <Tag style={{ background: cfg.bg, border: `1px solid ${cfg.color}30`, color: cfg.color, borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
      render: (details: string) => (
        <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>{details}</Text>
      ),
    },
    {
      title: "Admin",
      dataIndex: "adminEmail",
      key: "adminEmail",
      render: (email: string) => (
        <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{email}</Text>
      ),
    },
    {
      title: "Target",
      dataIndex: "targetUserEmail",
      key: "targetUserEmail",
      render: (email: string) =>
        email ? (
          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{email}</Text>
        ) : (
          <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>—</Text>
        ),
    },
    {
      title: "Time",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d: Date) => (
        <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
          {format(d, "MMM d, yyyy · h:mm a")}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>
            Admin Logs
          </Title>
          {loading ? (
            <Skeleton.Input active style={{ width: 180, height: 18, marginTop: 4 }} />
          ) : (
            <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>
              {logs.length} total events
            </Text>
          )}
        </div>
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, flexWrap: "wrap" }}>
          <Input
            prefix={<MagnifyingGlassIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />}
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 260, background: "#2a2a2a", border: `1px solid #383838`, borderRadius: 8 }}
            variant="borderless"
          />
          <Select
            value={actionFilter}
            onChange={setActionFilter}
            style={{ width: 155 }}
            options={[
              { label: "All Actions", value: "all" },
              { label: "Plan Changed", value: "plan_change" },
              { label: "Credits Adj.", value: "credit_adjust" },
              { label: "Suspended", value: "user_suspend" },
              { label: "Activated", value: "user_activate" },
              { label: "Deleted", value: "user_delete" },
            ]}
          />
          <div style={{ flex: 1 }} />
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{filtered.length} results</Text>
        </div>

        {logs.length === 0 && !loading ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <ShieldCheckIcon style={{ width: 40, height: 40, color: "rgba(255,255,255,0.15)", margin: "0 auto 12px" }} />
            <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, display: "block" }}>
              No admin logs yet
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
              Logs will appear here when admin actions are performed
            </Text>
          </div>
        ) : (
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20, size: "small", showTotal: (total) => <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{total} logs</Text> }}
            style={{ background: "transparent" }}
            size="small"
          />
        )}
      </Card>
    </div>
  );
}
