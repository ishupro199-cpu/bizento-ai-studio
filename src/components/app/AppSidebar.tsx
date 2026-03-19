import { useState, useRef, useEffect } from "react";
import {
  FolderOpenIcon,
  MegaphoneIcon,
  PhotoIcon,
  CreditCardIcon,
  LightBulbIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
  Cog6ToothIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { BizentoIcon } from "@/components/BizentoIcon";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfileMenu } from "@/components/app/ProfileMenu";
import { useChatContext, ChatSession } from "@/contexts/ChatContext";

const navItems = [
  { title: "Inspiration Hub", url: "/app/inspiration", icon: LightBulbIcon },
  { title: "My Catalogs", url: "/app/catalogs", icon: FolderOpenIcon },
  { title: "My Ads", url: "/app/ads", icon: MegaphoneIcon },
  { title: "Images", url: "/app/images", icon: PhotoIcon },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function ChatItem({
  session,
  isActive,
  onRename,
  onArchive,
  onDelete,
  onClick,
}: {
  session: ChatSession;
  isActive: boolean;
  onRename: (id: string, title: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (renaming && inputRef.current) inputRef.current.focus();
  }, [renaming]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const commitRename = () => {
    const trimmed = nameInput.trim();
    if (trimmed) onRename(session.id, trimmed);
    setRenaming(false);
  };

  const date = new Date(session.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  if (renaming) {
    return (
      <div className="px-2 py-1">
        <input
          ref={inputRef}
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setRenaming(false);
          }}
          className="w-full rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(137,233,0,0.3)" }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors cursor-pointer"
      style={{ background: isActive ? "rgba(137,233,0,0.08)" : "transparent" }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <ChatBubbleLeftRightIcon
        className="h-3.5 w-3.5 shrink-0"
        style={{ color: isActive ? "#89E900" : "rgba(255,255,255,0.22)" }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs truncate leading-snug" style={{ color: isActive ? "#89E900" : "rgba(255,255,255,0.7)" }}>
          {session.title}
        </p>
        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.28)" }}>{date}</p>
      </div>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); setConfirmDelete(false); }}
          className="h-6 w-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all"
          style={{ color: "rgba(255,255,255,0.45)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
        >
          <EllipsisHorizontalIcon className="h-3.5 w-3.5" />
        </button>

        {menuOpen && !confirmDelete && (
          <div className="absolute right-0 top-7 z-50 w-36 rounded-xl shadow-xl py-1 animate-fade-in liquid-glass-strong">
            <button
              onClick={() => { setMenuOpen(false); setRenaming(true); setNameInput(session.title); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-white/5 transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}>
              <PencilIcon className="h-3 w-3 opacity-60" /> Rename
            </button>
            <button
              onClick={() => { setMenuOpen(false); onArchive(session.id); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-white/5 transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}>
              <ArchiveBoxIcon className="h-3 w-3 opacity-60" /> Archive
            </button>
            <div className="h-px bg-white/8 my-0.5" />
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-red-500/10 transition-colors"
              style={{ color: "rgba(248,113,113,0.8)" }}>
              <TrashIcon className="h-3 w-3" /> Delete
            </button>
          </div>
        )}

        {menuOpen && confirmDelete && (
          <div className="absolute right-0 top-7 z-50 w-44 rounded-xl shadow-xl py-2 px-3 animate-fade-in liquid-glass-strong"
            style={{ borderColor: "rgba(239,68,68,0.2)", borderWidth: 1 }}>
            <p className="text-[11px] mb-2 leading-snug" style={{ color: "rgba(255,255,255,0.65)" }}>Delete this chat?</p>
            <div className="flex gap-2">
              <button
                onClick={() => { setMenuOpen(false); setConfirmDelete(false); onDelete(session.id); }}
                className="flex-1 text-[11px] font-semibold py-1 rounded-lg transition-colors"
                style={{ background: "rgba(239,68,68,0.2)", color: "rgba(248,113,113,0.9)" }}>
                Delete
              </button>
              <button
                onClick={() => { setMenuOpen(false); setConfirmDelete(false); }}
                className="flex-1 text-[11px] py-1 rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}>
                Cancel
              </button>
            </div>
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
  const { sessions, activeSessionId, setActiveSessionId, renameSession, deleteSession, archiveSession, startNewChat } = useChatContext();
  const [logoHovered, setLogoHovered] = useState(false);

  const handleNavClick = () => { if (isMobile) onClose(); };
  const handleNewChat = () => {
    startNewChat();
    navigate("/app");
    if (isMobile) onClose();
  };

  const isCollapsed = isMobile ? false : collapsed;
  const visibleSessions = sessions.filter(s => !s.is_archived);

  return (
    <div
      style={{
        width: isMobile ? 280 : isCollapsed ? 68 : 240,
        background: "rgba(12,13,18,0.85)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
      className="flex flex-col h-full overflow-hidden transition-[width] duration-200 ease-in-out"
    >
      {/* Logo row */}
      <div className={`flex items-center h-14 px-3 shrink-0 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {isCollapsed ? (
          <button
            onClick={onToggle}
            title="Expand sidebar"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
          >
            <div className={`transition-opacity duration-150 ${logoHovered ? "opacity-0" : "opacity-100"}`}>
              <BizentoIcon size={26} />
            </div>
            <ChevronRightIcon className={`h-4 w-4 absolute transition-opacity duration-150 ${logoHovered ? "opacity-100" : "opacity-0"}`} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <BizentoIcon size={26} className="shrink-0" />
              <span className="text-[15px] font-black tracking-tight whitespace-nowrap" style={{ color: "#F0EBD8", letterSpacing: "-0.02em" }}>
                Pixalera<span style={{ color: "#89E900" }}>.</span>
              </span>
            </div>
            <button
              onClick={isMobile ? onClose : onToggle}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {isMobile ? <XMarkIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
            </button>
          </>
        )}
      </div>

      {/* New Chat button */}
      <div className={`px-2 pb-2 ${isCollapsed ? "flex justify-center" : ""}`}>
        <button
          onClick={handleNewChat}
          title="New Chat"
          className={`flex items-center gap-2.5 rounded-xl transition-all duration-150 font-semibold text-sm ${
            isCollapsed
              ? "justify-center h-9 w-9"
              : "w-full px-3 py-2.5"
          }`}
          style={{
            background: isCollapsed ? "rgba(137,233,0,0.12)" : "rgba(137,233,0,0.08)",
            border: isCollapsed ? "none" : "1px solid rgba(137,233,0,0.18)",
            color: "#89E900",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(137,233,0,0.16)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isCollapsed ? "rgba(137,233,0,0.12)" : "rgba(137,233,0,0.08)"; }}
        >
          <PlusIcon className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      <div className="mx-3 h-px mb-2" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Scrollable nav + history area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 px-2 space-y-0.5 sidebar-scroll">
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
              }`}
              style={{
                color: isActive ? "#89E900" : "rgba(255,255,255,0.6)",
                background: isActive ? "rgba(137,233,0,0.08)" : "transparent",
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{item.title}</span>}
            </NavLink>
          );
        })}

        {!isCollapsed && (
          <>
            <div className="pt-4 pb-1 flex items-center gap-2 px-1">
              <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
              <span className="text-[11px] font-semibold uppercase tracking-wider flex-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                History
              </span>
            </div>
            {visibleSessions.length === 0 ? (
              <p className="text-[11px] px-3 py-2" style={{ color: "rgba(255,255,255,0.25)" }}>No chats yet</p>
            ) : (
              visibleSessions.slice(0, 30).map(session => (
                <ChatItem
                  key={session.id}
                  session={session}
                  isActive={session.id === activeSessionId}
                  onRename={renameSession}
                  onArchive={archiveSession}
                  onDelete={deleteSession}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    navigate("/app");
                    if (isMobile) onClose();
                  }}
                />
              ))
            )}
          </>
        )}

        {isCollapsed && (
          <button
            onClick={onToggle}
            title="History"
            className="w-full flex items-center justify-center rounded-lg py-2 transition-colors hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 shrink-0" />
          </button>
        )}
      </div>

      <div className="mx-3 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Account links */}
      <div className="px-2 py-2 space-y-0.5">
        {!isCollapsed && (
          <p className="px-3 py-1 text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.28)" }}>Account</p>
        )}
        <NavLink
          to="/app/plan"
          onClick={handleNavClick}
          title={isCollapsed ? "Plan" : undefined}
          className={`flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors duration-150 ${isCollapsed ? "justify-center px-0 w-full" : "px-3"}`}
          style={{ color: location.pathname.startsWith("/app/plan") ? "#89E900" : "rgba(255,255,255,0.6)", background: location.pathname.startsWith("/app/plan") ? "rgba(137,233,0,0.08)" : "transparent" }}
        >
          <CreditCardIcon className="h-[18px] w-[18px] shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Plan</span>}
        </NavLink>
        <NavLink
          to="/app/settings"
          onClick={handleNavClick}
          title={isCollapsed ? "Settings" : undefined}
          className={`flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors duration-150 ${isCollapsed ? "justify-center px-0 w-full" : "px-3"}`}
          style={{ color: location.pathname.startsWith("/app/settings") ? "#89E900" : "rgba(255,255,255,0.6)", background: location.pathname.startsWith("/app/settings") ? "rgba(137,233,0,0.08)" : "transparent" }}
        >
          <Cog6ToothIcon className="h-[18px] w-[18px] shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
        </NavLink>
      </div>

      <div className="mx-3 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

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
      <div className="hidden sm:flex shrink-0 h-screen sticky top-0">
        <SidebarInner collapsed={collapsed} onToggle={onToggle} onClose={onToggle} isMobile={false} />
      </div>
      <div className="sm:hidden">
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={onMobileClose}
        />
        <div className={`fixed inset-y-0 left-0 z-50 flex h-full transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <SidebarInner collapsed={false} onToggle={onMobileClose} onClose={onMobileClose} isMobile={true} />
        </div>
      </div>
    </>
  );
}
