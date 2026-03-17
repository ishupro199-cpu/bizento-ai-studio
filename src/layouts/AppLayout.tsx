import { useState } from "react";
import { AppSidebar } from "@/components/app/AppSidebar";
import { TopNavbar } from "@/components/app/TopNavbar";
import { UpgradeModal } from "@/components/app/UpgradeModal";
import { Outlet } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AppProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <TopNavbar onMenuToggle={() => setCollapsed((c) => !c)} />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <UpgradeModal />
    </AppProvider>
  );
}
