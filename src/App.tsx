import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

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

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminPlaceholder from "@/pages/admin/AdminPlaceholder";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Marketing Website */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* App Dashboard */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<WelcomeDashboard />} />
            <Route path="catalogs" element={<CatalogsPage />} />
            <Route path="ads" element={<AdsPage />} />
            <Route path="images" element={<ImagesPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>

          {/* Admin Panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminPlaceholder title="Users" />} />
            <Route path="credits" element={<AdminPlaceholder title="Credits" />} />
            <Route path="billing" element={<AdminPlaceholder title="Billing" />} />
            <Route path="analytics" element={<AdminPlaceholder title="AI Analytics" />} />
            <Route path="moderation" element={<AdminPlaceholder title="Catalog Moderation" />} />
            <Route path="support" element={<AdminPlaceholder title="Support" />} />
            <Route path="system" element={<AdminPlaceholder title="System Monitoring" />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
