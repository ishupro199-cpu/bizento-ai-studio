import { useState } from "react";
import { AppSidebar } from "@/components/app/AppSidebar";
import { TopNavbar } from "@/components/app/TopNavbar";
import { UpgradeModal } from "@/components/app/UpgradeModal";
import { Outlet } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AppProvider>
      <WorkspaceProvider>
      <ChatProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
          <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
            <TopNavbar onMenuToggle={() => setMobileOpen((o) => !o)} />
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
        <UpgradeModal />
      </ChatProvider>
      </WorkspaceProvider>
    </AppProvider>
  );
}
