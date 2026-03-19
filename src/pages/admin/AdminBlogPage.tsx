import { useState, useEffect } from "react";
import { Card, Table, Button, Input, Select, Tag, Typography, message, Modal, Form, Switch, Space, Tooltip, Popconfirm, Badge } from "antd";
import {
  DocumentTextIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon,
  EyeSlashIcon, MagnifyingGlassIcon, CalendarIcon,
} from "@heroicons/react/24/outline";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ACCENT = "#89E900";
const CARD_BG = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const { Title, Text } = Typography;

const BLOG_CATEGORIES = ["Product Update", "Guide", "Case Study", "News", "Tutorial"];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
  author: string;
  tags: string[];
  createdAt: Date;
}

function BlogPostModal({ open, onClose, editItem }: { open: boolean; onClose: () => void; editItem: BlogPost | null }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [msgApi, ctx] = message.useMessage();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(editItem || { published: false, category: "Guide", author: "Team Pixalera", tags: [] });
    }
  }, [open, editItem]);

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const data = { ...values, slug: values.slug || autoSlug(values.title) };
      if (editItem) {
        await updateDoc(doc(db, "blogPosts", editItem.id), { ...data, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "blogPosts"), { ...data, createdAt: serverTimestamp() });
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
        open={open} onCancel={onClose} footer={null} width={720}
        title={<span style={{ color: "#fff", fontWeight: 700 }}>{editItem ? "Edit Post" : "New Blog Post"}</span>}
        styles={{ content: { background: "#1a1a1a", border: `1px solid ${BORDER}` }, header: { background: "#1a1a1a", borderBottom: `1px solid ${BORDER}` }, mask: { backdropFilter: "blur(6px)" } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="title" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Title</Text>} rules={[{ required: true }]}>
            <Input
              style={{ background: "#242424", border: `1px solid #383838`, color: "#fff" }}
              onChange={e => { if (!editItem) form.setFieldValue("slug", autoSlug(e.target.value)); }}
            />
          </Form.Item>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Form.Item name="slug" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Slug</Text>} rules={[{ required: true }]}>
              <Input style={{ background: "#242424", border: `1px solid #383838`, color: "#fff" }} placeholder="my-blog-post" />
            </Form.Item>
            <Form.Item name="category" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Category</Text>}>
              <Select options={BLOG_CATEGORIES.map(c => ({ label: c, value: c }))} />
            </Form.Item>
          </div>
          <Form.Item name="excerpt" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Excerpt</Text>} rules={[{ required: true }]}>
            <Input.TextArea rows={2} style={{ background: "#242424", border: `1px solid #383838`, color: "#fff", resize: "none" }} placeholder="Short summary shown on blog list..." />
          </Form.Item>
          <Form.Item name="content" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Content (Markdown)</Text>} rules={[{ required: true }]}>
            <Input.TextArea rows={8} style={{ background: "#242424", border: `1px solid #383838`, color: "#fff", resize: "none", fontFamily: "monospace", fontSize: 12 }} placeholder="# My Blog Post&#10;&#10;Write your content here in Markdown..." />
          </Form.Item>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Form.Item name="author" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Author</Text>}>
              <Input style={{ background: "#242424", border: `1px solid #383838`, color: "#fff" }} />
            </Form.Item>
            <Form.Item name="published" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Published</Text>} valuePropName="checked">
              <Switch checkedChildren="Live" unCheckedChildren="Draft" />
            </Form.Item>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: `1px solid ${BORDER}` }}>
            <Button onClick={onClose} style={{ background: "#2a2a2a", border: `1px solid #383838`, color: "rgba(255,255,255,0.65)" }}>Cancel</Button>
            <Button htmlType="submit" loading={saving} style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 700 }}>
              {editItem ? "Update" : "Publish"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<BlogPost | null>(null);
  const [msgApi, ctx] = message.useMessage();

  useEffect(() => {
    const q = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => {
        const data = d.data();
        const ts = data.createdAt;
        return { id: d.id, ...data, createdAt: ts instanceof Timestamp ? ts.toDate() : new Date() } as BlogPost;
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const togglePublished = async (p: BlogPost) => {
    await updateDoc(doc(db, "blogPosts", p.id), { published: !p.published });
    msgApi.success(p.published ? "Unpublished" : "Published");
  };

  const handleDelete = async (p: BlogPost) => {
    await deleteDoc(doc(db, "blogPosts", p.id));
    msgApi.success("Deleted");
  };

  const filtered = posts.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    {
      title: "Post",
      key: "title",
      render: (_: any, p: BlogPost) => (
        <div>
          <Text style={{ color: "#fff", fontWeight: 500, fontSize: 13, display: "block" }}>{p.title}</Text>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>/{p.slug} · {p.author}</Text>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (c: string) => <Tag style={{ background: "rgba(137,233,0,0.08)", border: "1px solid rgba(137,233,0,0.2)", color: ACCENT, borderRadius: 6, fontSize: 11 }}>{c}</Tag>,
    },
    {
      title: "Status",
      key: "published",
      render: (_: any, p: BlogPost) => (
        <Tag style={{ background: p.published ? "rgba(137,233,0,0.10)" : "rgba(255,255,255,0.06)", border: `1px solid ${p.published ? "rgba(137,233,0,0.25)" : "rgba(255,255,255,0.12)"}`, color: p.published ? ACCENT : "rgba(255,255,255,0.45)", borderRadius: 20, fontSize: 11, fontWeight: 600, padding: "2px 10px" }}>
          ● {p.published ? "Live" : "Draft"}
        </Tag>
      ),
    },
    {
      title: "Date",
      key: "createdAt",
      render: (_: any, p: BlogPost) => <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{p.createdAt?.toLocaleDateString?.("en-US", { month: "short", day: "numeric", year: "numeric" })}</Text>,
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: any, p: BlogPost) => (
        <Space>
          <Button type="text" size="small" icon={p.published ? <EyeSlashIcon style={{ width: 15, height: 15, color: "rgba(255,255,255,0.4)" }} /> : <EyeIcon style={{ width: 15, height: 15, color: ACCENT }} />}
            onClick={() => togglePublished(p)} style={{ width: 30, height: 30, padding: 0 }} />
          <Button type="text" size="small" icon={<PencilIcon style={{ width: 15, height: 15, color: "rgba(255,255,255,0.4)" }} />}
            onClick={() => { setEditItem(p); setModalOpen(true); }} style={{ width: 30, height: 30, padding: 0 }} />
          <Popconfirm title="Delete post?" onConfirm={() => handleDelete(p)} okText="Delete" okButtonProps={{ danger: true }}>
            <Button type="text" size="small" danger icon={<TrashIcon style={{ width: 15, height: 15 }} />} style={{ width: 30, height: 30, padding: 0 }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      {ctx}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <DocumentTextIcon style={{ width: 22, height: 22, color: ACCENT }} />
            <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>Blog</Title>
          </div>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>{posts.filter(p => p.published).length} published · {posts.filter(p => !p.published).length} drafts</Text>
        </div>
        <Button icon={<PlusIcon style={{ width: 15, height: 15 }} />} onClick={() => { setEditItem(null); setModalOpen(true); }}
          style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 700, borderRadius: 8, height: 38, display: "flex", alignItems: "center", gap: 6 }}>
          New Post
        </Button>
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${BORDER}` }}>
          <Input
            prefix={<MagnifyingGlassIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />}
            placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 240, background: "#2a2a2a", border: `1px solid #383838`, borderRadius: 8 }} variant="borderless"
          />
          <div style={{ flex: 1 }} />
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{filtered.length} posts</Text>
        </div>
        <Table dataSource={filtered} columns={columns} rowKey="id" loading={loading}
          pagination={{ pageSize: 10, size: "small" }} style={{ background: "transparent" }} size="small" />
      </Card>

      <BlogPostModal open={modalOpen} onClose={() => setModalOpen(false)} editItem={editItem} />
    </div>
  );
}
