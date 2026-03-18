import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

// Layouts
import { AppLayout } from "@/layouts/AppLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

// Website pages
import LandingPage from "@/pages/website/LandingPage";
import FeaturesPage from "@/pages/website/FeaturesPage";
import PricingPage from "@/pages/website/PricingPage";
import LoginPage from "@/pages/website/LoginPage";
import SignupPage from "@/pages/website/SignupPage";

// App pages
import WelcomeDashboard from "@/pages/app/WelcomeDashboard";
import CatalogsPage from "@/pages/app/CatalogsPage";
import AdsPage from "@/pages/app/AdsPage";
import ImagesPage from "@/pages/app/ImagesPage";
import HistoryPage from "@/pages/app/HistoryPage";
import PromptLibraryPage from "@/pages/app/PromptLibraryPage";
import CreditsPage from "@/pages/app/CreditsPage";
import PlanPage from "@/pages/app/PlanPage";
import SettingsPage from "@/pages/app/SettingsPage";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminPlaceholder from "@/pages/admin/AdminPlaceholder";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminModerationPage from "@/pages/admin/AdminModerationPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";
import AdminSystemPage from "@/pages/admin/AdminSystemPage";
import AdminBillingPage from "@/pages/admin/AdminBillingPage";
import AdminCreditsPage from "@/pages/admin/AdminCreditsPage";
import AdminNotificationsPage from "@/pages/admin/AdminNotificationsPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminLogsPage from "@/pages/admin/AdminLogsPage";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Marketing Website */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* App Dashboard — Protected */}
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<WelcomeDashboard />} />
              <Route path="prompts" element={<PromptLibraryPage />} />
              <Route path="catalogs" element={<CatalogsPage />} />
              <Route path="ads" element={<AdsPage />} />
              <Route path="images" element={<ImagesPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="credits" element={<CreditsPage />} />
              <Route path="plan" element={<PlanPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Admin Panel — Admin only */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="billing" element={<AdminBillingPage />} />
              <Route path="credits" element={<AdminCreditsPage />} />
              <Route path="ai-tools" element={<AdminPlaceholder title="AI Tools" />} />
              <Route path="projects" element={<AdminPlaceholder title="Projects" />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="marketing" element={<AdminPlaceholder title="Marketing" />} />
              <Route path="cms" element={<AdminPlaceholder title="CMS" />} />
              <Route path="blog" element={<AdminPlaceholder title="Blog" />} />
              <Route path="prompts" element={<AdminPlaceholder title="Prompt Library" />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="support" element={<AdminPlaceholder title="Support" />} />
              <Route path="logs" element={<AdminLogsPage />} />
              <Route path="moderation" element={<AdminModerationPage />} />
              <Route path="system" element={<AdminSystemPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
