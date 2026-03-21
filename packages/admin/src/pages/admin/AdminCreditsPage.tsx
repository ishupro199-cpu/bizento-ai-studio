import { useState, useEffect } from "react";
import { Card, Table, Tag, Typography, Button, Modal, Form, InputNumber, Select, message, Input } from "antd";
import {
  BoltIcon,
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { collection, onSnapshot, doc, updateDoc, addDoc, orderBy, query, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";

const ACCENT = "#89E900";
const CARD_BG = "#242424";
const BORDER = "#2e2e2e";
const { Title, Text } = Typography;

interface CreditUser {
  key: string;
  name: string;
  email: string;
  plan: string;
  creditsRemaining: number;
  creditsUsed: number;
  generations: number;
}

interface CreditLog {
  key: string;
  userId: string;
  userEmail: string;
  action: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  note: string;
  createdAt: Date;
}

export default function AdminCreditsPage() {
  const [users, setUsers] = useState<CreditUser[]>([]);
  const [logs, setLogs] = useState<CreditLog[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; user: CreditUser | null; action: "add" | "remove" }>({ open: false, user: null, action: "add" });
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => {
        const data = d.data();
        return {
          key: d.id,
          name: data.name || data.email?.split("@")[0] || "User",
          email: data.email || "",
          plan: data.plan || "free",
          creditsRemaining: data.creditsRemaining ?? 0,
          creditsUsed: data.creditsUsed ?? 0,
          generations: (data.flashGenerations || 0) + (data.proGenerations || 0),
        };
      }));
      setUsersLoading(false);
    }, () => setUsersLoading(false));

    const q = query(collection(db, "credits_logs"), orderBy("createdAt", "desc"));
    const unsub2 = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((d) => {
        const data = d.data();
        return {
          key: d.id,
          userId: data.userId || "",
          userEmail: data.userEmail || "",
          action: data.action || "add",
          amount: data.amount || 0,
          balanceBefore: data.balanceBefore || 0,
          balanceAfter: data.balanceAfter || 0,
          note: data.note || "",
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        };
      }));
      setLogsLoading(false);
    }, () => setLogsLoading(false));

    return () => { unsub1(); unsub2(); };
  }, []);

  const openModal = (user: CreditUser, action: "add" | "remove") => {
    form.resetFields();
    setModal({ open: true, user, action });
  };

  const handleCredits = async (values: { amount: number; note: string }) => {
    if (!modal.user) return;
    setSaving(true);
    try {
      const before = modal.user.creditsRemaining;
      const after = modal.action === "add" ? before + values.amount : Math.max(0, before - values.amount);
      await updateDoc(doc(db, "users", modal.user.key), { creditsRemaining: after, creditsUsed: modal.action === "remove" ? (modal.user.creditsUsed + values.amount) : modal.user.creditsUsed });
      await addDoc(collection(db, "credits_logs"), {
        userId: modal.user.key, userEmail: modal.user.email,
        action: modal.action, amount: values.amount,
        balanceBefore: before, balanceAfter: after,
        note: values.note || "",
        createdAt: serverTimestamp(), adminAction: true,
      });
      messageApi.success(`${values.amount} credits ${modal.action === "add" ? "added" : "removed"}`);
      setModal({ open: false, user: null, action: "add" });
    } catch {
      messageApi.error("Failed to update credits");
    }
    setSaving(false);
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalCredits = users.reduce((sum, u) => sum + u.creditsRemaining, 0);
  const totalUsed = users.reduce((sum, u) => sum + u.creditsUsed, 0);
  const zeroUsers = users.filter((u) => u.creditsRemaining === 0).length;

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const day = d.toLocaleDateString("en-US", { weekday: "short" });
    return { day, credits: logs.filter((l) => l.createdAt.toDateString() === d.toDateString() && l.action === "remove").reduce((sum, l) => sum + l.amount, 0) };
  });

  const planColors: Record<string, string> = { pro: "#a78bfa", starter: "#60a5fa", free: "#6b7280" };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_: any, record: CreditUser) => (
        <div>
          <Text style={{ color: "#fff", fontWeight: 500, fontSize: 13, display: "block" }}>{record.name}</Text>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>{record.email}</Text>
        </div>
      ),
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (p: string) => (
        <Tag style={{ background: `${planColors[p] || "#6b7280"}18`, border: `1px solid ${planColors[p] || "#6b7280"}35`, color: planColors[p] || "#6b7280", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Remaining",
      dataIndex: "creditsRemaining",
      key: "creditsRemaining",
      sorter: (a: CreditUser, b: CreditUser) => a.creditsRemaining - b.creditsRemaining,
      render: (v: number) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <BoltIcon style={{ width: 13, height: 13, color: v === 0 ? "#f87171" : ACCENT }} />
          <Text style={{ color: v === 0 ? "#f87171" : "#fff", fontWeight: 600, fontSize: 14 }}>{v}</Text>
        </div>
      ),
    },
    {
      title: "Used",
      dataIndex: "creditsUsed",
      key: "creditsUsed",
      render: (v: number) => <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{v}</Text>,
    },
    {
      title: "Generations",
      dataIndex: "generations",
      key: "generations",
      render: (v: number) => <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{v}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      render: (_: any, record: CreditUser) => (
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <Button size="small" icon={<PlusIcon style={{ width: 12, height: 12 }} />} onClick={() => openModal(record, "add")} style={{ background: "rgba(137,233,0,0.10)", border: "1px solid rgba(137,233,0,0.25)", color: ACCENT, fontWeight: 600, borderRadius: 6, height: 26, display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            Add
          </Button>
          <Button size="small" icon={<MinusIcon style={{ width: 12, height: 12 }} />} onClick={() => openModal(record, "remove")} style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.20)", color: "#f87171", fontWeight: 600, borderRadius: 6, height: 26, display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            Remove
          </Button>
        </div>
      ),
    },
  ];

  const logColumns = [
    { title: "User", dataIndex: "userEmail", key: "userEmail", render: (e: string) => <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>{e}</Text> },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (a: string) => (
        <Tag style={{ background: a === "add" ? "rgba(137,233,0,0.10)" : "rgba(248,113,113,0.10)", border: `1px solid ${a === "add" ? "rgba(137,233,0,0.25)" : "rgba(248,113,113,0.25)"}`, color: a === "add" ? ACCENT : "#f87171", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
          {a === "add" ? "+" : "-"}
        </Tag>
      ),
    },
    { title: "Amount", dataIndex: "amount", key: "amount", render: (v: number, r: CreditLog) => <Text style={{ color: r.action === "add" ? ACCENT : "#f87171", fontWeight: 600, fontSize: 13 }}>{r.action === "add" ? "+" : "-"}{v}</Text> },
    { title: "Before → After", key: "balance", render: (_: any, r: CreditLog) => <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{r.balanceBefore} → {r.balanceAfter}</Text> },
    { title: "Note", dataIndex: "note", key: "note", render: (n: string) => <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{n || "—"}</Text> },
    { title: "Date", dataIndex: "createdAt", key: "createdAt", render: (d: Date) => <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Text> },
  ];

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      {contextHolder}
      <div style={{ marginBottom: 22 }}>
        <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>Credits</Title>
        <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>Manage user credit balances in real-time</Text>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) 1.4fr", gap: 12, marginBottom: 18 }}>
        <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "16px 18px" } }}>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Total Remaining</Text>
          <div style={{ fontSize: 26, fontWeight: 700, color: ACCENT, letterSpacing: "-0.5px" }}>{totalCredits.toLocaleString()}</div>
        </Card>
        <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "16px 18px" } }}>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Total Used</Text>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#60a5fa", letterSpacing: "-0.5px" }}>{totalUsed.toLocaleString()}</div>
        </Card>
        <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "16px 18px" } }}>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Zero Balance</Text>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#f87171", letterSpacing: "-0.5px" }}>{zeroUsers}</div>
        </Card>
        <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "14px 16px" } }}>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Credits Consumed (7d)</Text>
          <ResponsiveContainer width="100%" height={54}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="credits" stroke={ACCENT} strokeWidth={2} fill="url(#cGrad)" />
              <XAxis dataKey="day" hide />
              <Tooltip contentStyle={{ background: "#1e1e1e", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
          <Input
            prefix={<MagnifyingGlassIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />}
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 240, background: "#2a2a2a", border: `1px solid #383838`, borderRadius: 8 }}
            variant="borderless"
          />
          <div style={{ flex: 1 }} />
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{filtered.length} users</Text>
        </div>
        <Table dataSource={filtered} columns={columns} rowKey="key" loading={usersLoading} pagination={{ pageSize: 10, size: "small" }} style={{ background: "transparent" }} size="small" />
      </Card>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}` }}>
          <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Credits Activity Log</Text>
        </div>
        {logs.length === 0 && !logsLoading ? (
          <div style={{ padding: "36px 24px", textAlign: "center" }}>
            <BoltIcon style={{ width: 32, height: 32, color: "rgba(255,255,255,0.12)", margin: "0 auto 10px" }} />
            <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, display: "block" }}>No credit logs yet</Text>
          </div>
        ) : (
          <Table dataSource={logs} columns={logColumns} rowKey="key" loading={logsLoading} pagination={{ pageSize: 8, size: "small" }} style={{ background: "transparent" }} size="small" />
        )}
      </Card>

      <Modal
        title={<span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{modal.action === "add" ? "Add" : "Remove"} Credits — {modal.user?.name}</span>}
        open={modal.open}
        onCancel={() => setModal({ open: false, user: null, action: "add" })}
        footer={null}
        styles={{ content: { background: "#242424", border: `1px solid ${BORDER}` }, header: { background: "#242424", borderBottom: `1px solid ${BORDER}` }, mask: { backdropFilter: "blur(4px)" } }}
      >
        {modal.user && (
          <div style={{ marginBottom: 16, padding: "12px 14px", background: "rgba(137,233,0,0.06)", borderRadius: 10, border: `1px solid rgba(137,233,0,0.15)` }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Current Balance</Text>
            <div style={{ fontSize: 28, fontWeight: 700, color: ACCENT }}>{modal.user.creditsRemaining} credits</div>
          </div>
        )}
        <Form form={form} onFinish={handleCredits} layout="vertical" initialValues={{ amount: 10 }}>
          <Form.Item name="amount" label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Amount</span>} rules={[{ required: true, type: "number", min: 1 }]}>
            <InputNumber min={1} style={{ width: "100%", background: "#2a2a2a", border: `1px solid #383838` }} />
          </Form.Item>
          <Form.Item name="note" label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Note (optional)</span>}>
            <Input placeholder="Reason for adjustment..." style={{ background: "#2a2a2a", border: `1px solid #383838` }} />
          </Form.Item>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button onClick={() => setModal({ open: false, user: null, action: "add" })}>Cancel</Button>
            <Button htmlType="submit" loading={saving} style={{ background: modal.action === "add" ? ACCENT : "#f87171", border: "none", color: modal.action === "add" ? "#000" : "#fff", fontWeight: 600 }}>
              {modal.action === "add" ? "Add Credits" : "Remove Credits"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
