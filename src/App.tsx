import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import AccessDenied from "@/pages/admin/AccessDenied";

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

// Layouts
import { AppLayout } from "@/layouts/AppLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

// Website pages
import LandingPage from "@/pages/website/LandingPage";
import FeaturesPage from "@/pages/website/FeaturesPage";
import ResourcesPage from "@/pages/website/ResourcesPage";
import HowItWorksPage from "@/pages/website/HowItWorksPage";
import PricingPage from "@/pages/website/PricingPage";
import LoginPage from "@/pages/website/LoginPage";
import SignupPage from "@/pages/website/SignupPage";
import DemoPage from "@/pages/website/DemoPage";
import ToolDetailPage from "@/pages/website/ToolDetailPage";
import HelpCenterPage from "@/pages/website/HelpCenterPage";
import BlogPage from "@/pages/website/BlogPage";
import PrivacyPolicyPage from "@/pages/website/PrivacyPolicyPage";
import TermsPage from "@/pages/website/TermsPage";
import RefundPolicyPage from "@/pages/website/RefundPolicyPage";
import CookiesPolicyPage from "@/pages/website/CookiesPolicyPage";

// App pages
import WelcomeDashboard from "@/pages/app/WelcomeDashboard";
import CatalogsPage from "@/pages/app/CatalogsPage";
import AdsPage from "@/pages/app/AdsPage";
import CinematicAdsPage from "@/pages/app/CinematicAdsPage";
import ImagesPage from "@/pages/app/ImagesPage";
import PromptLibraryPage from "@/pages/app/PromptLibraryPage";
import InspirationHubPage from "@/pages/app/InspirationHubPage";
import CreditsPage from "@/pages/app/CreditsPage";
import PlanPage from "@/pages/app/PlanPage";
import CheckoutPage from "@/pages/app/CheckoutPage";
import SettingsPage from "@/pages/app/SettingsPage";
import RewardsPage from "@/pages/app/RewardsPage";
import BillingPage from "@/pages/app/BillingPage";

function RefRedirect() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/signup?ref=${userId}`, { replace: true });
  }, [userId, navigate]);
  return null;
}

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

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Marketing Website */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/guides" element={<ResourcesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/tools/:slug" element={<ToolDetailPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/cookies" element={<CookiesPolicyPage />} />
            <Route path="/ref/:userId" element={<RefRedirect />} />

            {/* App Dashboard — Protected */}
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<WelcomeDashboard />} />
              <Route path="prompts" element={<PromptLibraryPage />} />
              <Route path="inspiration" element={<InspirationHubPage />} />
              <Route path="catalogs" element={<CatalogsPage />} />
              <Route path="ads" element={<AdsPage />} />
              <Route path="cinematic-ads" element={<CinematicAdsPage />} />
              <Route path="images" element={<ImagesPage />} />
              <Route path="credits" element={<CreditsPage />} />
              <Route path="plan" element={<PlanPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="rewards" element={<RewardsPage />} />
              <Route path="billing" element={<BillingPage />} />
            </Route>

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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
