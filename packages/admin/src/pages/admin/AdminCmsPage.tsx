import { useState, useEffect } from "react";
import { Card, Button, Input, Upload, Typography, message, Tabs, Modal, Spin, Tag, Tooltip, Empty } from "antd";
import {
  PhotoIcon, VideoCameraIcon, ArrowUpTrayIcon, TrashIcon, PencilIcon,
  EyeIcon, CheckCircleIcon, RectangleStackIcon, LinkIcon, ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, setDoc, getDoc, onSnapshot, collection, addDoc, getDocs, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";

const ACCENT = "#89E900";
const CARD_BG = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const { Title, Text } = Typography;

const SECTIONS = [
  { key: "hero_video", label: "Hero Video", type: "video", desc: "Main landing page hero background video (.mp4)" },
  { key: "hero_image_fallback", label: "Hero Fallback Image", type: "image", desc: "Shown when video fails to load" },
  { key: "hero_product", label: "Hero Product Image", type: "image", desc: "Floating product image in hero section" },
  { key: "feature_bg_1", label: "Feature Image 1", type: "image", desc: "AI Background Generation feature card" },
  { key: "feature_bg_2", label: "Feature Image 2", type: "image", desc: "Multi-Angle Rendering feature card" },
  { key: "feature_bg_3", label: "Feature Image 3", type: "image", desc: "AI Fashion Models feature card" },
  { key: "feature_bg_4", label: "Feature Image 4", type: "image", desc: "Style Variations feature card" },
  { key: "logo_main", label: "Logo (Main)", type: "image", desc: "Primary logo shown in navbar and sidebar" },
  { key: "og_image", label: "OG / Share Image", type: "image", desc: "Social share preview image (1200×630)" },
];

interface MediaAsset {
  key: string;
  url: string;
  updatedAt?: any;
  fileName?: string;
  size?: number;
}

function MediaCard({ section, asset, onUpload, onRemove, onSetUrl, uploading }: {
  section: typeof SECTIONS[0];
  asset?: MediaAsset;
  onUpload: (key: string, file: File) => void;
  onRemove: (key: string, url: string) => void;
  onSetUrl: (key: string, url: string) => void;
  uploading: boolean;
}) {
  const [urlModal, setUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const isVideo = section.type === "video";
  const Icon = isVideo ? VideoCameraIcon : PhotoIcon;

  return (
    <Card
      style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }}
      styles={{ body: { padding: "18px 20px" } }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Icon style={{ width: 16, height: 16, color: isVideo ? "#f59e0b" : "#60a5fa" }} />
            <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{section.label}</Text>
            <Tag style={{ fontSize: 10, background: isVideo ? "rgba(245,158,11,0.12)" : "rgba(96,165,250,0.12)", border: `1px solid ${isVideo ? "rgba(245,158,11,0.25)" : "rgba(96,165,250,0.25)"}`, color: isVideo ? "#f59e0b" : "#60a5fa", borderRadius: 6 }}>
              {section.type.toUpperCase()}
            </Tag>
          </div>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>{section.desc}</Text>
        </div>
        {asset?.url && (
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, flexShrink: 0, marginTop: 6 }} />
        )}
      </div>

      {/* Preview */}
      <div
        style={{
          width: "100%", height: 140, borderRadius: 10,
          background: "rgba(255,255,255,0.03)", border: `1px dashed rgba(255,255,255,0.12)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", marginBottom: 14, position: "relative",
        }}
      >
        {asset?.url ? (
          isVideo ? (
            <video
              src={asset.url}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              muted autoPlay loop playsInline
            />
          ) : (
            <img
              src={asset.url}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )
        ) : (
          <div style={{ textAlign: "center" }}>
            <Icon style={{ width: 32, height: 32, color: "rgba(255,255,255,0.2)", margin: "0 auto 8px" }} />
            <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>No {section.type} set</Text>
          </div>
        )}
        {uploading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Spin />
          </div>
        )}
      </div>

      {asset?.url && (
        <div style={{ marginBottom: 10, padding: "6px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: `1px solid rgba(255,255,255,0.07)` }}>
          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }} copyable={{ text: asset.url }}>
            {asset.url.slice(0, 55)}{asset.url.length > 55 ? "…" : ""}
          </Text>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Upload
          beforeUpload={(file) => { onUpload(section.key, file); return false; }}
          showUploadList={false}
          accept={isVideo ? "video/mp4,video/webm" : "image/*"}
        >
          <Button
            size="small"
            icon={<ArrowUpTrayIcon style={{ width: 13, height: 13 }} />}
            disabled={uploading}
            style={{ background: "rgba(137,233,0,0.08)", border: `1px solid rgba(137,233,0,0.25)`, color: ACCENT, borderRadius: 8, fontSize: 12 }}
          >
            Upload
          </Button>
        </Upload>

        <Button
          size="small"
          icon={<LinkIcon style={{ width: 13, height: 13 }} />}
          onClick={() => { setUrlInput(asset?.url || ""); setUrlModal(true); }}
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.12)`, color: "rgba(255,255,255,0.65)", borderRadius: 8, fontSize: 12 }}
        >
          Set URL
        </Button>

        {asset?.url && (
          <>
            <Tooltip title="Open in new tab">
              <Button
                size="small" type="text"
                icon={<EyeIcon style={{ width: 13, height: 13 }} />}
                onClick={() => window.open(asset.url, "_blank")}
                style={{ color: "rgba(255,255,255,0.4)" }}
              />
            </Tooltip>
            <Tooltip title="Remove">
              <Button
                size="small" type="text" danger
                icon={<TrashIcon style={{ width: 13, height: 13 }} />}
                onClick={() => onRemove(section.key, asset.url)}
              />
            </Tooltip>
          </>
        )}
      </div>

      <Modal
        open={urlModal}
        onCancel={() => setUrlModal(false)}
        onOk={() => { onSetUrl(section.key, urlInput); setUrlModal(false); }}
        title={<span style={{ color: "#fff" }}>Set URL — {section.label}</span>}
        okText="Save"
        styles={{
          content: { background: "#1a1a1a", border: `1px solid ${BORDER}` },
          header: { background: "#1a1a1a", borderBottom: `1px solid ${BORDER}` },
        }}
        okButtonProps={{ style: { background: ACCENT, borderColor: ACCENT, color: "#000", fontWeight: 700 } }}
      >
        <Input
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          placeholder="https://..."
          style={{ background: "#242424", border: `1px solid #383838`, color: "#fff", marginTop: 12 }}
        />
        <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 8, display: "block" }}>
          Paste a public URL to an {isVideo ? "MP4 video" : "image"} file.
        </Text>
      </Modal>
    </Card>
  );
}

export default function AdminCmsPage() {
  const [assets, setAssets] = useState<Record<string, MediaAsset>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [msgApi, ctx] = message.useMessage();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "cms", "mediaAssets"), (snap) => {
      if (snap.exists()) setAssets(snap.data() as Record<string, MediaAsset>);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const saveAsset = async (key: string, url: string, extra?: Partial<MediaAsset>) => {
    const updated = {
      ...assets,
      [key]: { key, url, updatedAt: new Date().toISOString(), ...extra },
    };
    setAssets(updated);
    await setDoc(doc(db, "cms", "mediaAssets"), updated, { merge: true });
  };

  const handleUpload = async (key: string, file: File) => {
    setUploading(u => ({ ...u, [key]: true }));
    try {
      const path = `cms/${key}_${Date.now()}_${file.name}`;
      const ref = storageRef(storage, path);
      const task = uploadBytesResumable(ref, file);
      await new Promise<void>((res, rej) => task.on("state_changed", null, rej, res));
      const url = await getDownloadURL(ref);
      await saveAsset(key, url, { fileName: file.name, size: file.size });
      msgApi.success(`${key} updated`);
    } catch {
      msgApi.error("Upload failed");
    }
    setUploading(u => ({ ...u, [key]: false }));
  };

  const handleRemove = async (key: string, url: string) => {
    try {
      if (url.includes("firebasestorage")) {
        const ref = storageRef(storage, url);
        await deleteObject(ref).catch(() => {});
      }
      const updated = { ...assets };
      delete updated[key];
      setAssets(updated);
      await setDoc(doc(db, "cms", "mediaAssets"), updated);
      msgApi.success("Removed");
    } catch {
      msgApi.error("Failed to remove");
    }
  };

  const handleSetUrl = async (key: string, url: string) => {
    if (!url) return;
    await saveAsset(key, url);
    msgApi.success("URL saved");
  };

  const images = SECTIONS.filter(s => s.type === "image");
  const videos = SECTIONS.filter(s => s.type === "video");

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      {ctx}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <RectangleStackIcon style={{ width: 22, height: 22, color: ACCENT }} />
            <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>
              Content Manager
            </Title>
          </div>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>
            Manage all website images and videos — changes reflect live on the website
          </Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT }} />
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Live Sync</Text>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Tabs
          defaultActiveKey="images"
          style={{ color: "#fff" }}
          items={[
            {
              key: "images",
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PhotoIcon style={{ width: 15, height: 15 }} /> Images ({images.length})
                </div>
              ),
              children: (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, paddingTop: 16 }}>
                  {images.map(s => (
                    <MediaCard
                      key={s.key}
                      section={s}
                      asset={assets[s.key]}
                      onUpload={handleUpload}
                      onRemove={handleRemove}
                      onSetUrl={handleSetUrl}
                      uploading={!!uploading[s.key]}
                    />
                  ))}
                </div>
              ),
            },
            {
              key: "videos",
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <VideoCameraIcon style={{ width: 15, height: 15 }} /> Videos ({videos.length})
                </div>
              ),
              children: (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, paddingTop: 16 }}>
                  {videos.map(s => (
                    <MediaCard
                      key={s.key}
                      section={s}
                      asset={assets[s.key]}
                      onUpload={handleUpload}
                      onRemove={handleRemove}
                      onSetUrl={handleSetUrl}
                      uploading={!!uploading[s.key]}
                    />
                  ))}
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
