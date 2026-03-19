import { useState, useEffect } from "react";
import { Card, Table, Input, Select, Typography, Tag, Avatar, Image, Button, Space, Tooltip, Modal, message } from "antd";
import {
  MagnifyingGlassIcon, FolderIcon, PhotoIcon, TrashIcon, EyeIcon,
  BoltIcon, SparklesIcon, XMarkIcon,
} from "@heroicons/react/24/outline";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ACCENT = "#89E900";
const CARD_BG = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const { Title, Text } = Typography;

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface Generation {
  id: string;
  prompt?: string;
  tool?: string;
  model?: string;
  userEmail?: string;
  userId?: string;
  hasRealImages?: boolean;
  images?: string[];
  createdAt: Date;
}

export default function AdminProjectsPage() {
  const [gens, setGens] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toolFilter, setToolFilter] = useState("all");
  const [previewImages, setPreviewImages] = useState<string[] | null>(null);
  const [msgApi, ctx] = message.useMessage();

  useEffect(() => {
    const q = query(collection(db, "generations"), orderBy("createdAt", "desc"), limit(200));
    const unsub = onSnapshot(q, snap => {
      setGens(snap.docs.map(d => {
        const data = d.data();
        const ts = data.createdAt;
        return {
          id: d.id,
          prompt: data.prompt,
          tool: data.tool || "Generate Catalog",
          model: data.model || "flash",
          userEmail: data.userEmail || data.userId || "—",
          userId: data.userId,
          hasRealImages: data.hasRealImages ?? false,
          images: data.images || [],
          createdAt: ts instanceof Timestamp ? ts.toDate() : new Date(),
        };
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const TOOLS = [...new Set(gens.map(g => g.tool).filter(Boolean))];

  const filtered = gens.filter(g => {
    const matchSearch = (g.prompt || "").toLowerCase().includes(search.toLowerCase()) || (g.userEmail || "").toLowerCase().includes(search.toLowerCase());
    const matchTool = toolFilter === "all" || g.tool === toolFilter;
    return matchSearch && matchTool;
  });

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "generations", id));
    msgApi.success("Deleted");
  };

  const columns = [
    {
      title: "Prompt",
      key: "prompt",
      render: (_: any, g: Generation) => (
        <div>
          <Text style={{ color: "#fff", fontSize: 13 }} ellipsis>
            {g.prompt ? `"${g.prompt.slice(0, 60)}${g.prompt.length > 60 ? "…" : ""}"` : "No prompt"}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, display: "block" }}>{g.userEmail}</Text>
        </div>
      ),
    },
    {
      title: "Tool",
      dataIndex: "tool",
      key: "tool",
      render: (t: string) => (
        <Tag style={{ background: "rgba(137,233,0,0.08)", border: "1px solid rgba(137,233,0,0.2)", color: ACCENT, borderRadius: 6, fontSize: 11 }}>{t}</Tag>
      ),
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
      render: (m: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {m === "flash" ? <BoltIcon style={{ width: 12, height: 12, color: "#f59e0b" }} /> : <SparklesIcon style={{ width: 12, height: 12, color: "#a78bfa" }} />}
          <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>{m}</Text>
        </div>
      ),
    },
    {
      title: "Real AI",
      key: "hasRealImages",
      render: (_: any, g: Generation) => (
        <Tag style={{
          background: g.hasRealImages ? "rgba(137,233,0,0.10)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${g.hasRealImages ? "rgba(137,233,0,0.25)" : "rgba(255,255,255,0.12)"}`,
          color: g.hasRealImages ? ACCENT : "rgba(255,255,255,0.35)",
          borderRadius: 20, fontSize: 10, padding: "2px 8px",
        }}>
          {g.hasRealImages ? "Real" : "Preview"}
        </Tag>
      ),
    },
    {
      title: "Time",
      key: "createdAt",
      render: (_: any, g: Generation) => <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{timeAgo(g.createdAt)}</Text>,
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: any, g: Generation) => (
        <Space>
          {g.images && g.images.length > 0 && (
            <Tooltip title="View Images">
              <Button type="text" size="small" icon={<EyeIcon style={{ width: 15, height: 15, color: "#60a5fa" }} />}
                onClick={() => setPreviewImages(g.images!)} style={{ width: 30, height: 30, padding: 0 }} />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Button type="text" size="small" danger icon={<TrashIcon style={{ width: 15, height: 15 }} />}
              onClick={() => handleDelete(g.id)} style={{ width: 30, height: 30, padding: 0 }} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const totalReal = gens.filter(g => g.hasRealImages).length;

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      {ctx}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <FolderIcon style={{ width: 22, height: 22, color: ACCENT }} />
            <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>Projects</Title>
          </div>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>
            All user generations — {gens.length} total, {totalReal} real AI images
          </Text>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Generations", value: gens.length, color: "#fff" },
          { label: "Real AI Images", value: totalReal, color: ACCENT },
          { label: "Preview Generations", value: gens.length - totalReal, color: "rgba(255,255,255,0.45)" },
        ].map(s => (
          <Card key={s.label} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }} styles={{ body: { padding: "14px 18px" } }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
            <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>{s.label}</Text>
          </Card>
        ))}
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, flexWrap: "wrap" }}>
          <Input
            prefix={<MagnifyingGlassIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />}
            placeholder="Search by prompt or user..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 280, background: "#2a2a2a", border: `1px solid #383838`, borderRadius: 8 }}
            variant="borderless"
          />
          <Select
            value={toolFilter} onChange={setToolFilter} style={{ width: 180 }}
            options={[{ label: "All Tools", value: "all" }, ...TOOLS.map(t => ({ label: t, value: t }))]}
          />
          <div style={{ flex: 1 }} />
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{filtered.length} results</Text>
        </div>
        <Table dataSource={filtered} columns={columns} rowKey="id" loading={loading}
          pagination={{ pageSize: 15, size: "small" }} style={{ background: "transparent" }} size="small" />
      </Card>

      <Modal
        open={!!previewImages} onCancel={() => setPreviewImages(null)} footer={null} width={800}
        title={<span style={{ color: "#fff" }}>Generated Images</span>}
        styles={{ content: { background: "#1a1a1a", border: `1px solid ${BORDER}` }, header: { background: "#1a1a1a", borderBottom: `1px solid ${BORDER}` } }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, padding: "16px 0" }}>
          {previewImages?.map((url, i) => (
            <Image key={i} src={url} style={{ borderRadius: 8, width: "100%", height: 160, objectFit: "cover" }} />
          ))}
        </div>
      </Modal>
    </div>
  );
}
