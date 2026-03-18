import { useState, useEffect } from "react";
import { Card, Table, Tag, Typography, Select, Input, Button } from "antd";
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { collection, query, orderBy, limit, onSnapshot, Timestamp, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const ACCENT = "#89E900";
const CARD_BG = "#242424";
const BORDER = "#2e2e2e";
const { Title, Text } = Typography;

const actionColors: Record<string, string> = {
  user_ban: "#f87171",
  user_activate: ACCENT,
  credits_add: "#60a5fa",
  credits_remove: "#f59e0b",
  plan_change: "#a78bfa",
  settings_update: "#34d399",
  notification_send: "#f59e0b",
  user_delete: "#f87171",
  login: "rgba(255,255,255,0.4)",
};

interface LogEntry {
  key: string;
  action: string;
  target: string;
  adminEmail: string;
  details: string;
  timestamp: Date;
}

export function useAdminLogger() {
  const { user } = useAuth();

  const log = async (action: string, target: string, details: string) => {
    try {
      await addDoc(collection(db, "admin_logs"), {
        action,
        target,
        details,
        adminEmail: user?.email || "unknown",
        adminUid: user?.uid || "",
        timestamp: serverTimestamp(),
      });
    } catch {
    }
  };

  return { log };
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "admin_logs"), orderBy("timestamp", "desc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((d) => {
        const data = d.data();
        return {
          key: d.id,
          action: data.action || "",
          target: data.target || "",
          adminEmail: data.adminEmail || "system",
          details: data.details || "",
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
        };
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const filtered = logs.filter((l) => {
    const matchSearch = l.target.toLowerCase().includes(search.toLowerCase()) || l.adminEmail.toLowerCase().includes(search.toLowerCase()) || l.details.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const allActions = Array.from(new Set(logs.map((l) => l.action))).filter(Boolean);

  const columns = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string) => {
        const color = actionColors[action] || "rgba(255,255,255,0.45)";
        const label = action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return (
          <Tag style={{ background: `${color}18`, border: `1px solid ${color}35`, color, borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Target",
      dataIndex: "target",
      key: "target",
      render: (t: string) => <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "monospace" }}>{t}</Text>,
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
      render: (d: string) => <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{d}</Text>,
    },
    {
      title: "Admin",
      dataIndex: "adminEmail",
      key: "adminEmail",
      render: (e: string) => <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{e}</Text>,
    },
    {
      title: "Time",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (d: Date) => (
        <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
          {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} {d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>Admin Logs</Title>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>Audit trail of all admin actions</Text>
        </div>
        <Button
          icon={<ArrowDownTrayIcon style={{ width: 15, height: 15 }} />}
          style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, color: "rgba(255,255,255,0.7)", fontWeight: 600, borderRadius: 8, height: 36, display: "flex", alignItems: "center", gap: 6 }}
        >
          Export
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Total Logs", value: logs.length, color: "#60a5fa" },
          { label: "Today", value: logs.filter((l) => new Date().toDateString() === l.timestamp.toDateString()).length, color: ACCENT },
          { label: "User Actions", value: logs.filter((l) => l.action.startsWith("user_")).length, color: "#a78bfa" },
          { label: "Credit Actions", value: logs.filter((l) => l.action.startsWith("credits_")).length, color: "#f59e0b" },
        ].map((s) => (
          <Card key={s.label} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "16px 18px" } }}>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>{s.label}</Text>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Input
            prefix={<MagnifyingGlassIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />}
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 240, background: "#2a2a2a", border: `1px solid #383838`, borderRadius: 8 }}
            variant="borderless"
          />
          <Select
            value={actionFilter}
            onChange={setActionFilter}
            style={{ width: 160 }}
            options={[{ label: "All Actions", value: "all" }, ...allActions.map((a) => ({ label: a.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), value: a }))]}
          />
          <div style={{ flex: 1 }} />
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{filtered.length} entries</Text>
        </div>

        {logs.length === 0 && !loading ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <ClipboardDocumentListIcon style={{ width: 36, height: 36, color: "rgba(255,255,255,0.15)", margin: "0 auto 12px" }} />
            <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, display: "block" }}>No admin logs yet</Text>
            <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>Admin actions like banning users or changing plans will appear here</Text>
          </div>
        ) : (
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="key"
            loading={loading}
            pagination={{ pageSize: 15, size: "small" }}
            style={{ background: "transparent" }}
            size="small"
          />
        )}
      </Card>
    </div>
  );
}
