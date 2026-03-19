import { useState, useEffect } from "react";
import {
  Card, Table, Button, Input, Select, Modal, Form, Switch, Tag, Upload, Typography,
  message, Tooltip, Badge, Popconfirm, Space, Tabs, Image, Empty, Spin
} from "antd";
import {
  PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon,
  PhotoIcon, SparklesIcon, TagIcon, CheckCircleIcon, XCircleIcon, ArrowUpTrayIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import {
  collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy,
} from "firebase/firestore";
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const ACCENT = "#89E900";
const CARD_BG = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const CATEGORIES = ["Catalog", "Ads", "CGI", "Fashion", "Lifestyle", "Minimal", "Luxury", "Tech"];
const TIERS = [
  { label: "Free", value: "free", color: "#6b7280" },
  { label: "Starter", value: "starter", color: "#60a5fa" },
  { label: "Pro", value: "pro", color: "#a78bfa" },
];
const TIER_ALL = ["free", "starter", "pro"];

const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 40%, #2d1b69 100%)",
  "linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)",
  "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
  "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
  "linear-gradient(135deg, #0d0221 0%, #0a1045 30%, #190041 60%, #2d0041 100%)",
  "linear-gradient(135deg, #03045e 0%, #0077b6 50%, #00b4d8 100%)",
  "linear-gradient(135deg, #8b5e3c 0%, #c8965a 50%, #f0e6d3 100%)",
];

interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  label: string;
  tier: string;
  gradient: string;
  bgDark: boolean;
  published: boolean;
  imageUrl?: string;
  accentColor: string;
  createdAt?: any;
}

function PromptFormModal({
  open, onClose, editItem, onSaved,
}: { open: boolean; onClose: () => void; editItem: Prompt | null; onSaved: () => void }) {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [msgApi, ctx] = message.useMessage();

  useEffect(() => {
    if (open) {
      if (editItem) {
        form.setFieldsValue({ ...editItem });
        setImageUrl(editItem.imageUrl || "");
      } else {
        form.resetFields();
        form.setFieldsValue({
          tier: "free", bgDark: true, published: true,
          gradient: GRADIENT_PRESETS[0], accentColor: "#89E900", category: "Catalog",
        });
        setImageUrl("");
      }
    }
  }, [open, editItem]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const path = `inspiration/${Date.now()}_${file.name}`;
      const ref = storageRef(storage, path);
      const task = uploadBytesResumable(ref, file);
      await new Promise<void>((resolve, reject) => {
        task.on("state_changed", null, reject, resolve);
      });
      const url = await getDownloadURL(ref);
      setImageUrl(url);
      form.setFieldValue("imageUrl", url);
      msgApi.success("Image uploaded");
    } catch {
      msgApi.error("Upload failed");
    }
    setUploading(false);
    return false;
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const data = { ...values, imageUrl, updatedAt: serverTimestamp() };
      if (editItem) {
        await updateDoc(doc(db, "inspirationPrompts", editItem.id), data);
        msgApi.success("Prompt updated");
      } else {
        await addDoc(collection(db, "inspirationPrompts"), { ...data, createdAt: serverTimestamp() });
        msgApi.success("Prompt created");
      }
      onSaved();
      onClose();
    } catch {
      msgApi.error("Failed to save");
    }
    setSaving(false);
  };

  return (
    <>
      {ctx}
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={680}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SparklesIcon style={{ width: 18, height: 18, color: ACCENT }} />
            <span style={{ color: "#fff", fontWeight: 700 }}>{editItem ? "Edit Prompt" : "Add Prompt"}</span>
          </div>
        }
        styles={{
          content: { background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 16 },
          header: { background: "#1a1a1a", borderBottom: `1px solid ${BORDER}`, borderRadius: "16px 16px 0 0" },
          mask: { backdropFilter: "blur(6px)" },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Form.Item name="title" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Title</Text>} rules={[{ required: true }]}>
              <Input placeholder="Amazon Best Seller Look" style={{ background: "#242424", border: `1px solid #383838`, color: "#fff" }} />
            </Form.Item>
            <Form.Item name="label" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Badge Label</Text>} rules={[{ required: true }]}>
              <Input placeholder="High Conversion" style={{ background: "#242424", border: `1px solid #383838`, color: "#fff" }} />
            </Form.Item>
          </div>

          <Form.Item name="description" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Description</Text>} rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="Describe this style..." style={{ background: "#242424", border: `1px solid #383838`, color: "#fff", resize: "none" }} />
          </Form.Item>

          <Form.Item name="prompt" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>AI Prompt</Text>} rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Clean white background, ecommerce style, sharp focus..." style={{ background: "#242424", border: `1px solid #383838`, color: "#fff", resize: "none" }} />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
            <Form.Item name="category" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Category</Text>}>
              <Select options={CATEGORIES.map(c => ({ label: c, value: c }))} />
            </Form.Item>
            <Form.Item name="tier" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Min. Tier</Text>}>
              <Select options={TIERS.map(t => ({ label: t.label, value: t.value }))} />
            </Form.Item>
            <Form.Item name="accentColor" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Accent Color</Text>}>
              <Input placeholder="#89E900" style={{ background: "#242424", border: `1px solid #383838`, color: "#fff" }} />
            </Form.Item>
          </div>

          <Form.Item name="gradient" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Background Gradient</Text>}>
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {GRADIENT_PRESETS.map((g, i) => (
                  <button
                    key={i} type="button"
                    onClick={() => form.setFieldValue("gradient", g)}
                    style={{ width: 32, height: 32, borderRadius: 8, background: g, border: form.getFieldValue("gradient") === g ? `2px solid ${ACCENT}` : "2px solid transparent", cursor: "pointer" }}
                  />
                ))}
              </div>
              <Input
                value={form.getFieldValue("gradient")}
                onChange={e => form.setFieldValue("gradient", e.target.value)}
                placeholder="linear-gradient(...)"
                style={{ background: "#242424", border: `1px solid #383838`, color: "#fff", fontSize: 12 }}
              />
            </div>
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Form.Item name="bgDark" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Dark Background</Text>} valuePropName="checked">
              <Switch checkedChildren="Dark" unCheckedChildren="Light" />
            </Form.Item>
            <Form.Item name="published" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Published</Text>} valuePropName="checked">
              <Switch checkedChildren="Live" unCheckedChildren="Draft" style={{ background: form.getFieldValue("published") ? ACCENT : undefined }} />
            </Form.Item>
          </div>

          <Form.Item label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Preview Image (optional)</Text>}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {imageUrl && (
                <Image src={imageUrl} width={80} height={60} style={{ borderRadius: 8, objectFit: "cover" }} />
              )}
              <Upload
                beforeUpload={handleImageUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  icon={<ArrowUpTrayIcon style={{ width: 14, height: 14 }} />}
                  loading={uploading}
                  style={{ background: "#242424", border: `1px solid #383838`, color: "rgba(255,255,255,0.7)", borderRadius: 8 }}
                >
                  {imageUrl ? "Replace" : "Upload Image"}
                </Button>
              </Upload>
              {imageUrl && (
                <Button
                  type="text" size="small" danger
                  onClick={() => { setImageUrl(""); form.setFieldValue("imageUrl", ""); }}
                >
                  Remove
                </Button>
              )}
            </div>
          </Form.Item>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: `1px solid ${BORDER}` }}>
            <Button onClick={onClose} style={{ background: "#2a2a2a", border: `1px solid #383838`, color: "rgba(255,255,255,0.65)" }}>Cancel</Button>
            <Button htmlType="submit" loading={saving} style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 700, borderRadius: 8 }}>
              {editItem ? "Update" : "Create"} Prompt
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

export default function AdminInspirationHub() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Prompt | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [msgApi, ctx] = message.useMessage();

  useEffect(() => {
    const q = query(collection(db, "inspirationPrompts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPrompts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Prompt)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const togglePublished = async (p: Prompt) => {
    try {
      await updateDoc(doc(db, "inspirationPrompts", p.id), { published: !p.published });
      msgApi.success(p.published ? "Unpublished" : "Published");
    } catch {
      msgApi.error("Failed to update");
    }
  };

  const handleDelete = async (p: Prompt) => {
    try {
      await deleteDoc(doc(db, "inspirationPrompts", p.id));
      msgApi.success("Deleted");
    } catch {
      msgApi.error("Failed to delete");
    }
  };

  const openEdit = (p: Prompt) => { setEditItem(p); setModalOpen(true); };
  const openNew = () => { setEditItem(null); setModalOpen(true); };

  const filtered = prompts.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.prompt?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchTier = tierFilter === "all" || p.tier === tierFilter;
    return matchSearch && matchCat && matchTier;
  });

  const tierInfo = (tier: string) => TIERS.find(t => t.value === tier) || TIERS[0];

  const columns = [
    {
      title: "Prompt",
      key: "title",
      render: (_: any, p: Prompt) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 52, height: 40, borderRadius: 8, background: p.gradient || "#1a1a1a",
              flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {p.imageUrl
              ? <img src={p.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              : <SparklesIcon style={{ width: 16, height: 16, color: p.accentColor || "#89E900", opacity: 0.7 }} />
            }
          </div>
          <div>
            <Text style={{ color: "#fff", fontWeight: 500, fontSize: 13, display: "block" }}>{p.title}</Text>
            <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, display: "block" }} ellipsis>
              {p.prompt?.slice(0, 60)}{p.prompt?.length > 60 ? "…" : ""}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (c: string) => (
        <Tag style={{ background: "rgba(137,233,0,0.08)", border: `1px solid rgba(137,233,0,0.2)`, color: ACCENT, borderRadius: 6, fontSize: 11 }}>
          {c}
        </Tag>
      ),
    },
    {
      title: "Tier",
      dataIndex: "tier",
      key: "tier",
      render: (t: string) => {
        const info = tierInfo(t);
        return (
          <Tag style={{ background: `${info.color}18`, border: `1px solid ${info.color}35`, color: info.color, borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
            {info.label}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      key: "published",
      render: (_: any, p: Prompt) => (
        <Tag style={{
          background: p.published ? "rgba(137,233,0,0.10)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${p.published ? "rgba(137,233,0,0.25)" : "rgba(255,255,255,0.12)"}`,
          color: p.published ? ACCENT : "rgba(255,255,255,0.45)",
          borderRadius: 20, fontSize: 11, fontWeight: 600, padding: "2px 10px",
        }}>
          ● {p.published ? "Live" : "Draft"}
        </Tag>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: any, p: Prompt) => (
        <Space>
          <Tooltip title={p.published ? "Unpublish" : "Publish"}>
            <Button
              type="text" size="small"
              icon={p.published
                ? <EyeSlashIcon style={{ width: 15, height: 15, color: "rgba(255,255,255,0.4)" }} />
                : <EyeIcon style={{ width: 15, height: 15, color: ACCENT }} />
              }
              onClick={() => togglePublished(p)}
              style={{ width: 30, height: 30, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text" size="small"
              icon={<PencilIcon style={{ width: 15, height: 15, color: "rgba(255,255,255,0.4)" }} />}
              onClick={() => openEdit(p)}
              style={{ width: 30, height: 30, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete prompt?"
            description="This will remove it from the inspiration hub for all users."
            onConfirm={() => handleDelete(p)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                type="text" size="small" danger
                icon={<TrashIcon style={{ width: 15, height: 15 }} />}
                style={{ width: 30, height: 30, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: prompts.length,
    published: prompts.filter(p => p.published).length,
    free: prompts.filter(p => p.tier === "free").length,
    starter: prompts.filter(p => p.tier === "starter").length,
    pro: prompts.filter(p => p.tier === "pro").length,
  };

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      {ctx}

      <div style={{ marginBottom: 22, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <LightBulbIcon style={{ width: 22, height: 22, color: ACCENT }} />
            <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>
              Inspiration Hub
            </Title>
          </div>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>
            Manage prompt library — real-time sync to user Inspiration Hub
          </Text>
        </div>
        <Button
          icon={<PlusIcon style={{ width: 15, height: 15 }} />}
          onClick={openNew}
          style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 700, borderRadius: 8, height: 38, display: "flex", alignItems: "center", gap: 6 }}
        >
          Add Prompt
        </Button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Prompts", value: stats.total, color: "#fff" },
          { label: "Published", value: stats.published, color: ACCENT },
          { label: "Free", value: stats.free, color: "#6b7280" },
          { label: "Starter", value: stats.starter, color: "#60a5fa" },
          { label: "Pro", value: stats.pro, color: "#a78bfa" },
        ].map(s => (
          <Card key={s.label} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }} styles={{ body: { padding: "14px 18px" } }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, flexWrap: "wrap" }}>
          <Input
            prefix={<MagnifyingGlassIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />}
            placeholder="Search prompts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 240, background: "#2a2a2a", border: `1px solid #383838`, borderRadius: 8 }}
            variant="borderless"
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 130 }}
            options={[{ label: "All Categories", value: "all" }, ...CATEGORIES.map(c => ({ label: c, value: c }))]}
          />
          <Select
            value={tierFilter}
            onChange={setTierFilter}
            style={{ width: 110 }}
            options={[{ label: "All Tiers", value: "all" }, ...TIERS.map(t => ({ label: t.label, value: t.value }))]}
          />
          <div style={{ flex: 1 }} />
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{filtered.length} prompts</Text>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : filtered.length === 0 ? (
          <Empty
            description={<Text style={{ color: "rgba(255,255,255,0.35)" }}>{prompts.length === 0 ? "No prompts yet — add your first one!" : "No prompts match your filters"}</Text>}
            style={{ padding: 60 }}
          />
        ) : (
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 12, size: "small", showTotal: (t) => <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{t} prompts</Text> }}
            style={{ background: "transparent" }}
            size="small"
          />
        )}
      </Card>

      {/* Visual grid preview */}
      {!loading && prompts.length > 0 && (
        <Card
          style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14, marginTop: 20 }}
          styles={{ body: { padding: "18px 20px" } }}
        >
          <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14, display: "block", marginBottom: 16 }}>
            Preview (as users see it)
          </Text>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {prompts.filter(p => p.published).slice(0, 12).map(p => (
              <div
                key={p.id}
                style={{
                  borderRadius: 12, overflow: "hidden",
                  border: `1px solid rgba(255,255,255,0.08)`,
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ height: 90, background: p.gradient, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    : <div style={{ width: 32, height: 40, borderRadius: 6, background: p.bgDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }} />
                  }
                  <div style={{ position: "absolute", top: 6, left: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 20, background: "rgba(0,0,0,0.4)", color: "#fff", backdropFilter: "blur(8px)" }}>
                      {p.label}
                    </span>
                  </div>
                  <div style={{ position: "absolute", top: 6, right: 6 }}>
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 20, background: tierInfo(p.tier).color + "30", color: tierInfo(p.tier).color, border: `1px solid ${tierInfo(p.tier).color}40` }}>
                      {tierInfo(p.tier).label}
                    </span>
                  </div>
                </div>
                <div style={{ padding: "8px 10px" }}>
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: 500, display: "block" }} ellipsis>{p.title}</Text>
                  <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>{p.category}</Text>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <PromptFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editItem={editItem}
        onSaved={() => {}}
      />
    </div>
  );
}
