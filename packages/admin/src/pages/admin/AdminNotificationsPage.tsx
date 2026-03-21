import { useState, useEffect, useRef } from "react";
import { Card, Button, Select, Tag, Typography, Table, Modal, Form, Input, message, Dropdown } from "antd";
import {
  BellIcon, PlusIcon, TrashIcon, PaperAirplaneIcon,
  UsersIcon, EllipsisVerticalIcon, PhotoIcon,
} from "@heroicons/react/24/outline";
import {
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const ACCENT = "#89E900";
const CARD_BG = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
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
  imageUrl?: string;
  sentAt: Date;
  readBy: string[];
}

function ImageUpload({ value, onChange }: { value?: string; onChange?: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const path = `notifications/${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      onChange?.(url);
      message.success("Image uploaded");
    } catch (err: any) {
      message.error("Upload failed: " + err.message);
    }
    setUploading(false);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />
      {value && (
        <div style={{ position: "relative", marginBottom: 8 }}>
          <img src={value} alt="Preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: `1px solid ${BORDER}` }} />
          <button
            type="button"
            onClick={() => onChange?.("")}
            style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#f87171", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
          >
            ×
          </button>
        </div>
      )}
      <Button
        type="dashed"
        loading={uploading}
        onClick={() => inputRef.current?.click()}
        icon={<PhotoIcon style={{ width: 14, height: 14 }} />}
        style={{ background: "rgba(255,255,255,0.02)", border: `1px dashed ${BORDER}`, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 6, fontSize: 12, height: 34, paddingInline: 12 }}
      >
        {value ? "Change Image" : "Add Image (optional)"}
      </Button>
    </div>
  );
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
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
          imageUrl: data.imageUrl || "",
          sentAt: data.sentAt instanceof Timestamp ? data.sentAt.toDate() : new Date(),
          readBy: data.readBy || [],
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
        type: values.type || "info",
        target: values.target || "all",
        imageUrl: imageUrl || null,
        sentAt: serverTimestamp(),
        readBy: [],
        sentBy: "admin",
      });
      messageApi.success("Notification sent to all eligible users");
      setModalOpen(false);
      form.resetFields();
      setImageUrl("");
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
    { label: "Total Reads", value: notifications.reduce((sum, n) => sum + n.readBy.length, 0), color: "#f59e0b" },
  ];

  const columns = [
    {
      title: "Notification",
      key: "notification",
      render: (_: any, record: Notification) => (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: `${typeColors[record.type]}18`,
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {record.imageUrl ? (
              <img src={record.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <BellIcon style={{ width: 16, height: 16, color: typeColors[record.type] }} />
            )}
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
          <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
            {t === "all" ? "All Users" : t === "pro" ? "Pro Users" : t === "starter" ? "Starter Users" : "Free Users"}
          </Text>
        </div>
      ),
    },
    {
      title: "Reads",
      key: "reads",
      render: (_: any, r: Notification) => (
        <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{r.readBy.length}</Text>
      ),
    },
    {
      title: "Sent",
      dataIndex: "sentAt",
      key: "sentAt",
      render: (d: Date) => (
        <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
          {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      ),
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
          <Button
            type="text" size="small"
            icon={<EllipsisVerticalIcon style={{ width: 16, height: 16, color: "rgba(255,255,255,0.4)" }} />}
            style={{ width: 30, height: 30, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      {contextHolder}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <BellIcon style={{ width: 22, height: 22, color: ACCENT }} />
            <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>Notifications</Title>
          </div>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>Send and manage user notifications in real-time</Text>
        </div>
        <Button
          icon={<PlusIcon style={{ width: 15, height: 15 }} />}
          onClick={() => { setModalOpen(true); setImageUrl(""); form.resetFields(); }}
          style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 700, borderRadius: 8, height: 38, display: "flex", alignItems: "center", gap: 6 }}
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
        title={<span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Send Notification</span>}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); setImageUrl(""); }}
        footer={null}
        styles={{
          content: { background: "#1a1a1a", border: `1px solid ${BORDER}` },
          header: { background: "#1a1a1a", borderBottom: `1px solid ${BORDER}` },
          mask: { backdropFilter: "blur(6px)" },
        }}
      >
        <Form form={form} onFinish={handleSend} layout="vertical" initialValues={{ type: "info", target: "all" }} style={{ marginTop: 8 }}>
          <Form.Item name="title" label={<Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Title</Text>} rules={[{ required: true, message: "Title required" }]}>
            <Input placeholder="e.g. New feature launched!" style={{ background: "#242424", border: `1px solid #383838`, color: "#fff" }} />
          </Form.Item>

          <Form.Item name="body" label={<Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Message</Text>} rules={[{ required: true, message: "Message required" }]}>
            <Input.TextArea rows={3} placeholder="Notification body text..." style={{ background: "#242424", border: `1px solid #383838`, color: "#fff", resize: "none" }} />
          </Form.Item>

          <Form.Item label={<Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Image (optional)</Text>}>
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item name="type" label={<Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Type</Text>}>
              <Select
                options={[
                  { label: "Info", value: "info" },
                  { label: "Success", value: "success" },
                  { label: "Warning", value: "warning" },
                  { label: "Alert", value: "alert" },
                ]}
              />
            </Form.Item>
            <Form.Item name="target" label={<Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Target Audience</Text>}>
              <Select
                options={[
                  { label: "All Users", value: "all" },
                  { label: "Pro Users", value: "pro" },
                  { label: "Starter Users", value: "starter" },
                  { label: "Free Users", value: "free" },
                ]}
              />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: `1px solid ${BORDER}` }}>
            <Button onClick={() => { setModalOpen(false); form.resetFields(); setImageUrl(""); }} style={{ background: "#2a2a2a", border: `1px solid #383838`, color: "rgba(255,255,255,0.65)" }}>
              Cancel
            </Button>
            <Button
              htmlType="submit" loading={sending}
              icon={<PaperAirplaneIcon style={{ width: 14, height: 14 }} />}
              style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
            >
              Send
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
