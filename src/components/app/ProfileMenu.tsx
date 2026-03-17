import { useRef, useState, useEffect, useCallback } from "react";
import {
  ChevronDown, ChevronRight, Zap, Palette, Settings,
  HelpCircle, LogOut, BookOpen, FileText, Shield,
  Bug, Keyboard, Crown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppContext, PLANS } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const HELP_ITEMS = [
  { icon: BookOpen, label: "Help Center" },
  { icon: FileText, label: "Release Notes" },
  { icon: Shield, label: "Terms & Policy" },
  { icon: Bug, label: "Report a Bug" },
  { icon: Keyboard, label: "Keyboard Shortcuts" },
];

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  free: { label: "Free", cls: "bg-white/10 text-white/50 border-white/10" },
  starter: { label: "Starter", cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  pro: { label: "Pro", cls: "bg-[#89E900]/20 text-[#89E900] border-[#89E900]/30" },
};

const GLASS_BG: React.CSSProperties = {
  background: "rgba(24,24,24,0.95)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
};

export function ProfileMenu({ collapsed }: { collapsed: boolean }) {
  const { user, setShowUpgradeModal } = useAppContext();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const helpRowRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open, setOpen] = useState(false);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0, w: 252 });
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [submenuY, setSubmenuY] = useState(0);

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";
  const planName = PLANS[user.plan]?.name ?? "Free";
  const badge = PLAN_BADGE[user.plan] ?? PLAN_BADGE.free;

  const recomputePos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const popW = 252;
    const popH = 342;
    const gap = 8;
    let x = r.left;
    let y = r.top - popH - gap;
    if (y < 8) y = r.bottom + gap;
    if (x + popW > window.innerWidth - 8) x = window.innerWidth - popW - 8;
    setPopupPos({ x, y, w: popW });
  }, []);

  const openMenu = () => {
    recomputePos();
    setOpen(true);
    setSubmenuOpen(false);
  };

  const closeMenu = useCallback(() => {
    setOpen(false);
    setSubmenuOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        !popupRef.current?.contains(t) &&
        !triggerRef.current?.contains(t) &&
        !submenuRef.current?.contains(t)
      ) {
        closeMenu();
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMenu(); };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu]);

  const startHelpOpen = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (helpRowRef.current) {
      const r = helpRowRef.current.getBoundingClientRect();
      setSubmenuY(r.top);
    }
    setSubmenuOpen(true);
  };

  const startHelpClose = () => {
    closeTimerRef.current = setTimeout(() => setSubmenuOpen(false), 130);
  };

  const handleLogout = async () => {
    closeMenu();
    await signOut();
    navigate("/login");
  };

  return (
    <>
      {/* ── Trigger tab ── */}
      <button
        ref={triggerRef}
        onClick={open ? closeMenu : openMenu}
        aria-label="Profile menu"
        className={`
          w-full flex items-center gap-3 rounded-xl py-2.5 transition-all duration-150 group select-none
          ${open ? "bg-white/[0.07]" : "hover:bg-white/[0.05]"}
          ${collapsed ? "justify-center px-0" : "px-3"}
        `}
      >
        <Avatar className="h-7 w-7 shrink-0 ring-1 ring-[#89E900]/25 transition-all duration-150 group-hover:ring-[#89E900]/55">
          {user.photoURL && <AvatarImage src={user.photoURL} alt={user.name} referrerPolicy="no-referrer" />}
          <AvatarFallback className="bg-[#89E900]/15 text-[#89E900] text-[11px] font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-semibold text-white/90 truncate leading-none">
                {user.name || "User"}
              </p>
              <p className="text-[11px] text-white/35 truncate mt-[3px]">{planName} Plan</p>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 text-white/25 transition-transform duration-200 group-hover:text-white/45 ${open ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {/* ── Main Popup (Level 1) ── */}
      {open && (
        <div
          ref={popupRef}
          style={{
            position: "fixed",
            left: popupPos.x,
            top: popupPos.y,
            width: popupPos.w,
            zIndex: 9999,
            ...GLASS_BG,
          }}
          className="flex flex-col rounded-2xl border border-white/[0.09] shadow-[0_16px_48px_rgba(0,0,0,0.7)] animate-in fade-in-0 slide-in-from-bottom-2 duration-150"
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 shrink-0 ring-2 ring-[#89E900]/35">
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.name} referrerPolicy="no-referrer" />}
                <AvatarFallback className="bg-[#89E900]/15 text-[#89E900] text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate leading-none">
                  {user.name || "User"}
                </p>
                {user.email && (
                  <p className="text-[11px] text-white/35 truncate mt-[3px]">{user.email}</p>
                )}
                <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-[2px] rounded-full text-[10px] font-semibold border ${badge.cls}`}>
                  {user.plan === "pro" && <Crown className="h-2.5 w-2.5" />}
                  {badge.label}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px mx-3 bg-white/[0.07]" />

          {/* Upgrade CTA */}
          {user.plan !== "pro" && (
            <div className="px-3 pt-3 pb-1">
              <button
                onClick={() => { closeMenu(); setShowUpgradeModal(true); }}
                className="w-full flex items-center justify-center gap-2 py-[9px] px-3 rounded-xl text-[12px] font-semibold transition-all duration-150"
                style={{
                  background: "linear-gradient(135deg, rgba(137,233,0,0.15) 0%, rgba(137,233,0,0.07) 100%)",
                  border: "1px solid rgba(137,233,0,0.28)",
                  color: "#89E900",
                  boxShadow: "0 2px 12px rgba(137,233,0,0.08)",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "linear-gradient(135deg, rgba(137,233,0,0.25) 0%, rgba(137,233,0,0.12) 100%)";
                  el.style.borderColor = "rgba(137,233,0,0.48)";
                  el.style.boxShadow = "0 4px 20px rgba(137,233,0,0.18)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "linear-gradient(135deg, rgba(137,233,0,0.15) 0%, rgba(137,233,0,0.07) 100%)";
                  el.style.borderColor = "rgba(137,233,0,0.28)";
                  el.style.boxShadow = "0 2px 12px rgba(137,233,0,0.08)";
                }}
              >
                <Zap className="h-3.5 w-3.5 fill-[#89E900]" />
                Upgrade to Pro
              </button>
            </div>
          )}

          {/* Menu items */}
          <div className="px-2 pt-2 pb-1 space-y-[2px]">
            <MenuRow icon={Palette} label="Personalization" onClick={() => { closeMenu(); navigate("/app"); }} />
            <MenuRow icon={Settings} label="Settings" onClick={() => { closeMenu(); navigate("/app/settings"); }} />

            {/* Help — hover triggers submenu */}
            <div
              ref={helpRowRef}
              onMouseEnter={startHelpOpen}
              onMouseLeave={startHelpClose}
            >
              <div
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] cursor-default transition-all duration-150 hover:bg-white/[0.06]"
                style={submenuOpen
                  ? { background: "rgba(137,233,0,0.07)", color: "#89E900" }
                  : { color: "rgba(255,255,255,0.65)" }
                }
              >
                <HelpCircle className="h-4 w-4 shrink-0" />
                <span className="flex-1 font-medium">Help</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
              </div>
            </div>
          </div>

          <div className="h-px mx-3 my-1 bg-white/[0.07]" />

          {/* Logout */}
          <div className="px-2 pb-2.5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-white/45 font-medium transition-all duration-150 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Log out
            </button>
          </div>
        </div>
      )}

      {/* ── Help Submenu (Level 2) ── */}
      {open && submenuOpen && (
        <div
          ref={submenuRef}
          onMouseEnter={() => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
          }}
          onMouseLeave={startHelpClose}
          style={{
            position: "fixed",
            left: popupPos.x + popupPos.w + 6,
            top: submenuY,
            width: 204,
            zIndex: 10000,
            ...GLASS_BG,
          }}
          className="flex flex-col rounded-2xl border border-white/[0.09] shadow-[0_16px_48px_rgba(0,0,0,0.65)] animate-in fade-in-0 slide-in-from-left-1 duration-100"
        >
          <div className="px-2 py-2 space-y-[2px]">
            {HELP_ITEMS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={closeMenu}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-white/60 font-medium transition-all duration-150 hover:bg-white/[0.06] hover:text-white group"
              >
                <Icon className="h-4 w-4 shrink-0 text-white/25 group-hover:text-white/55 transition-colors" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-white/65 font-medium transition-all duration-150 hover:bg-white/[0.06] hover:text-white"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}
