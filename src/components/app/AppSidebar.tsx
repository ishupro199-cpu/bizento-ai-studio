import { useState } from "react";
import {
  FolderOpen, Megaphone, Image,
  CreditCard, Lightbulb, ChevronRight, ChevronLeft, X,
  Settings, Plus, History
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
  { title: "History", url: "/app/history", icon: History },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
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
  const { user } = useAppContext();
  const [logoHovered, setLogoHovered] = useState(false);

  const handleNavClick = () => {
    if (isMobile) onClose();
  };

  const handleNewGenerate = () => {
    navigate("/app");
    if (isMobile) onClose();
  };

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

        {/* Scrollable nav area */}
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

    </>
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
