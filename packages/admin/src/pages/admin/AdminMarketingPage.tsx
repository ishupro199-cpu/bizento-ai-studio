import { useState, useEffect } from "react";
import { Card, Button, Input, Select, Switch, Typography, message, Form, Tag, Table, Modal, Popconfirm, Badge, Space } from "antd";
import {
  MegaphoneIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon,
  BellAlertIcon, GiftIcon, LinkIcon, ChartBarIcon,
} from "@heroicons/react/24/outline";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ACCENT = "#89E900";
const CARD_BG = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const { Title, Text } = Typography;

const BANNER_TYPES = ["announcement", "promo", "info", "warning"];
const BANNER_COLORS: Record<string, string> = {
  announcement: "#a78bfa",
  promo: "#89E900",
  info: "#60a5fa",
  warning: "#f59e0b",
};

interface Banner {
  id: string;
  message: string;
  type: string;
  cta?: string;
  ctaUrl?: string;
  active: boolean;
  createdAt?: any;
}

function BannerModal({ open, onClose, editItem }: { open: boolean; onClose: () => void; editItem: Banner | null }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [msgApi, ctx] = message.useMessage();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(editItem || { type: "announcement", active: true });
    }
  }, [open, editItem]);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      if (editItem) {
        await updateDoc(doc(db, "marketingBanners", editItem.id), values);
      } else {
        await addDoc(collection(db, "marketingBanners"), { ...values, createdAt: serverTimestamp() });
      }
      msgApi.success("Saved");
      onClose();
    } catch {
      msgApi.error("Failed");
    }
    setSaving(false);
  };

  return (
    <>
      {ctx}
      <Modal
        open={open} onCancel={onClose} footer={null} width={560}
        title={<span style={{ color: "#fff", fontWeight: 700 }}>{editItem ? "Edit Banner" : "New Banner"}</span>}
        styles={{ content: { background: "#1a1a1a", border: `1px solid ${BORDER}` }, header: { background: "#1a1a1a", borderBottom: `1px solid ${BORDER}` }, mask: { backdropFilter: "blur(6px)" } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="message" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Banner Message</Text>} rules={[{ required: true }]}>
            <Input.TextArea rows={2} style={{ background: "#242424", border: `1px solid #383838`, color: "#fff" }} placeholder="🎉 New feature launched! Try it now." />
          </Form.Item>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Form.Item name="type" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Type</Text>}>
              <Select options={BANNER_TYPES.map(t => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: t }))} />
            </Form.Item>
            <Form.Item name="active" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Active</Text>} valuePropName="checked">
              <Switch checkedChildren="Live" unCheckedChildren="Draft" />
            </Form.Item>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Form.Item name="cta" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>CTA Button (opt.)</Text>}>
              <Input style={{ background: "#242424", border: `1px solid #383838`, color: "#fff" }} placeholder="Learn More" />
            </Form.Item>
            <Form.Item name="ctaUrl" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>CTA URL</Text>}>
              <Input style={{ background: "#242424", border: `1px solid #383838`, color: "#fff" }} placeholder="/pricing" />
            </Form.Item>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: `1px solid ${BORDER}` }}>
            <Button onClick={onClose} style={{ background: "#2a2a2a", border: `1px solid #383838`, color: "rgba(255,255,255,0.65)" }}>Cancel</Button>
            <Button htmlType="submit" loading={saving} style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 700 }}>
              {editItem ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

export default function AdminMarketingPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Banner | null>(null);
  const [msgApi, ctx] = message.useMessage();

  useEffect(() => {
    const q = query(collection(db, "marketingBanners"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const toggleActive = async (b: Banner) => {
    await updateDoc(doc(db, "marketingBanners", b.id), { active: !b.active });
    msgApi.success(b.active ? "Banner disabled" : "Banner activated");
  };

  const handleDelete = async (b: Banner) => {
    await deleteDoc(doc(db, "marketingBanners", b.id));
    msgApi.success("Deleted");
  };

  const columns = [
    {
      title: "Message",
      key: "message",
      render: (_: any, b: Banner) => (
        <div>
          <Text style={{ color: "#fff", fontSize: 13, display: "block" }}>{b.message}</Text>
          {b.cta && <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>CTA: {b.cta} → {b.ctaUrl}</Text>}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (t: string) => (
        <Tag style={{ background: `${BANNER_COLORS[t] || "#6b7280"}18`, border: `1px solid ${BANNER_COLORS[t] || "#6b7280"}35`, color: BANNER_COLORS[t] || "#6b7280", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
          {t}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "active",
      render: (_: any, b: Banner) => (
        <Tag style={{ background: b.active ? "rgba(137,233,0,0.10)" : "rgba(255,255,255,0.06)", border: `1px solid ${b.active ? "rgba(137,233,0,0.25)" : "rgba(255,255,255,0.12)"}`, color: b.active ? ACCENT : "rgba(255,255,255,0.45)", borderRadius: 20, fontSize: 11, fontWeight: 600, padding: "2px 10px" }}>
          ● {b.active ? "Live" : "Draft"}
        </Tag>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: any, b: Banner) => (
        <Space>
          <Button type="text" size="small" icon={<EyeIcon style={{ width: 15, height: 15, color: b.active ? ACCENT : "rgba(255,255,255,0.35)" }} />} onClick={() => toggleActive(b)} style={{ width: 30, height: 30, padding: 0 }} />
          <Button type="text" size="small" icon={<PencilIcon style={{ width: 15, height: 15, color: "rgba(255,255,255,0.4)" }} />} onClick={() => { setEditItem(b); setModalOpen(true); }} style={{ width: 30, height: 30, padding: 0 }} />
          <Popconfirm title="Delete banner?" onConfirm={() => handleDelete(b)} okText="Delete" okButtonProps={{ danger: true }}>
            <Button type="text" size="small" danger icon={<TrashIcon style={{ width: 15, height: 15 }} />} style={{ width: 30, height: 30, padding: 0 }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const METRIC_CARDS = [
    { label: "Active Banners", value: banners.filter(b => b.active).length, color: ACCENT, icon: MegaphoneIcon },
    { label: "Total Banners", value: banners.length, color: "#60a5fa", icon: BellAlertIcon },
    { label: "Promotions", value: banners.filter(b => b.type === "promo").length, color: "#a78bfa", icon: GiftIcon },
  ];

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      {ctx}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <MegaphoneIcon style={{ width: 22, height: 22, color: ACCENT }} />
            <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>Marketing</Title>
          </div>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>Manage announcement banners, promo bars, and marketing content</Text>
        </div>
        <Button icon={<PlusIcon style={{ width: 15, height: 15 }} />} onClick={() => { setEditItem(null); setModalOpen(true); }}
          style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 700, borderRadius: 8, height: 38, display: "flex", alignItems: "center", gap: 6 }}>
          New Banner
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {METRIC_CARDS.map(m => (
          <Card key={m.label} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }} styles={{ body: { padding: "16px 20px" } }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${m.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <m.icon style={{ width: 18, height: 18, color: m.color }} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: m.color, letterSpacing: "-0.5px" }}>{m.value}</div>
                <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>{m.label}</Text>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Announcement Banners</Text>
          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginLeft: 10 }}>Show at top of the website</Text>
        </div>
        <Table
          dataSource={banners} columns={columns} rowKey="id" loading={loading}
          pagination={{ pageSize: 8, size: "small" }} style={{ background: "transparent" }} size="small"
        />
      </Card>

      <BannerModal open={modalOpen} onClose={() => setModalOpen(false)} editItem={editItem} />
    </div>
  );
}
