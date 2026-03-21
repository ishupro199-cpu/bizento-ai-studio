import { useState, useEffect } from "react";
import { Table, Card, Input, Button, Tag, Avatar, Typography, Select, Dropdown, Modal, Form, InputNumber, message, Skeleton } from "antd";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  TrashIcon,
  KeyIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

async function adminApiCall(endpoint: string, body: Record<string, any>) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`/api/admin${endpoint}`, {
    method: endpoint.includes("/users/") && endpoint.endsWith("/delete") ? "DELETE" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

const ACCENT = "#89E900";
const CARD_BG = "#242424";
const BORDER = "#2e2e2e";

const { Title, Text } = Typography;

const planColors: Record<string, string> = {
  pro: "#a78bfa",
  starter: "#60a5fa",
  free: "#6b7280",
};

interface FirestoreUser {
  key: string;
  name: string;
  email: string;
  plan: string;
  credits: number;
  status: string;
  role: string;
  generations: number;
  joinedAt: Date;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [creditsModal, setCreditsModal] = useState<{ open: boolean; user: FirestoreUser | null }>({ open: false, user: null });
  const [creditsForm] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => {
        const data = d.data();
        return {
          key: d.id,
          name: data.name || data.email?.split("@")[0] || "User",
          email: data.email || "",
          plan: data.plan || "free",
          credits: data.creditsRemaining ?? 0,
          status: data.suspended ? "Suspended" : "Active",
          role: data.role || "user",
          generations: (data.flashGenerations || 0) + (data.proGenerations || 0),
          joinedAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        };
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const toggleSuspend = async (record: FirestoreUser) => {
    try {
      const newSuspended = record.status === "Active";
      const res = await adminApiCall("/users/suspend", {
        targetUserId: record.key,
        suspend: newSuspended,
        reason: "Admin action",
      });
      if (res.success) {
        messageApi.success(`User ${newSuspended ? "suspended" : "activated"} successfully`);
      } else {
        await updateDoc(doc(db, "users", record.key), { suspended: newSuspended });
        messageApi.success(`User ${newSuspended ? "suspended" : "activated"} successfully`);
      }
    } catch {
      messageApi.error("Failed to update user status");
    }
  };

  const sendReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      messageApi.success("Password reset email sent");
    } catch {
      messageApi.error("Failed to send reset email");
    }
  };

  const deleteUser = async (uid: string) => {
    Modal.confirm({
      title: "Delete User",
      content: "Are you sure you want to delete this user? This action cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteDoc(doc(db, "users", uid));
          messageApi.success("User deleted");
        } catch {
          messageApi.error("Failed to delete user");
        }
      },
    });
  };

  const updatePlan = async (uid: string, plan: string) => {
    try {
      await updateDoc(doc(db, "users", uid), { plan });
      messageApi.success("Plan updated");
    } catch {
      messageApi.error("Failed to update plan");
    }
  };

  const handleAddCredits = async (values: { credits: number; action: string }) => {
    if (!creditsModal.user) return;
    setActionLoading(true);
    try {
      const res = await adminApiCall("/credits/adjust", {
        targetUserId: creditsModal.user.key,
        amount: values.credits,
        action: values.action,
        reason: "Admin manual adjustment",
      });
      if (res.success) {
        messageApi.success(`Credits ${values.action === "add" ? "added" : "removed"} successfully`);
      } else {
        const current = creditsModal.user.credits;
        const newCredits = values.action === "add" ? current + values.credits : Math.max(0, current - values.credits);
        await updateDoc(doc(db, "users", creditsModal.user.key), { creditsRemaining: newCredits });
        messageApi.success(`Credits ${values.action === "add" ? "added" : "removed"} successfully`);
      }
      setCreditsModal({ open: false, user: null });
      creditsForm.resetFields();
    } catch {
      messageApi.error("Failed to update credits");
    }
    setActionLoading(false);
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || u.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const columns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: FirestoreUser) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar size={34} style={{ background: `hsl(${(record.name.charCodeAt(0) * 47) % 360}, 55%, 45%)`, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            {record.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <Text style={{ color: "#fff", fontWeight: 500, fontSize: 13, display: "block" }}>{record.name}</Text>
            <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (plan: string, record: FirestoreUser) => (
        <Select
          value={plan}
          size="small"
          style={{ width: 100 }}
          onChange={(v) => updatePlan(record.key, v)}
          options={[
            { label: "Free", value: "free" },
            { label: "Starter", value: "starter" },
            { label: "Pro", value: "pro" },
          ]}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      title: "Credits",
      dataIndex: "credits",
      key: "credits",
      render: (credits: number, record: FirestoreUser) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Text style={{ color: credits === 0 ? "#f87171" : "rgba(255,255,255,0.75)", fontWeight: 500, fontSize: 13 }}>{credits}</Text>
          <button
            onClick={() => { setCreditsModal({ open: true, user: record }); creditsForm.resetFields(); }}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
          >
            <BoltIcon style={{ width: 13, height: 13, color: ACCENT }} />
          </button>
        </div>
      ),
    },
    {
      title: "Gens",
      dataIndex: "generations",
      key: "generations",
      render: (v: number) => <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{v}</Text>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag style={{ background: role === "admin" ? "rgba(137,233,0,0.10)" : "rgba(255,255,255,0.05)", border: `1px solid ${role === "admin" ? "rgba(137,233,0,0.25)" : "rgba(255,255,255,0.10)"}`, color: role === "admin" ? ACCENT : "rgba(255,255,255,0.45)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
          {role}
        </Tag>
      ),
    },
    {
      title: "Joined",
      dataIndex: "joinedAt",
      key: "joinedAt",
      render: (d: Date) => <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag style={{
          background: status === "Active" ? "rgba(137,233,0,0.10)" : "rgba(248,113,113,0.10)",
          border: `1px solid ${status === "Active" ? "rgba(137,233,0,0.25)" : "rgba(248,113,113,0.25)"}`,
          color: status === "Active" ? ACCENT : "#f87171",
          borderRadius: 20, fontSize: 11, fontWeight: 600, padding: "2px 10px",
        }}>
          ● {status}
        </Tag>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: FirestoreUser) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "toggle",
                label: record.status === "Active" ? "Suspend User" : "Activate User",
                icon: record.status === "Active" ? <NoSymbolIcon style={{ width: 14, height: 14 }} /> : <CheckCircleIcon style={{ width: 14, height: 14 }} />,
                onClick: () => toggleSuspend(record),
              },
              {
                key: "credits",
                label: "Manage Credits",
                icon: <BoltIcon style={{ width: 14, height: 14 }} />,
                onClick: () => { setCreditsModal({ open: true, user: record }); creditsForm.resetFields(); },
              },
              {
                key: "reset",
                label: "Send Password Reset",
                icon: <KeyIcon style={{ width: 14, height: 14 }} />,
                onClick: () => sendReset(record.email),
              },
              { type: "divider" as const },
              {
                key: "delete",
                label: "Delete User",
                icon: <TrashIcon style={{ width: 14, height: 14 }} />,
                danger: true,
                onClick: () => deleteUser(record.key),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" size="small" icon={<EllipsisVerticalIcon style={{ width: 16, height: 16, color: "rgba(255,255,255,0.4)" }} />} style={{ width: 30, height: 30, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      {contextHolder}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>Users</Title>
          {loading ? (
            <Skeleton.Input active style={{ width: 180, height: 18, marginTop: 4 }} />
          ) : (
            <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>
              {users.length} total · {users.filter((u) => u.status === "Active").length} active · {users.filter((u) => u.status === "Suspended").length} suspended
            </Text>
          )}
        </div>
        <Button
          icon={<UserPlusIcon style={{ width: 15, height: 15 }} />}
          style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 600, borderRadius: 8, height: 36, display: "flex", alignItems: "center", gap: 6 }}
        >
          Add User
        </Button>
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, flexWrap: "wrap" }}>
          <Input
            prefix={<MagnifyingGlassIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 260, background: "#2a2a2a", border: `1px solid #383838`, borderRadius: 8 }}
            variant="borderless"
          />
          <Select
            value={planFilter}
            onChange={setPlanFilter}
            style={{ width: 120 }}
            options={[
              { label: "All Plans", value: "all" },
              { label: "Pro", value: "pro" },
              { label: "Starter", value: "starter" },
              { label: "Free", value: "free" },
            ]}
          />
          <div style={{ flex: 1 }} />
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{filtered.length} results</Text>
          <Button type="text" icon={<FunnelIcon style={{ width: 15, height: 15, color: "rgba(255,255,255,0.45)" }} />} style={{ height: 32, width: 32, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }} />
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="key"
          loading={loading}
          pagination={{ pageSize: 10, size: "small", showTotal: (total) => <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{total} users</Text> }}
          style={{ background: "transparent" }}
          size="small"
        />
      </Card>

      <Modal
        title={<span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Manage Credits — {creditsModal.user?.name}</span>}
        open={creditsModal.open}
        onCancel={() => { setCreditsModal({ open: false, user: null }); creditsForm.resetFields(); }}
        footer={null}
        styles={{ content: { background: "#242424", border: `1px solid ${BORDER}` }, header: { background: "#242424", borderBottom: `1px solid ${BORDER}` }, mask: { backdropFilter: "blur(4px)" } }}
      >
        {creditsModal.user && (
          <div style={{ marginBottom: 16, padding: "12px 14px", background: "rgba(137,233,0,0.06)", borderRadius: 10, border: `1px solid rgba(137,233,0,0.15)` }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Current Balance</Text>
            <div style={{ fontSize: 28, fontWeight: 700, color: ACCENT, letterSpacing: "-0.5px" }}>{creditsModal.user.credits}</div>
            <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>credits remaining</Text>
          </div>
        )}
        <Form form={creditsForm} onFinish={handleAddCredits} layout="vertical" initialValues={{ action: "add", credits: 10 }}>
          <Form.Item name="action" label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Action</span>}>
            <Select options={[{ label: "Add Credits", value: "add" }, { label: "Remove Credits", value: "remove" }]} />
          </Form.Item>
          <Form.Item name="credits" label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Amount</span>} rules={[{ required: true, type: "number", min: 1 }]}>
            <InputNumber min={1} style={{ width: "100%", background: "#2a2a2a", border: `1px solid #383838`, color: "#fff" }} />
          </Form.Item>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <Button onClick={() => setCreditsModal({ open: false, user: null })}>Cancel</Button>
            <Button htmlType="submit" loading={actionLoading} style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 600 }}>
              Apply
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
