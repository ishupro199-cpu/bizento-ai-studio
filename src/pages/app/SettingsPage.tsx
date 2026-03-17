import { useState } from "react";
import {
  User, Bell, Palette, Database, Shield, HelpCircle,
  ChevronRight, Camera, Download, Trash2, LogOut,
  KeyRound, BookOpen, FileText, Bug, Keyboard, Mail,
  Archive, AlertTriangle, ExternalLink, Save, Zap
} from "lucide-react";
import { useAppContext, PLANS } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Section = "profile" | "notifications" | "personalization" | "data" | "security" | "help";

const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "personalization", label: "Personalization", icon: Palette },
  { id: "data", label: "Data Controls", icon: Database },
  { id: "security", label: "Security", icon: Shield },
  { id: "help", label: "Help", icon: HelpCircle },
];

function SettingsCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-white/[0.07] p-5 space-y-4"
      style={{ background: "rgba(255,255,255,0.03)" }}
    >
      {title && <h3 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider">{title}</h3>}
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-10 h-5.5 rounded-full transition-all duration-200 flex-shrink-0"
      style={{
        width: 40,
        height: 22,
        background: checked ? "#89E900" : "rgba(255,255,255,0.1)",
        boxShadow: checked ? "0 0 12px rgba(137,233,0,0.35)" : "none",
      }}
    >
      <span
        className="absolute top-[3px] rounded-full transition-all duration-200"
        style={{
          width: 16,
          height: 16,
          background: "white",
          left: checked ? 21 : 3,
        }}
      />
    </button>
  );
}

function ToggleRow({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white/80">{label}</p>
        {sub && <p className="text-[11px] text-white/35 mt-0.5">{sub}</p>}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-white/45">{label}</label>
      {children}
    </div>
  );
}

function StyledInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange?: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={!onChange}
      className="w-full h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 text-[13px] text-white placeholder-white/20 outline-none transition-all duration-150 focus:border-[#89E900]/40 focus:bg-white/[0.07]"
    />
  );
}

function DangerButton({ label, icon: Icon, onClick }: { label: string; icon: React.ElementType; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-[13px] font-medium text-red-400 border border-red-500/15 transition-all duration-150 hover:bg-red-500/10 hover:border-red-500/30"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

function ActionButton({ label, icon: Icon, onClick, variant = "default" }: { label: string; icon: React.ElementType; onClick: () => void; variant?: "default" | "primary" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-[13px] font-medium border transition-all duration-150 ${
        variant === "primary"
          ? "border-[#89E900]/30 text-[#89E900] hover:bg-[#89E900]/10 hover:border-[#89E900]/50"
          : "border-white/[0.07] text-white/60 hover:bg-white/[0.05] hover:text-white/80"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

export default function SettingsPage() {
  const { user, setShowUpgradeModal } = useAppContext();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [active, setActive] = useState<Section>("profile");

  const [name, setName] = useState(user.name || "");
  const [workspace, setWorkspace] = useState("My Workspace");
  const [nickname, setNickname] = useState("");
  const [occupation, setOccupation] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [baseStyle, setBaseStyle] = useState("default");

  const [notifs, setNotifs] = useState({
    generationComplete: true,
    emailNotifs: false,
    productUpdates: true,
    marketingEmails: false,
  });

  const [autoDelete, setAutoDelete] = useState(false);

  const planConfig = PLANS[user.plan];
  const PLAN_BADGE: Record<string, string> = {
    free: "bg-white/10 text-white/50 border-white/10",
    starter: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    pro: "bg-[#89E900]/20 text-[#89E900] border-[#89E900]/30",
  };

  const handleSaveProfile = () => toast.success("Profile saved");
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const HELP_ITEMS = [
    { icon: BookOpen, label: "Help Center" },
    { icon: FileText, label: "Release Notes" },
    { icon: Shield, label: "Terms & Privacy" },
    { icon: Bug, label: "Report a Bug" },
    { icon: Keyboard, label: "Keyboard Shortcuts" },
    { icon: Mail, label: "Contact Us" },
  ];

  const STYLE_OPTIONS = [
    { id: "default", label: "Default" },
    { id: "professional", label: "Professional" },
    { id: "friendly", label: "Friendly" },
    { id: "casual", label: "Casual" },
    { id: "efficient", label: "Efficient" },
  ];

  return (
    <div className="flex h-full min-h-screen bg-background">

      {/* ── Left Sidebar ── */}
      <div
        className="w-56 shrink-0 border-r border-white/[0.06] flex flex-col py-6 px-3 sticky top-0 h-screen overflow-y-auto"
        style={{ background: "rgba(15,15,15,0.5)" }}
      >
        <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest px-3 mb-3">Settings</p>
        <nav className="space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                active === id
                  ? "text-[#89E900] bg-[#89E900]/10"
                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Content Panel ── */}
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl">

        {/* ── PROFILE ── */}
        {active === "profile" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[18px] font-bold text-white">Profile</h2>
              <p className="text-[13px] text-white/40 mt-1">Manage your personal information and plan.</p>
            </div>

            <SettingsCard>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-[#89E900]/15 border border-[#89E900]/25 flex items-center justify-center text-[22px] font-bold text-[#89E900]">
                    {(user.name || "U")[0].toUpperCase()}
                  </div>
                  <button className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-[#222] border border-white/15 flex items-center justify-center hover:border-[#89E900]/40 transition-colors">
                    <Camera className="h-3 w-3 text-white/50" />
                  </button>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">{user.name || "User"}</p>
                  <p className="text-[12px] text-white/35 mt-0.5">{user.email}</p>
                  <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${PLAN_BADGE[user.plan]}`}>
                    {planConfig?.name ?? "Free"} Plan
                  </span>
                </div>
              </div>
            </SettingsCard>

            <SettingsCard title="Personal Info">
              <FieldRow label="Full Name">
                <StyledInput value={name} onChange={setName} placeholder="Your name" />
              </FieldRow>
              <FieldRow label="Email">
                <StyledInput value={user.email} placeholder="your@email.com" />
              </FieldRow>
              <FieldRow label="Workspace Name">
                <StyledInput value={workspace} onChange={setWorkspace} placeholder="My Workspace" />
              </FieldRow>
            </SettingsCard>

            <SettingsCard title="Plan">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-white/80">Current plan</p>
                  <p className="text-[11px] text-white/35 mt-0.5">{planConfig?.credits ?? 3} credits/month</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${PLAN_BADGE[user.plan]}`}>
                  {planConfig?.name ?? "Free"}
                </span>
              </div>
              {user.plan !== "pro" && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-black transition-all duration-150"
                  style={{ background: "linear-gradient(135deg,#89E900,#6BBF00)", boxShadow: "0 4px 20px rgba(137,233,0,0.25)" }}
                >
                  <Zap className="h-3.5 w-3.5 fill-black" />
                  Upgrade Plan
                </button>
              )}
            </SettingsCard>

            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-black transition-all"
              style={{ background: "#89E900" }}
            >
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </button>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {active === "notifications" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[18px] font-bold text-white">Notifications</h2>
              <p className="text-[13px] text-white/40 mt-1">Control how and when PixaLera notifies you.</p>
            </div>
            <SettingsCard title="In-App">
              <div className="space-y-4 divide-y divide-white/[0.05]">
                <ToggleRow
                  label="Generation Complete Alerts"
                  sub="Get notified when your image is ready"
                  checked={notifs.generationComplete}
                  onChange={(v) => setNotifs((n) => ({ ...n, generationComplete: v }))}
                />
              </div>
            </SettingsCard>
            <SettingsCard title="Email">
              <div className="space-y-4 divide-y divide-white/[0.05]">
                <ToggleRow
                  label="Email Notifications"
                  sub="Receive updates directly to your inbox"
                  checked={notifs.emailNotifs}
                  onChange={(v) => setNotifs((n) => ({ ...n, emailNotifs: v }))}
                />
                <div className="pt-4">
                  <ToggleRow
                    label="Product Updates"
                    sub="New features, improvements and changelogs"
                    checked={notifs.productUpdates}
                    onChange={(v) => setNotifs((n) => ({ ...n, productUpdates: v }))}
                  />
                </div>
                <div className="pt-4">
                  <ToggleRow
                    label="Marketing Emails"
                    sub="Promotions, offers and announcements"
                    checked={notifs.marketingEmails}
                    onChange={(v) => setNotifs((n) => ({ ...n, marketingEmails: v }))}
                  />
                </div>
              </div>
            </SettingsCard>
          </div>
        )}

        {/* ── PERSONALIZATION ── */}
        {active === "personalization" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[18px] font-bold text-white">Personalization</h2>
              <p className="text-[13px] text-white/40 mt-1">Customize how PixaLera works for you.</p>
            </div>

            <SettingsCard title="Base Style & Tone">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLE_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setBaseStyle(s.id)}
                    className="px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-all duration-150 text-left"
                    style={
                      baseStyle === s.id
                        ? { background: "rgba(137,233,0,0.1)", borderColor: "rgba(137,233,0,0.35)", color: "#89E900" }
                        : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </SettingsCard>

            <SettingsCard title="About You">
              <FieldRow label="Nickname">
                <StyledInput value={nickname} onChange={setNickname} placeholder="What should we call you?" />
              </FieldRow>
              <FieldRow label="Occupation">
                <StyledInput value={occupation} onChange={setOccupation} placeholder="e.g. Product Designer" />
              </FieldRow>
            </SettingsCard>

            <SettingsCard title="Custom Instructions">
              <p className="text-[12px] text-white/35">Tell PixaLera how to tailor its outputs for you.</p>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Always generate images in a minimalist style with white backgrounds..."
                rows={4}
                className="w-full rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none transition-all duration-150 focus:border-[#89E900]/40 resize-none"
              />
            </SettingsCard>

            <button
              onClick={() => toast.success("Preferences saved")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-black"
              style={{ background: "#89E900" }}
            >
              <Save className="h-3.5 w-3.5" />
              Save Preferences
            </button>
          </div>
        )}

        {/* ── DATA CONTROLS ── */}
        {active === "data" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[18px] font-bold text-white">Data Controls</h2>
              <p className="text-[13px] text-white/40 mt-1">Manage your data and history.</p>
            </div>

            <SettingsCard title="Export">
              <ActionButton label="Download My Data" icon={Download} onClick={() => toast.info("Preparing your data export…")} />
            </SettingsCard>

            <SettingsCard title="Chat History">
              <div className="space-y-2">
                <ActionButton label="View Archived Generations" icon={Archive} onClick={() => navigate("/app/history")} />
                <ActionButton label="Archive All History" icon={Archive} onClick={() => toast.info("All history archived")} />
                <ActionButton label="Clear Chat History" icon={Trash2} onClick={() => toast.info("History cleared")} />
              </div>
              <div className="pt-2">
                <ToggleRow
                  label="Auto-delete after 30 days"
                  sub="Generations older than 30 days are removed automatically"
                  checked={autoDelete}
                  onChange={setAutoDelete}
                />
              </div>
            </SettingsCard>

            <SettingsCard title="Danger Zone">
              <div className="space-y-2 p-1 rounded-xl border border-red-500/10" style={{ background: "rgba(239,68,68,0.03)" }}>
                <div className="flex items-start gap-3 px-3 pt-3 pb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-400/70 leading-relaxed">
                    Deleting your account is permanent and cannot be undone. All your data, generations, and credits will be lost.
                  </p>
                </div>
                <DangerButton
                  label="Delete PixaLera Account"
                  icon={Trash2}
                  onClick={() => toast.error("Contact support to delete your account")}
                />
              </div>
            </SettingsCard>
          </div>
        )}

        {/* ── SECURITY ── */}
        {active === "security" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[18px] font-bold text-white">Security</h2>
              <p className="text-[13px] text-white/40 mt-1">Manage your account security and sessions.</p>
            </div>

            <SettingsCard title="Password">
              <ActionButton
                label="Change Password"
                icon={KeyRound}
                onClick={() => toast.info("Password reset email sent")}
              />
            </SettingsCard>

            <SettingsCard title="Sessions">
              <div className="space-y-2">
                <ActionButton
                  label="Logout from All Devices"
                  icon={Shield}
                  onClick={() => toast.info("Logged out from all devices")}
                />
                <ActionButton
                  label="Log out"
                  icon={LogOut}
                  onClick={handleLogout}
                />
              </div>
            </SettingsCard>

            <SettingsCard title="Danger Zone">
              <div className="space-y-2 p-1 rounded-xl border border-red-500/10" style={{ background: "rgba(239,68,68,0.03)" }}>
                <div className="flex items-start gap-3 px-3 pt-3 pb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-400/70 leading-relaxed">
                    This will permanently delete your account and all associated data.
                  </p>
                </div>
                <DangerButton
                  label="Delete Account"
                  icon={Trash2}
                  onClick={() => toast.error("Contact support to delete your account")}
                />
              </div>
            </SettingsCard>
          </div>
        )}

        {/* ── HELP ── */}
        {active === "help" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[18px] font-bold text-white">Help & Support</h2>
              <p className="text-[13px] text-white/40 mt-1">Resources, documentation and support.</p>
            </div>

            <SettingsCard>
              <div className="space-y-1">
                {HELP_ITEMS.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    onClick={() => toast.info(`Opening ${label}…`)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] text-white/65 font-medium transition-all duration-150 hover:bg-white/[0.05] hover:text-white group"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-white/30 group-hover:text-white/55 transition-colors" />
                    <span className="flex-1 text-left">{label}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
                  </button>
                ))}
              </div>
            </SettingsCard>

            <SettingsCard>
              <div className="text-center py-2 space-y-1">
                <p className="text-[12px] text-white/30">PixaLera v1.0.0</p>
                <p className="text-[11px] text-white/20">© 2026 PixaLera. All rights reserved.</p>
              </div>
            </SettingsCard>
          </div>
        )}
      </div>
    </div>
  );
}
