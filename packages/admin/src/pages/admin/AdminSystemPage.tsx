import { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Progress, Switch, Input, Button, message } from "antd";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CloudIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const ACCENT = "#89E900";
const CARD_BG = "#2a2a2a";
const BORDER = "#333";
const { Title, Text } = Typography;

export default function AdminSystemPage() {
  const { user } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("We're upgrading our servers for a better experience!");
  const [estimatedTime, setEstimatedTime] = useState("2 hours");
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "maintenance_mode"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setMaintenanceMode(data.isActive || false);
        setMaintenanceMsg(data.message || "We're upgrading our servers for a better experience!");
        setEstimatedTime(data.estimatedTime || "2 hours");
      }
    });
    return () => unsub();
  }, []);

  const saveMaintenanceSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "maintenance_mode"), {
        isActive: maintenanceMode,
        message: maintenanceMsg,
        estimatedTime,
        updatedAt: serverTimestamp(),
      });

      if (user) {
        const { addDoc, collection } = await import("firebase/firestore");
        await addDoc(collection(db, "admin_logs"), {
          adminId: user.uid,
          adminEmail: user.email,
          action: "maintenance_toggled",
          targetType: "system",
          targetId: "maintenance_mode",
          details: { isActive: maintenanceMode, message: maintenanceMsg, estimatedTime },
          createdAt: serverTimestamp(),
        });
      }

      messageApi.success(`Maintenance mode ${maintenanceMode ? "enabled" : "disabled"} successfully`);
    } catch {
      messageApi.error("Failed to save maintenance settings");
    }
    setSaving(false);
  };

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      {contextHolder}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px" }}>
          System Settings
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          Manage maintenance mode and system configuration
        </Text>
      </div>

      {/* Maintenance Mode */}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <WrenchScrewdriverIcon style={{ width: 18, height: 18, color: maintenanceMode ? "#f59e0b" : ACCENT }} />
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Maintenance Mode</span>
          </div>
        }
        style={{ background: CARD_BG, border: `1px solid ${maintenanceMode ? "rgba(245,158,11,0.4)" : BORDER}`, borderRadius: 14, marginBottom: 20 }}
        styles={{ header: { background: "transparent", borderBottom: `1px solid ${BORDER}`, minHeight: 52 }, body: { padding: 20 } }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: maintenanceMode ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)", borderRadius: 10, border: `1px solid ${maintenanceMode ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}` }}>
            <div>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: 600, display: "block" }}>
                {maintenanceMode ? "🔧 Site is in Maintenance Mode" : "✅ Site is Live"}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                {maintenanceMode ? "Non-admin users are redirected to maintenance page" : "All users can access the site normally"}
              </Text>
            </div>
            <Switch
              checked={maintenanceMode}
              onChange={setMaintenanceMode}
              style={{ background: maintenanceMode ? "#f59e0b" : "#333" }}
            />
          </div>

          <div>
            <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, display: "block", marginBottom: 8 }}>
              Maintenance Message
            </Text>
            <Input.TextArea
              value={maintenanceMsg}
              onChange={(e) => setMaintenanceMsg(e.target.value)}
              rows={2}
              placeholder="Tell users why the site is under maintenance..."
              style={{ background: "#222", border: `1px solid #3a3a3a`, color: "#fff", borderRadius: 8, resize: "none" }}
            />
          </div>

          <div>
            <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, display: "block", marginBottom: 8 }}>
              Estimated Time (shown to users)
            </Text>
            <Input
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="e.g. 2 hours, Back by 6 PM, etc."
              style={{ background: "#222", border: `1px solid #3a3a3a`, color: "#fff", borderRadius: 8 }}
            />
          </div>

          <Button
            onClick={saveMaintenanceSettings}
            loading={saving}
            style={{
              background: maintenanceMode ? "#f59e0b" : ACCENT,
              border: "none",
              color: "#000",
              fontWeight: 600,
              borderRadius: 8,
              height: 38,
              alignSelf: "flex-start",
            }}
          >
            {maintenanceMode ? "Enable Maintenance Mode" : "Save Settings"}
          </Button>
        </div>
      </Card>

      {/* Service Status */}
      <Row gutter={[14, 14]}>
        <Col xs={24} lg={14}>
          <Card
            title={<span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Service Status</span>}
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }}
            styles={{ header: { background: "transparent", borderBottom: `1px solid ${BORDER}`, minHeight: 48 }, body: { padding: 16 } }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { name: "API Server", status: "Operational", uptime: "99.98%", icon: ServerIcon },
                { name: "AI Pipeline (NVIDIA NIM)", status: "Operational", uptime: "99.95%", icon: CpuChipIcon },
                { name: "Firebase Storage", status: "Operational", uptime: "99.99%", icon: CloudIcon },
                { name: "CDN", status: "Operational", uptime: "99.99%", icon: GlobeAltIcon },
                { name: "Firestore Database", status: "Operational", uptime: "99.97%", icon: CircleStackIcon },
                { name: "Firebase Auth", status: "Operational", uptime: "99.99%", icon: ShieldCheckIcon },
              ].map((s) => (
                <div
                  key={s.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: s.status === "Operational" ? "rgba(137,233,0,0.1)" : "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <s.icon style={{ width: 17, height: 17, color: s.status === "Operational" ? ACCENT : "#f59e0b" }} />
                  </div>
                  <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, flex: 1, fontWeight: 500 }}>{s.name}</Text>
                  <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{s.uptime}</Text>
                  <span style={{ fontSize: 11, fontWeight: 600, color: s.status === "Operational" ? ACCENT : "#f59e0b", background: s.status === "Operational" ? "rgba(137,233,0,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${s.status === "Operational" ? "rgba(137,233,0,0.25)" : "rgba(245,158,11,0.25)"}`, borderRadius: 20, padding: "2px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                    {s.status === "Operational" ? <CheckCircleIcon style={{ width: 11, height: 11 }} /> : <ExclamationTriangleIcon style={{ width: 11, height: 11 }} />}
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={<span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Resource Usage</span>}
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, height: "100%" }}
            styles={{ header: { background: "transparent", borderBottom: `1px solid ${BORDER}`, minHeight: 48 }, body: { padding: 20 } }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { label: "CPU Usage", value: 38, color: ACCENT },
                { label: "Memory", value: 61, color: "#60a5fa" },
                { label: "Storage", value: 45, color: "#a78bfa" },
              ].map((r) => (
                <div key={r.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{r.label}</Text>
                    <Text style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{r.value}%</Text>
                  </div>
                  <Progress percent={r.value} showInfo={false} strokeColor={r.color} trailColor="rgba(255,255,255,0.08)" size={{ height: 10 }} />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
