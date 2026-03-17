import { useState } from "react";
import {
  Sparkles, FolderOpen, Megaphone, Image,
  CreditCard, Settings, BookOpen, ChevronRight, ChevronLeft, X, Clock
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/contexts/AppContext";
import { HistoryPanel } from "@/components/app/HistoryPanel";

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
  onClose?: () => void;
  isMobile?: boolean;
}

export function AppSidebar({ collapsed, onToggle, onClose, isMobile }: AppSidebarProps) {
  const location = useLocation();
  const { user, generations } = useAppContext();
  const [selectedGenId, setSelectedGenId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleHistoryClick = (id: string) => {
    setSelectedGenId(id);
    setPanelOpen(true);
  };

  return (
    <>
      <aside
        style={{ width: collapsed ? 72 : 240 }}
        className="relative flex flex-col h-screen bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] transition-[width] duration-200 ease-in-out shrink-0 overflow-hidden z-30"
      >
        {/* Logo row */}
        <div className={`flex items-center h-14 px-3 shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
          {collapsed ? (
            <button
              onClick={onToggle}
              title="Expand sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 shrink-0 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
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

        {/* Scrollable area: nav + history */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0.5 sidebar-scroll">
          {/* Main nav items */}
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
                title={collapsed ? item.title : undefined}
                className={`flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors duration-150 ${
                  collapsed ? "justify-center w-full px-0" : "px-3"
                } ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-[hsl(var(--sidebar-foreground))] hover:bg-white/5"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{item.title}</span>}
              </NavLink>
            );
          })}

          {/* History section — heading + inline list */}
          {!collapsed && (
            <>
              <div className="pt-4 pb-1 px-3 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                  History
                </span>
              </div>

              {generations.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground/50">
                  No generations yet.
                </p>
              ) : (
                generations.slice(0, 20).map((gen) => (
                  <button
                    key={gen.id}
                    onClick={() => handleHistoryClick(gen.id)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-white/5 transition-colors group"
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

          {/* Collapsed: show clock icon for history */}
          {collapsed && (
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
          {!collapsed && (
            <p className="px-3 py-1 text-[10px] text-muted-foreground/70 uppercase tracking-wider">Account</p>
          )}
          <NavLink
            to="/app/plan"
            title={collapsed ? "Plan" : undefined}
            className={`flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors duration-150 ${
              collapsed ? "justify-center px-0 w-full" : "px-3"
            } ${
              location.pathname.startsWith("/app/plan")
                ? "bg-primary/10 text-primary"
                : "text-[hsl(var(--sidebar-foreground))] hover:bg-white/5"
            }`}
          >
            <CreditCard className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">Plan</span>}
          </NavLink>
        </div>

        <Separator className="mx-3 w-auto bg-[hsl(var(--sidebar-border))]" />

        {/* Profile footer */}
        <div className="px-2 py-3 shrink-0">
          <div
            className={`flex items-center gap-3 rounded-lg py-2 hover:bg-white/5 transition-colors cursor-pointer ${
              collapsed ? "justify-center px-0" : "px-3"
            }`}
          >
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between min-w-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate leading-none">
                    {user.name || "User"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                </div>
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Expand toggle when collapsed */}
        {collapsed && (
          <div className="px-2 pb-3">
            <button
              onClick={onToggle}
              title="Expand"
              className="w-full flex items-center justify-center rounded-lg py-2 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>

      <HistoryPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        selectedId={selectedGenId}
      />
    </>
  );
}
