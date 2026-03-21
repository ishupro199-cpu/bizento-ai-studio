import { useState, useEffect } from "react";
import { Card, Table, Input, Select, Typography, Tag, Button, Space, Modal, Form, Tooltip, Badge, message, Popconfirm } from "antd";
import {
  LifebuoyIcon, MagnifyingGlassIcon, PaperAirplaneIcon, TrashIcon,
  CheckCircleIcon, ClockIcon, XCircleIcon, EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ACCENT = "#89E900";
const CARD_BG = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const { Title, Text } = Typography;

const STATUS_COLORS: Record<string, string> = {
  open: "#f59e0b",
  "in-progress": "#60a5fa",
  resolved: ACCENT,
  closed: "#6b7280",
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  userEmail: string;
  status: string;
  priority: string;
  adminNote?: string;
  createdAt: Date;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [msgApi, ctx] = message.useMessage();

  useEffect(() => {
    const q = query(collection(db, "supportTickets"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setTickets(snap.docs.map(d => {
        const data = d.data();
        const ts = data.createdAt;
        return {
          id: d.id,
          subject: data.subject || "No subject",
          message: data.message || "",
          userEmail: data.userEmail || "unknown",
          status: data.status || "open",
          priority: data.priority || "normal",
          adminNote: data.adminNote,
          createdAt: ts instanceof Timestamp ? ts.toDate() : new Date(),
        };
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "supportTickets", id), { status });
    msgApi.success("Status updated");
    if (selectedTicket?.id === id) setSelectedTicket(t => t ? { ...t, status } : null);
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setReplying(true);
    await updateDoc(doc(db, "supportTickets", selectedTicket.id), {
      adminNote: replyText.trim(),
      status: "in-progress",
      repliedAt: serverTimestamp(),
    });
    setReplyText("");
    msgApi.success("Reply saved");
    setReplying(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "supportTickets", id));
    msgApi.success("Ticket deleted");
    if (selectedTicket?.id === id) setSelectedTicket(null);
  };

  const filtered = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.userEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: "Ticket",
      key: "subject",
      render: (_: any, t: Ticket) => (
        <div>
          <Text style={{ color: "#fff", fontWeight: 500, fontSize: 13, display: "block" }}>{t.subject}</Text>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>{t.userEmail} · {timeAgo(t.createdAt)}</Text>
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (p: string) => {
        const colors: Record<string, string> = { high: "#f87171", normal: "#60a5fa", low: "#6b7280" };
        return <Tag style={{ background: `${colors[p]}18`, border: `1px solid ${colors[p]}35`, color: colors[p], borderRadius: 6, fontSize: 11 }}>{p}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string, t: Ticket) => (
        <Select
          value={s} size="small" style={{ width: 130 }}
          onChange={v => updateStatus(t.id, v)}
          options={["open", "in-progress", "resolved", "closed"].map(v => ({ label: v.charAt(0).toUpperCase() + v.slice(1), value: v }))}
          onClick={e => e.stopPropagation()}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: any, t: Ticket) => (
        <Space>
          <Tooltip title="View & Reply">
            <Button type="text" size="small" icon={<EnvelopeIcon style={{ width: 15, height: 15, color: "#60a5fa" }} />}
              onClick={() => setSelectedTicket(t)} style={{ width: 30, height: 30, padding: 0 }} />
          </Tooltip>
          <Popconfirm title="Delete ticket?" onConfirm={() => handleDelete(t.id)} okText="Delete" okButtonProps={{ danger: true }}>
            <Button type="text" size="small" danger icon={<TrashIcon style={{ width: 15, height: 15 }} />} style={{ width: 30, height: 30, padding: 0 }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in-progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      {ctx}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <LifebuoyIcon style={{ width: 22, height: 22, color: ACCENT }} />
            <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>Support</Title>
          </div>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>{openCount} open tickets · {inProgressCount} in progress</Text>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Open", value: openCount, color: "#f59e0b" },
          { label: "In Progress", value: inProgressCount, color: "#60a5fa" },
          { label: "Resolved", value: resolvedCount, color: ACCENT },
          { label: "Total", value: tickets.length, color: "rgba(255,255,255,0.7)" },
        ].map(s => (
          <Card key={s.label} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }} styles={{ body: { padding: "14px 18px" } }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
            <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>{s.label}</Text>
          </Card>
        ))}
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${BORDER}` }}>
          <Input
            prefix={<MagnifyingGlassIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />}
            placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 260, background: "#2a2a2a", border: `1px solid #383838`, borderRadius: 8 }} variant="borderless"
          />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}
            options={[{ label: "All Status", value: "all" }, { label: "Open", value: "open" }, { label: "In Progress", value: "in-progress" }, { label: "Resolved", value: "resolved" }, { label: "Closed", value: "closed" }]}
          />
          <div style={{ flex: 1 }} />
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{filtered.length} tickets</Text>
        </div>
        <Table dataSource={filtered} columns={columns} rowKey="id" loading={loading}
          pagination={{ pageSize: 10, size: "small" }} style={{ background: "transparent" }} size="small" />
      </Card>

      <Modal
        open={!!selectedTicket} onCancel={() => setSelectedTicket(null)} footer={null} width={600}
        title={<span style={{ color: "#fff", fontWeight: 700 }}>{selectedTicket?.subject}</span>}
        styles={{ content: { background: "#1a1a1a", border: `1px solid ${BORDER}` }, header: { background: "#1a1a1a", borderBottom: `1px solid ${BORDER}` }, mask: { backdropFilter: "blur(6px)" } }}
      >
        {selectedTicket && (
          <div style={{ paddingTop: 12 }}>
            <div style={{ marginBottom: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>From: </Text>
              <Text style={{ color: "#fff", fontSize: 12 }}>{selectedTicket.userEmail}</Text>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, border: `1px solid ${BORDER}` }}>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.6, display: "block" }}>{selectedTicket.message}</Text>
            </div>
            {selectedTicket.adminNote && (
              <div style={{ background: "rgba(137,233,0,0.06)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, border: "1px solid rgba(137,233,0,0.15)" }}>
                <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, display: "block", marginBottom: 4 }}>Admin Reply</Text>
                <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>{selectedTicket.adminNote}</Text>
              </div>
            )}
            <Input.TextArea
              rows={3} value={replyText} onChange={e => setReplyText(e.target.value)}
              placeholder="Type your reply or internal note..."
              style={{ background: "#242424", border: `1px solid #383838`, color: "#fff", resize: "none", marginBottom: 10 }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Select
                value={selectedTicket.status} onChange={v => updateStatus(selectedTicket.id, v)} style={{ width: 140 }}
                options={["open", "in-progress", "resolved", "closed"].map(v => ({ label: v.charAt(0).toUpperCase() + v.slice(1), value: v }))}
              />
              <Button
                icon={<PaperAirplaneIcon style={{ width: 14, height: 14 }} />}
                loading={replying} onClick={handleReply}
                disabled={!replyText.trim()}
                style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 700, borderRadius: 8 }}
              >
                Save Reply
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
