import { useState, useRef, useEffect } from "react";
import {
  FolderOpen, Megaphone, Image,
  CreditCard, Lightbulb, ChevronRight, ChevronLeft, X,
  Settings, Plus, Clock, MoreHorizontal, Pencil, Trash2, Archive,
  Check,
} from "lucide-react";
import { PixaLeraIcon } from "@/components/PixaLeraIcon";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/contexts/AppContext";
import { ProfileMenu } from "@/components/app/ProfileMenu";

const navItems = [
  { title: "Inspiration Hub", url: "/app/inspiration", icon: Lightbulb },
  { title: "My Catalogs", url: "/app/catalogs", icon: FolderOpen },
  { title: "My Ads", url: "/app/ads", icon: Megaphone },
  { title: "Images", url: "/app/images", icon: Image },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function useHistoryMeta() {
  const storageKey = "pixalera_history_meta";
  const [meta, setMeta] = useState<Record<string, { name?: string; archived?: boolean }>>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; }
  });
  const save = (next: Record<string, { name?: string; archived?: boolean }>) => {
    setMeta(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  };
  const rename = (id: string, name: string) => save({ ...meta, [id]: { ...meta[id], name } });
  const archive = (id: string) => save({ ...meta, [id]: { ...meta[id], archived: true } });
  const unarchive = (id: string) => save({ ...meta, [id]: { ...meta[id], archived: false } });
  return { meta, rename, archive, unarchive };
}

function HistoryItem({
  gen,
  metaName,
  onRename,
  onArchive,
  onDelete,
}: {
  gen: { id: string; prompt: string; date: Date; gradient: string; tool: string };
  metaName?: string;
  onRename: (id: string, name: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(metaName || gen.prompt);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = metaName || gen.prompt;
  const date = gen.date instanceof Date
    ? gen.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "";

  useEffect(() => {
    if (renaming && inputRef.current) inputRef.current.focus();
  }, [renaming]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const commitRename = () => {
    const trimmed = nameInput.trim();
    if (trimmed) onRename(gen.id, trimmed);
    setRenaming(false);
  };

  if (renaming) {
    return (
      <div className="px-2 py-1">
        <input
          ref={inputRef}
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenaming(false); }}
          className="w-full bg-white/8 border border-primary/30 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none"
        />
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors cursor-pointer">
      <div className="h-6 w-6 shrink-0 rounded-md" style={{ background: gen.gradient || "linear-gradient(135deg,#89E900 0%,#222 100%)" }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[hsl(var(--sidebar-foreground))] truncate leading-snug">{displayName}</p>
        <p className="text-[10px] text-muted-foreground/50">{date}</p>
      </div>
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
          className="h-6 w-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-7 z-50 w-36 bg-popover border border-white/10 rounded-xl shadow-xl py-1 animate-fade-in">
            <button
              onClick={() => { setMenuOpen(false); setRenaming(true); setNameInput(displayName); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-white/5 transition-colors"
            >
              <Pencil className="h-3 w-3 text-muted-foreground" /> Rename
            </button>
            <button
              onClick={() => { setMenuOpen(false); onArchive(gen.id); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-white/5 transition-colors"
            >
              <Archive className="h-3 w-3 text-muted-foreground" /> Archive
            </button>
            <div className="h-px bg-white/8 my-0.5" />
            <button
              onClick={() => { setMenuOpen(false); onDelete(gen.id); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarInner({
  collapsed,
  onToggle,
  onClose,
  isMobile = false,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onClose: () => void;
  isMobile?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, generations, deleteGeneration } = useAppContext();
  const { meta, rename, archive } = useHistoryMeta();
  const [logoHovered, setLogoHovered] = useState(false);

  const handleNavClick = () => { if (isMobile) onClose(); };
  const handleNewGenerate = () => { navigate("/app"); if (isMobile) onClose(); };

  const isCollapsed = isMobile ? false : collapsed;

  const visibleGenerations = generations.filter(g => !meta[g.id]?.archived);

  return (
    <div
      style={{ width: isMobile ? 280 : isCollapsed ? 72 : 240 }}
      className="flex flex-col h-full bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] overflow-hidden transition-[width] duration-200 ease-in-out"
    >
      {/* Logo row */}
      <div className={`flex items-center h-14 px-3 shrink-0 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {isCollapsed ? (
          <button
            onClick={onToggle}
            title="Expand sidebar"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className={`transition-opacity duration-150 ${logoHovered ? "opacity-0" : "opacity-100"}`}>
              <PixaLeraIcon size={28} />
            </div>
            <ChevronRight className={`h-4 w-4 text-muted-foreground absolute transition-opacity duration-150 ${logoHovered ? "opacity-100" : "opacity-0"}`} />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <PixaLeraIcon size={28} className="shrink-0" />
              <span className="text-base font-black tracking-tight whitespace-nowrap" style={{ color: "#F0EBD8", letterSpacing: "-0.02em" }}>
                Pixalera<span style={{ color: "#89E900" }}>.</span>
              </span>
            </div>
            <button
              onClick={isMobile ? onClose : onToggle}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
            >
              {isMobile ? <X className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </>
        )}
      </div>

      {/* New Generate button */}
      <div className={`px-2 pb-2 ${isCollapsed ? "flex justify-center" : ""}`}>
        <button
          onClick={handleNewGenerate}
          title="New Generate"
          className={`flex items-center gap-2.5 rounded-xl transition-all duration-150 font-semibold text-sm ${
            isCollapsed
              ? "justify-center h-9 w-9 bg-primary/15 hover:bg-primary/25 text-primary"
              : "w-full px-3 py-2.5 bg-primary/10 hover:bg-primary/18 text-primary border border-primary/20 hover:border-primary/35"
          }`}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>New Generate</span>}
        </button>
      </div>

      <Separator className="mx-3 w-auto bg-[hsl(var(--sidebar-border))] mb-2" />

      {/* Scrollable nav + history area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 px-2 space-y-0.5 sidebar-scroll">
        {/* Nav items */}
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.url);
          return (
            <NavLink
              key={item.title}
              to={item.url}
              end={false}
              onClick={handleNavClick}
              title={isCollapsed ? item.title : undefined}
              className={`flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors duration-150 ${
                isCollapsed ? "justify-center w-full px-0" : "px-3"
              } ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-[hsl(var(--sidebar-foreground))] hover:bg-white/5"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{item.title}</span>}
            </NavLink>
          );
        })}

        {/* History section — only when expanded */}
        {!isCollapsed && (
          <>
            <div className="pt-4 pb-1 flex items-center gap-2 px-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
              <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider flex-1">History</span>
            </div>

            {visibleGenerations.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/40 px-3 py-2">No generations yet</p>
            ) : (
              visibleGenerations.slice(0, 20).map(gen => (
                <HistoryItem
                  key={gen.id}
                  gen={gen as any}
                  metaName={meta[gen.id]?.name}
                  onRename={rename}
                  onArchive={archive}
                  onDelete={deleteGeneration}
                />
              ))
            )}
          </>
        )}

        {/* Collapsed: history icon placeholder */}
        {isCollapsed && (
          <button
            onClick={onToggle}
            title="History (expand sidebar)"
            className="w-full flex items-center justify-center rounded-lg py-2 text-[hsl(var(--sidebar-foreground))] hover:bg-white/5 transition-colors"
          >
            <Clock className="h-5 w-5 shrink-0" />
          </button>
        )}
      </div>

      <Separator className="mx-3 w-auto bg-[hsl(var(--sidebar-border))]" />

      {/* Account / Plan / Settings */}
      <div className="px-2 py-2 space-y-0.5">
        {!isCollapsed && (
          <p className="px-3 py-1 text-[10px] text-muted-foreground/70 uppercase tracking-wider">Account</p>
        )}
        <NavLink
          to="/app/plan"
          onClick={handleNavClick}
          title={isCollapsed ? "Plan" : undefined}
          className={`flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors duration-150 ${
            isCollapsed ? "justify-center px-0 w-full" : "px-3"
          } ${
            location.pathname.startsWith("/app/plan")
              ? "bg-primary/10 text-primary"
              : "text-[hsl(var(--sidebar-foreground))] hover:bg-white/5"
          }`}
        >
          <CreditCard className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Plan</span>}
        </NavLink>
        <NavLink
          to="/app/settings"
          onClick={handleNavClick}
          title={isCollapsed ? "Settings" : undefined}
          className={`flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors duration-150 ${
            isCollapsed ? "justify-center px-0 w-full" : "px-3"
          } ${
            location.pathname.startsWith("/app/settings")
              ? "bg-primary/10 text-primary"
              : "text-[hsl(var(--sidebar-foreground))] hover:bg-white/5"
          }`}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
        </NavLink>
      </div>

      <Separator className="mx-3 w-auto bg-[hsl(var(--sidebar-border))]" />

      {/* Profile footer */}
      <div className="px-2 py-3 shrink-0">
        <ProfileMenu collapsed={isCollapsed} />
      </div>
    </div>
  );
}

export function AppSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: AppSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden sm:flex shrink-0 h-screen sticky top-0">
        <SidebarInner
          collapsed={collapsed}
          onToggle={onToggle}
          onClose={onToggle}
          isMobile={false}
        />
      </div>

      {/* Mobile drawer overlay */}
      <div className="sm:hidden">
        <div
          className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={onMobileClose}
        />
        <div
          className={`fixed inset-y-0 left-0 z-50 flex h-full transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarInner
            collapsed={false}
            onToggle={onMobileClose}
            onClose={onMobileClose}
            isMobile={true}
          />
        </div>
      </div>
    </>
  );
}
