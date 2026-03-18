import { useState, useEffect } from "react";
import { Card, Button, Input, Select, Tag, Typography, Table, Modal, Form, message, Switch, Skeleton } from "antd";
import {
  BellIcon,
  PlusIcon,
  TrashIcon,
  PaperAirplaneIcon,
  UsersIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import {
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dropdown } from "antd";

const ACCENT = "#89E900";
const CARD_BG = "#242424";
const BORDER = "#2e2e2e";
const { Title, Text } = Typography;

const typeColors: Record<string, string> = {
  info: "#60a5fa",
  success: ACCENT,
  warning: "#f59e0b",
  alert: "#f87171",
};

interface Notification {
  key: string;
  title: string;
  body: string;
  type: string;
  target: string;
  sentAt: Date;
  read: boolean;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("sentAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => {
        const data = d.data();
        return {
          key: d.id,
          title: data.title || "",
          body: data.body || "",
          type: data.type || "info",
          target: data.target || "all",
          sentAt: data.sentAt instanceof Timestamp ? data.sentAt.toDate() : new Date(),
          read: data.read ?? false,
        };
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const handleSend = async (values: any) => {
    setSending(true);
    try {
      await addDoc(collection(db, "notifications"), {
        title: values.title,
        body: values.body,
        type: values.type,
        target: values.target,
        sentAt: serverTimestamp(),
        read: false,
        sentBy: "admin",
      });
      messageApi.success("Notification sent successfully");
      setModalOpen(false);
      form.resetFields();
    } catch {
      messageApi.error("Failed to send notification");
    }
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      messageApi.success("Notification deleted");
    } catch {
      messageApi.error("Failed to delete");
    }
  };

  const stats = [
    { label: "Total Sent", value: notifications.length, color: "#60a5fa" },
    { label: "To All Users", value: notifications.filter((n) => n.target === "all").length, color: ACCENT },
    { label: "Alerts", value: notifications.filter((n) => n.type === "alert").length, color: "#f87171" },
    { label: "Info", value: notifications.filter((n) => n.type === "info").length, color: "#f59e0b" },
  ];

  const columns = [
    {
      title: "Notification",
      key: "notification",
      render: (_: any, record: Notification) => (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${typeColors[record.type]}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
            <BellIcon style={{ width: 16, height: 16, color: typeColors[record.type] }} />
          </div>
          <div>
            <Text style={{ color: "#fff", fontWeight: 500, fontSize: 13, display: "block" }}>{record.title}</Text>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{record.body}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag style={{ background: `${typeColors[type]}18`, border: `1px solid ${typeColors[type]}35`, color: typeColors[type], borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>
          {type}
        </Tag>
      ),
    },
    {
      title: "Target",
      dataIndex: "target",
      key: "target",
      render: (t: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <UsersIcon style={{ width: 13, height: 13, color: "rgba(255,255,255,0.4)" }} />
          <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>{t === "all" ? "All Users" : t}</Text>
        </div>
      ),
    },
    {
      title: "Sent",
      dataIndex: "sentAt",
      key: "sentAt",
      render: (d: Date) => <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Text>,
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: any, record: Notification) => (
        <Dropdown
          menu={{
            items: [
              { key: "delete", label: "Delete", icon: <TrashIcon style={{ width: 14, height: 14 }} />, danger: true, onClick: () => handleDelete(record.key) },
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
          <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>Notifications</Title>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>Send and manage user notifications in real-time</Text>
        </div>
        <Button
          icon={<PlusIcon style={{ width: 15, height: 15 }} />}
          onClick={() => setModalOpen(true)}
          style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 600, borderRadius: 8, height: 36, display: "flex", alignItems: "center", gap: 6 }}
        >
          Send Notification
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        {stats.map((s) => (
          <Card key={s.label} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "16px 18px" } }}>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>{s.label}</Text>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Notification History</Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{notifications.length} total</Text>
        </div>
        <Table
          dataSource={notifications}
          columns={columns}
          rowKey="key"
          loading={loading}
          pagination={{ pageSize: 10, size: "small" }}
          style={{ background: "transparent" }}
          size="small"
        />
      </Card>

      <Modal
        title={<span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Send Notification</span>}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        styles={{ content: { background: "#242424", border: `1px solid ${BORDER}` }, header: { background: "#242424", borderBottom: `1px solid ${BORDER}` }, mask: { backdropFilter: "blur(4px)" } }}
      >
        <Form form={form} onFinish={handleSend} layout="vertical" initialValues={{ type: "info", target: "all" }} style={{ marginTop: 8 }}>
          <Form.Item name="title" label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Title</span>} rules={[{ required: true }]}>
            <Input placeholder="Notification title" style={{ background: "#2a2a2a", border: `1px solid #383838` }} />
          </Form.Item>
          <Form.Item name="body" label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Message</span>} rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Notification body" style={{ background: "#2a2a2a", border: `1px solid #383838` }} />
          </Form.Item>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item name="type" label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Type</span>}>
              <Select options={[{ label: "Info", value: "info" }, { label: "Success", value: "success" }, { label: "Warning", value: "warning" }, { label: "Alert", value: "alert" }]} />
            </Form.Item>
            <Form.Item name="target" label={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Target</span>}>
              <Select options={[{ label: "All Users", value: "all" }, { label: "Pro Users", value: "pro" }, { label: "Free Users", value: "free" }]} />
            </Form.Item>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button htmlType="submit" loading={sending} icon={<PaperAirplaneIcon style={{ width: 14, height: 14 }} />} style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              Send
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
