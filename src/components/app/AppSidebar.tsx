import { useState } from "react";
import {
  Sparkles, FolderOpen, Megaphone, Image,
  CreditCard, BookOpen, ChevronRight, ChevronLeft, X, Clock
} from "lucide-react";
import { PixaLeraIcon } from "@/components/PixaLeraIcon";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/contexts/AppContext";
import { HistoryPanel } from "@/components/app/HistoryPanel";
import { ProfileMenu } from "@/components/app/ProfileMenu";

const navItems = [
  { title: "Generate", url: "/app", icon: Sparkles },
  { title: "Prompt Library", url: "/app/prompts", icon: BookOpen },
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

/* Reusable inner content — rendered in both desktop and mobile sidebars */
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
  const { user, generations } = useAppContext();
  const [selectedGenId, setSelectedGenId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);

  const handleHistoryClick = (id: string) => {
    setSelectedGenId(id);
    setPanelOpen(true);
    if (isMobile) onClose();
  };

  const handleNavClick = () => {
    if (isMobile) onClose();
  };

  /* On mobile, sidebar is always "expanded" (show full labels) */
  const isCollapsed = isMobile ? false : collapsed;

  return (
    <>
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
                <span className="text-base font-bold tracking-tight text-foreground whitespace-nowrap">
                  Pixa<span className="text-primary">Lera</span>
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

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0.5 sidebar-scroll">
          {navItems.map((item) => {
            const isActive =
              item.url === "/app"
                ? location.pathname === "/app"
                : location.pathname.startsWith(item.url);
            return (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === "/app"}
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

          {/* History section */}
          {!isCollapsed && (
            <>
              <div className="pt-4 pb-1 px-3 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">History</span>
              </div>

              {generations.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground/50">No generations yet.</p>
              ) : (
                generations.slice(0, 20).map((gen) => (
                  <button
                    key={gen.id}
                    onClick={() => handleHistoryClick(gen.id)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-white/5 transition-colors"
                  >
                    <div
                      className="h-6 w-6 shrink-0 rounded-md"
                      style={{ background: gen.gradient || "linear-gradient(135deg,#89E900 0%,#222 100%)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[hsl(var(--sidebar-foreground))] truncate leading-snug">{gen.prompt}</p>
                      <p className="text-[10px] text-muted-foreground/60 truncate">
                        {gen.date instanceof Date
                          ? gen.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                          : ""}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </>
          )}

          {/* Collapsed: clock icon */}
          {isCollapsed && (
            <button
              onClick={() => setPanelOpen(true)}
              title="Generation History"
              className="w-full flex items-center justify-center rounded-lg py-2 text-[hsl(var(--sidebar-foreground))] hover:bg-white/5 transition-colors"
            >
              <Clock className="h-5 w-5 shrink-0" />
            </button>
          )}
        </div>

        <Separator className="mx-3 w-auto bg-[hsl(var(--sidebar-border))]" />

        {/* Account / Plan */}
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
        </div>

        <Separator className="mx-3 w-auto bg-[hsl(var(--sidebar-border))]" />

        {/* Profile footer */}
        <div className="px-2 py-3 shrink-0">
          <ProfileMenu collapsed={isCollapsed} />
        </div>
      </div>

      <HistoryPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        selectedId={selectedGenId}
      />
    </>
  );
}

export function AppSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: AppSidebarProps) {
  return (
    <>
      {/* ── Desktop sidebar — in normal flex flow, hidden on mobile ── */}
      <div className="hidden sm:flex shrink-0 h-screen sticky top-0">
        <SidebarInner
          collapsed={collapsed}
          onToggle={onToggle}
          onClose={onToggle}
          isMobile={false}
        />
      </div>

      {/* ── Mobile drawer overlay ── */}
      <div className="sm:hidden">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={onMobileClose}
        />
        {/* Drawer */}
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
