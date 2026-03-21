import { useState, useEffect } from "react";
import { Card, Button, Switch, Typography, message, Table, Tag, Select, InputNumber, Form, Modal, Tooltip, Space, Progress } from "antd";
import {
  CpuChipIcon, BoltIcon, SparklesIcon, AdjustmentsHorizontalIcon,
  PencilIcon, CheckCircleIcon, XCircleIcon,
} from "@heroicons/react/24/outline";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ACCENT = "#89E900";
const CARD_BG = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const { Title, Text } = Typography;

const DEFAULT_TOOLS = [
  { key: "bg_generation", name: "AI Background Generation", model: "flux-schnell", credits: 2, enabled: true, usageCount: 0, desc: "Swap backgrounds with AI-generated scenes" },
  { key: "multi_angle", name: "Multi-Angle Rendering", model: "flux-schnell", credits: 3, enabled: true, usageCount: 0, desc: "Generate multiple product angles from a single shot" },
  { key: "fashion_model", name: "AI Fashion Models", model: "flux-dev", credits: 5, enabled: true, usageCount: 0, desc: "Place apparel on AI-generated fashion models" },
  { key: "style_variations", name: "Style Variations", model: "flux-schnell", credits: 2, enabled: true, usageCount: 0, desc: "Generate lifestyle, editorial and catalog variations" },
  { key: "batch_processing", name: "Batch Processing", model: "flux-schnell", credits: 1.5, enabled: false, usageCount: 0, desc: "Process hundreds of images simultaneously" },
  { key: "bg_removal", name: "Background Removal", model: "rembg", credits: 1, enabled: true, usageCount: 0, desc: "Automatic background removal with rembg" },
  { key: "product_analysis", name: "Product Analysis", model: "llava-13b", credits: 0.5, enabled: true, usageCount: 0, desc: "Auto-categorize and analyze product images" },
  { key: "cinematic_ads", name: "Cinematic Ad Creator", model: "flux-dev", credits: 8, enabled: true, usageCount: 0, desc: "Hollywood-grade product advertisements" },
];

export default function AdminAiToolsPage() {
  const [tools, setTools] = useState(DEFAULT_TOOLS);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<{ open: boolean; tool: any | null }>({ open: false, tool: null });
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [msgApi, ctx] = message.useMessage();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "adminConfig", "aiTools"), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setTools(prev => prev.map(t => ({ ...t, ...(data[t.key] || {}) })));
      }
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const saveToolConfig = async (key: string, updates: any) => {
    try {
      await setDoc(doc(db, "adminConfig", "aiTools"), { [key]: updates }, { merge: true });
    } catch {
      msgApi.error("Failed to save");
    }
  };

  const toggleTool = async (tool: any) => {
    const updated = { ...tool, enabled: !tool.enabled };
    setTools(t => t.map(i => i.key === tool.key ? updated : i));
    await saveToolConfig(tool.key, { enabled: updated.enabled });
    msgApi.success(updated.enabled ? `${tool.name} enabled` : `${tool.name} disabled`);
  };

  const openEdit = (tool: any) => {
    form.setFieldsValue({ credits: tool.credits, model: tool.model });
    setEditModal({ open: true, tool });
  };

  const handleEditSave = async (values: any) => {
    if (!editModal.tool) return;
    setSaving(true);
    const updated = { ...editModal.tool, ...values };
    setTools(t => t.map(i => i.key === editModal.tool!.key ? updated : i));
    await saveToolConfig(editModal.tool.key, { credits: values.credits, model: values.model });
    msgApi.success("Updated");
    setSaving(false);
    setEditModal({ open: false, tool: null });
  };

  const enabledCount = tools.filter(t => t.enabled).length;
  const totalCredits = tools.reduce((s, t) => s + t.credits, 0);

  const columns = [
    {
      title: "Tool",
      key: "name",
      render: (_: any, t: any) => (
        <div>
          <Text style={{ color: "#fff", fontWeight: 500, fontSize: 13, display: "block" }}>{t.name}</Text>
          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{t.desc}</Text>
        </div>
      ),
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
      render: (m: string) => (
        <Tag style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa", borderRadius: 6, fontSize: 11 }}>
          {m}
        </Tag>
      ),
    },
    {
      title: "Credits / Use",
      dataIndex: "credits",
      key: "credits",
      render: (c: number) => (
        <Text style={{ color: ACCENT, fontWeight: 700, fontSize: 13 }}>{c} <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400, fontSize: 11 }}>credits</span></Text>
      ),
    },
    {
      title: "Status",
      key: "enabled",
      render: (_: any, t: any) => (
        <Switch
          checked={t.enabled}
          onChange={() => toggleTool(t)}
          checkedChildren="On" unCheckedChildren="Off"
          style={{ background: t.enabled ? ACCENT : undefined }}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: any, t: any) => (
        <Tooltip title="Edit credits & model">
          <Button type="text" size="small" icon={<AdjustmentsHorizontalIcon style={{ width: 15, height: 15, color: "rgba(255,255,255,0.4)" }} />}
            onClick={() => openEdit(t)} style={{ width: 30, height: 30, padding: 0 }} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      {ctx}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <CpuChipIcon style={{ width: 22, height: 22, color: ACCENT }} />
            <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>AI Tools</Title>
          </div>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>Enable/disable tools and configure credits per use</Text>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Active Tools", value: enabledCount, total: tools.length, color: ACCENT },
          { label: "Disabled Tools", value: tools.length - enabledCount, total: tools.length, color: "#f87171" },
          { label: "Avg. Credits / Tool", value: (totalCredits / tools.length).toFixed(1), total: null, color: "#f59e0b" },
        ].map(s => (
          <Card key={s.label} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }} styles={{ body: { padding: "16px 20px" } }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: "-0.5px", marginBottom: 2 }}>{s.value}</div>
            <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>{s.label}</Text>
            {s.total && <Progress percent={Math.round((Number(s.value) / s.total) * 100)} showInfo={false} strokeColor={s.color} trailColor="rgba(255,255,255,0.06)" size={{ height: 4 }} style={{ marginTop: 10 }} />}
          </Card>
        ))}
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>AI Tool Configuration</Text>
          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginLeft: 10 }}>Changes take effect immediately</Text>
        </div>
        <Table dataSource={tools} columns={columns} rowKey="key" loading={loading} pagination={false} style={{ background: "transparent" }} size="small" />
      </Card>

      <Modal
        open={editModal.open} onCancel={() => setEditModal({ open: false, tool: null })} footer={null}
        title={<span style={{ color: "#fff", fontWeight: 700 }}>Edit — {editModal.tool?.name}</span>}
        styles={{ content: { background: "#1a1a1a", border: `1px solid ${BORDER}` }, header: { background: "#1a1a1a", borderBottom: `1px solid ${BORDER}` }, mask: { backdropFilter: "blur(6px)" } }}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSave} style={{ marginTop: 16 }}>
          <Form.Item name="credits" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Credits Per Use</Text>}>
            <InputNumber min={0.5} step={0.5} style={{ width: "100%", background: "#242424", border: `1px solid #383838`, color: "#fff" }} />
          </Form.Item>
          <Form.Item name="model" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>AI Model</Text>}>
            <Select options={[
              { label: "flux-schnell (Fast)", value: "flux-schnell" },
              { label: "flux-dev (Quality)", value: "flux-dev" },
              { label: "llava-13b (Vision)", value: "llava-13b" },
              { label: "rembg (Remove BG)", value: "rembg" },
            ]} />
          </Form.Item>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: `1px solid ${BORDER}` }}>
            <Button onClick={() => setEditModal({ open: false, tool: null })} style={{ background: "#2a2a2a", border: `1px solid #383838`, color: "rgba(255,255,255,0.65)" }}>Cancel</Button>
            <Button htmlType="submit" loading={saving} style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 700 }}>Save</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
