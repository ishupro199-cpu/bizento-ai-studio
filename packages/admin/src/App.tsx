import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import AccessDenied from "@/pages/admin/AccessDenied";
import { AdminLayout } from "@/layouts/AdminLayout";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminModerationPage from "@/pages/admin/AdminModerationPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";
import AdminSystemPage from "@/pages/admin/AdminSystemPage";
import AdminBillingPage from "@/pages/admin/AdminBillingPage";
import AdminCreditsPage from "@/pages/admin/AdminCreditsPage";
import AdminNotificationsPage from "@/pages/admin/AdminNotificationsPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminLogsPage from "@/pages/admin/AdminLogsPage";
import AdminInspirationHub from "@/pages/admin/AdminInspirationHub";
import AdminCmsPage from "@/pages/admin/AdminCmsPage";
import AdminMarketingPage from "@/pages/admin/AdminMarketingPage";
import AdminAiToolsPage from "@/pages/admin/AdminAiToolsPage";
import AdminProjectsPage from "@/pages/admin/AdminProjectsPage";
import AdminSupportPage from "@/pages/admin/AdminSupportPage";
import AdminBlogPage from "@/pages/admin/AdminBlogPage";
import AdminReferralsPage from "@/pages/admin/AdminReferralsPage";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 32, height: 32, color: "#89E900", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <AccessDenied />;
  return <>{children}</>;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/login" element={<Navigate to="/admin" replace />} />

            {/* Admin Panel — Admin only */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="billing" element={<AdminBillingPage />} />
              <Route path="credits" element={<AdminCreditsPage />} />
              <Route path="ai-tools" element={<AdminAiToolsPage />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="marketing" element={<AdminMarketingPage />} />
              <Route path="cms" element={<AdminCmsPage />} />
              <Route path="blog" element={<AdminBlogPage />} />
              <Route path="inspiration" element={<AdminInspirationHub />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="support" element={<AdminSupportPage />} />
              <Route path="logs" element={<AdminLogsPage />} />
              <Route path="moderation" element={<AdminModerationPage />} />
              <Route path="system" element={<AdminSystemPage />} />
              <Route path="referrals" element={<AdminReferralsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
