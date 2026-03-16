import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { TopNavbar } from "@/components/app/TopNavbar";
import { UpgradeModal } from "@/components/app/UpgradeModal";
import { Outlet } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";

export function AppLayout() {
  return (
    <AppProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <TopNavbar />
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
        <UpgradeModal />
      </SidebarProvider>
    </AppProvider>
  );
}
