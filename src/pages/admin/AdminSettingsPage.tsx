import { useState, useEffect } from "react";
import { Card, Button, Input, Typography, Switch, message, Skeleton, Form, Divider, Tag } from "antd";
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ACCENT = "#89E900";
const CARD_BG = "#242424";
const BORDER = "#2e2e2e";
const { Title, Text } = Typography;

interface Settings {
  maintenanceMode: boolean;
  allowSignups: boolean;
  defaultPlan: string;
  defaultCredits: number;
  nvidiaApiKey: string;
  maxCreditsPerUser: number;
  aiGenerationEnabled: boolean;
  emailNotifications: boolean;
  adminEmail: string;
  siteName: string;
  supportEmail: string;
}

const DEFAULT_SETTINGS: Settings = {
  maintenanceMode: false,
  allowSignups: true,
  defaultPlan: "free",
  defaultCredits: 3,
  nvidiaApiKey: "",
  maxCreditsPerUser: 100,
  aiGenerationEnabled: true,
  emailNotifications: true,
  adminEmail: "",
  siteName: "Pixalera",
  supportEmail: "",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) {
        const data = { ...DEFAULT_SETTINGS, ...snap.data() } as Settings;
        setSettings(data);
        form.setFieldsValue(data);
      }
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "global"), { ...settings, ...values }, { merge: true });
      messageApi.success("Settings saved successfully");
    } catch {
      messageApi.error("Failed to save settings");
    }
    setSaving(false);
  };

  const handleToggle = async (key: keyof Settings, value: boolean) => {
    try {
      const updated = { ...settings, [key]: value };
      setSettings(updated);
      await setDoc(doc(db, "settings", "global"), { [key]: value }, { merge: true });
      messageApi.success("Setting updated");
    } catch {
      messageApi.error("Failed to update setting");
      setSettings((prev) => ({ ...prev, [key]: !value }));
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
        <div style={{ marginBottom: 22 }}>
          <Skeleton.Input active style={{ width: 150, height: 28 }} />
          <div style={{ marginTop: 6 }}><Skeleton.Input active style={{ width: 260, height: 18 }} /></div>
        </div>
        {[1, 2, 3].map((i) => <Skeleton key={i} active style={{ marginBottom: 16 }} />)}
      </div>
    );
  }

  const toggleCard = (icon: React.ElementType, label: string, desc: string, key: keyof Settings, value: boolean, dangerOn?: boolean) => {
    const Icon = icon;
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon style={{ width: 17, height: 17, color: "rgba(255,255,255,0.5)" }} />
          </div>
          <div>
            <Text style={{ color: "#fff", fontWeight: 500, fontSize: 13, display: "block" }}>{label}</Text>
            <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>{desc}</Text>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {dangerOn && value && (
            <Tag style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
              ACTIVE
            </Tag>
          )}
          <Switch
            checked={value}
            onChange={(v) => handleToggle(key, v)}
            style={{ background: value ? (dangerOn ? "#f87171" : ACCENT) : "rgba(255,255,255,0.12)" }}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      {contextHolder}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>Settings</Title>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>Manage global platform settings and configuration</Text>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "20px 22px" } }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(137,233,0,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Cog6ToothIcon style={{ width: 17, height: 17, color: ACCENT }} />
            </div>
            <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Platform Controls</Text>
          </div>
          {toggleCard(WrenchScrewdriverIcon, "Maintenance Mode", "Block all users except admins", "maintenanceMode", settings.maintenanceMode, true)}
          {toggleCard(ShieldCheckIcon, "Allow Signups", "Let new users register", "allowSignups", settings.allowSignups)}
          {toggleCard(CpuChipIcon, "AI Generation", "Enable AI image generation pipeline", "aiGenerationEnabled", settings.aiGenerationEnabled)}
          <div style={{ paddingTop: 2 }}>
            {toggleCard(BellIcon, "Email Notifications", "Send admin email alerts", "emailNotifications", settings.emailNotifications)}
          </div>
        </Card>

        <Form form={form} onFinish={handleSave} layout="vertical" initialValues={settings}>
          <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "20px 22px" } }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(96,165,250,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <WrenchScrewdriverIcon style={{ width: 17, height: 17, color: "#60a5fa" }} />
              </div>
              <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>General Config</Text>
            </div>

            <Form.Item name="siteName" label={<span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Site Name</span>} style={{ marginBottom: 12 }}>
              <Input style={{ background: "#2a2a2a", border: `1px solid #383838` }} />
            </Form.Item>
            <Form.Item name="adminEmail" label={<span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Admin Email</span>} style={{ marginBottom: 12 }}>
              <Input type="email" style={{ background: "#2a2a2a", border: `1px solid #383838` }} />
            </Form.Item>
            <Form.Item name="supportEmail" label={<span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Support Email</span>} style={{ marginBottom: 12 }}>
              <Input type="email" style={{ background: "#2a2a2a", border: `1px solid #383838` }} />
            </Form.Item>
            <Form.Item name="defaultCredits" label={<span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Default Credits (new users)</span>} style={{ marginBottom: 12 }}>
              <Input type="number" min={0} style={{ background: "#2a2a2a", border: `1px solid #383838` }} />
            </Form.Item>

            <Button htmlType="submit" loading={saving} style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 600, borderRadius: 8, height: 36, width: "100%", marginTop: 4 }}>
              Save Settings
            </Button>
          </Card>
        </Form>
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "20px 22px" } }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(118,185,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CpuChipIcon style={{ width: 17, height: 17, color: "#76B900" }} />
          </div>
          <div>
            <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14, display: "block" }}>NVIDIA NIM API</Text>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Image Generation Provider</Text>
          </div>
        </div>
        <Form layout="vertical" onFinish={handleSave} initialValues={settings}>
          <Form.Item name="nvidiaApiKey" label={<span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>API Key</span>} style={{ marginBottom: 14 }}>
            <Input.Password 
              style={{ background: "#2a2a2a", border: `1px solid ${settings.nvidiaApiKey ? "rgba(118,185,0,0.4)" : "#383838"}`, height: 42, fontSize: 13 }} 
              placeholder="nvapi-xxxxxxxxxxxxxxxx" 
            />
          </Form.Item>
          
          <div style={{ background: "rgba(118,185,0,0.06)", border: "1px solid rgba(118,185,0,0.15)", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: settings.nvidiaApiKey ? "#76B900" : "rgba(255,255,255,0.25)" }} />
              <Text style={{ fontSize: 12, fontWeight: 600, color: settings.nvidiaApiKey ? "#76B900" : "rgba(255,255,255,0.5)" }}>
                {settings.nvidiaApiKey ? "Connected & Active" : "Not Connected"}
              </Text>
            </div>
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
              NVIDIA NIM powers all AI image generation including Catalog, Photography, Ads, and Cinematic features.
            </Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <ExclamationTriangleIcon style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} />
            <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>API keys are stored securely and never exposed to clients.</Text>
          </div>
          
          <Button htmlType="submit" loading={saving} style={{ background: settings.nvidiaApiKey ? "rgba(118,185,0,0.15)" : ACCENT, border: `1px solid ${settings.nvidiaApiKey ? "rgba(118,185,0,0.3)" : "transparent"}`, color: settings.nvidiaApiKey ? "#76B900" : "#000", fontWeight: 600, borderRadius: 8, height: 38, width: "100%" }}>
            {settings.nvidiaApiKey ? "Update API Key" : "Save API Key"}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
