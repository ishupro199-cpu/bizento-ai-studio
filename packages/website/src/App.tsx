import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";

// Layouts
import { AppLayout } from "@/layouts/AppLayout";

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

import MaintenancePage from "@/pages/website/MaintenancePage";
import NotFound from "@/pages/NotFound";

function RefRedirect() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/signup?ref=${userId}`, { replace: true });
  }, [userId, navigate]);
  return null;
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
            <Route path="/maintenance" element={<MaintenancePage />} />

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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
