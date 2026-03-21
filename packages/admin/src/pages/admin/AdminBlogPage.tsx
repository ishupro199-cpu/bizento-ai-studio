import { useState, useEffect, useRef } from "react";
import { Card, Table, Button, Input, Tag, Typography, message, Modal, Form, Switch, Space, Popconfirm } from "antd";
import {
  DocumentTextIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon,
  EyeSlashIcon, MagnifyingGlassIcon, PhotoIcon,
} from "@heroicons/react/24/outline";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const ACCENT = "#89E900";
const CARD_BG = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const { Title, Text } = Typography;

const BLOG_CATEGORIES = ["Product Update", "Guide", "Case Study", "News", "Tutorial", "AI Tips", "Ecommerce"];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
  author: string;
  imageUrl?: string;
  tags: string[];
  createdAt: Date;
}

function ImageUpload({ value, onChange }: { value?: string; onChange?: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const path = `blog/${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      onChange?.(url);
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
      {value ? (
        <div style={{ position: "relative", marginBottom: 8 }}>
          <img src={value} alt="Cover" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, border: `1px solid ${BORDER}` }} />
          <button
            type="button"
            onClick={() => onChange?.("")}
            style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 6, color: "#f87171", padding: "3px 8px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
          >
            Remove
          </button>
        </div>
      ) : null}
      <Button
        type="dashed"
        loading={uploading}
        onClick={() => inputRef.current?.click()}
        icon={<PhotoIcon style={{ width: 15, height: 15 }} />}
        style={{ width: "100%", height: 38, background: "rgba(255,255,255,0.03)", border: `1px dashed ${BORDER}`, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
      >
        {value ? "Change Image" : "Upload Cover Image"}
      </Button>
    </div>
  );
}

function BlogPostModal({ open, onClose, editItem }: { open: boolean; onClose: () => void; editItem: BlogPost | null }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [msgApi, ctx] = message.useMessage();

  useEffect(() => {
    if (open) {
      const defaults = editItem || { published: false, category: "Guide", author: "Team Pixalera", tags: [] };
      form.setFieldsValue(defaults);
      setImageUrl(editItem?.imageUrl || "");
    }
  }, [open, editItem]);

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const data = {
        ...values,
        slug: values.slug || autoSlug(values.title),
        imageUrl: imageUrl || null,
      };
      if (editItem) {
        await updateDoc(doc(db, "blog_posts", editItem.id), { ...data, updatedAt: serverTimestamp() });
        msgApi.success("Post updated");
      } else {
        await addDoc(collection(db, "blog_posts"), {
          ...data,
          status: values.published ? "published" : "draft",
          coverImageURL: imageUrl || null,
          publishedAt: values.published ? serverTimestamp() : null,
          createdAt: serverTimestamp(),
        });
        msgApi.success("Post published");
      }
      onClose();
    } catch {
      msgApi.error("Failed to save post");
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
          <Form.Item name="title" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Title</Text>} rules={[{ required: true, message: "Title is required" }]}>
            <Input
              style={{ background: "#242424", border: `1px solid #383838`, color: "#fff" }}
              onChange={(e) => { if (!editItem) form.setFieldValue("slug", autoSlug(e.target.value)); }}
            />
          </Form.Item>

          <Form.Item label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Cover Image</Text>}>
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Form.Item name="slug" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Slug</Text>} rules={[{ required: true, message: "Slug is required" }]}>
              <Input style={{ background: "#242424", border: `1px solid #383838`, color: "#fff" }} placeholder="my-blog-post" />
            </Form.Item>
            <Form.Item name="category" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Category</Text>}>
              <select
                style={{ width: "100%", background: "#242424", border: `1px solid #383838`, color: "#fff", borderRadius: 6, padding: "7px 10px", fontSize: 14, outline: "none" }}
                defaultValue="Guide"
                onChange={(e) => form.setFieldValue("category", e.target.value)}
              >
                {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Form.Item>
          </div>

          <Form.Item name="excerpt" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Excerpt</Text>} rules={[{ required: true, message: "Excerpt is required" }]}>
            <Input.TextArea rows={2} style={{ background: "#242424", border: `1px solid #383838`, color: "#fff", resize: "none" }} placeholder="Short summary shown on blog list..." />
          </Form.Item>

          <Form.Item name="content" label={<Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Content (Markdown)</Text>} rules={[{ required: true, message: "Content is required" }]}>
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
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => {
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

  const filtered = posts.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "Post",
      key: "title",
      render: (_: any, p: BlogPost) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {p.imageUrl && (
            <img src={p.imageUrl} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
          )}
          <div>
            <Text style={{ color: "#fff", fontWeight: 500, fontSize: 13, display: "block" }}>{p.title}</Text>
            <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>/{p.slug} · {p.author}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (c: string) => (
        <Tag style={{ background: "rgba(137,233,0,0.08)", border: "1px solid rgba(137,233,0,0.2)", color: ACCENT, borderRadius: 6, fontSize: 11 }}>{c}</Tag>
      ),
    },
    {
      title: "Status",
      key: "published",
      render: (_: any, p: BlogPost) => (
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
      title: "Date",
      key: "createdAt",
      render: (_: any, p: BlogPost) => (
        <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
          {p.createdAt?.toLocaleDateString?.("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </Text>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: any, p: BlogPost) => (
        <Space>
          <Button
            type="text" size="small"
            icon={p.published ? <EyeSlashIcon style={{ width: 15, height: 15, color: "rgba(255,255,255,0.4)" }} /> : <EyeIcon style={{ width: 15, height: 15, color: ACCENT }} />}
            onClick={() => togglePublished(p)} style={{ width: 30, height: 30, padding: 0 }}
            title={p.published ? "Unpublish" : "Publish"}
          />
          <Button
            type="text" size="small"
            icon={<PencilIcon style={{ width: 15, height: 15, color: "rgba(255,255,255,0.4)" }} />}
            onClick={() => { setEditItem(p); setModalOpen(true); }} style={{ width: 30, height: 30, padding: 0 }}
          />
          <Popconfirm title="Delete this post?" onConfirm={() => handleDelete(p)} okText="Delete" okButtonProps={{ danger: true }}>
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
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>
            {posts.filter((p) => p.published).length} published · {posts.filter((p) => !p.published).length} drafts
          </Text>
        </div>
        <Button
          icon={<PlusIcon style={{ width: 15, height: 15 }} />}
          onClick={() => { setEditItem(null); setModalOpen(true); }}
          style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 700, borderRadius: 8, height: 38, display: "flex", alignItems: "center", gap: 6 }}
        >
          New Post
        </Button>
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${BORDER}` }}>
          <Input
            prefix={<MagnifyingGlassIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />}
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 240, background: "#2a2a2a", border: `1px solid #383838`, borderRadius: 8 }}
            variant="borderless"
          />
          <div style={{ flex: 1 }} />
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{filtered.length} posts</Text>
        </div>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, size: "small" }}
          style={{ background: "transparent" }}
          size="small"
        />
      </Card>

      <BlogPostModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        editItem={editItem}
      />
    </div>
  );
}
