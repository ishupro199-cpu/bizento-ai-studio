import { Link, useParams } from "react-router-dom";
import { WebsiteNav } from "@/components/website/WebsiteNav";
import { WebsiteFooter } from "@/components/website/WebsiteFooter";
import { Image, Zap, Film, Palette, ArrowRight, Check, Clock, Star } from "lucide-react";

const TOOLS: Record<string, {
  slug: string; label: string; tagline: string; description: string;
  icon: any; color: string; bg: string; credits: string; time: string; plan: string;
  features: string[]; useCases: string[]; badge?: string;
}> = {
  catalog: {
    slug: "catalog",
    label: "Catalog Generator",
    tagline: "Studio-quality product catalogs — no studio needed.",
    description: "Upload your raw product photo and Pixalera's AI instantly places it on a clean, professional white or custom background with perfect lighting, shadows, and reflections — ready for any ecommerce catalog.",
    icon: Image,
    color: "#a855f7",
    bg: "rgba(168,85,247,0.08)",
    credits: "5–10 credits",
    time: "6–10 seconds",
    plan: "Free & Starter",
    badge: "Most Popular",
    features: [
      "Auto-background removal & placement",
      "Professional studio lighting simulation",
      "Realistic shadow & reflection generation",
      "White, gradient, or custom scene backgrounds",
      "Amazon, Flipkart, Meesho-ready output",
      "Batch export in 1K / 2K / 4K",
    ],
    useCases: ["Ecommerce listings", "Product catalogs", "Marketplace uploads", "Print-ready assets"],
  },
  photo: {
    slug: "photo",
    label: "Product Photography",
    tagline: "CGI-quality product shots. Zero studio budget.",
    description: "Transform any product image into a high-end lifestyle or hero shot. Choose from dozens of scene presets — marble surfaces, outdoor settings, luxury backdrops — or describe your own.",
    icon: Zap,
    color: "#89E900",
    bg: "rgba(137,233,0,0.08)",
    credits: "3–5 credits",
    time: "5–8 seconds",
    plan: "Free & Starter",
    features: [
      "Lifestyle scene generation",
      "Marble, wood, fabric & more surface presets",
      "Moody, natural, and studio lighting modes",
      "Hero shot & packshot styles",
      "Color-matched background to product",
      "1K / 2K / 4K export",
    ],
    useCases: ["Social media posts", "Website hero images", "Brand lookbooks", "Influencer campaigns"],
  },
  cinematic: {
    slug: "cinematic",
    label: "Cinematic Ads",
    tagline: "Hollywood-grade product ad visuals. Powered by AI.",
    description: "Generate cinematic, film-quality advertising visuals for your product. Dramatic lighting, depth of field, and storytelling compositions that make your product impossible to scroll past.",
    icon: Film,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    credits: "30–50 credits",
    time: "10–15 seconds",
    plan: "Pro only",
    badge: "Pro",
    features: [
      "Cinematic lighting & depth of field",
      "Film-quality composition presets",
      "Dynamic shadow & atmosphere effects",
      "Dramatic color grading",
      "Scene storytelling prompts",
      "4K ultra-high resolution output",
    ],
    useCases: ["Instagram reels covers", "YouTube thumbnails", "Display advertising", "Brand campaigns"],
  },
  creative: {
    slug: "creative",
    label: "Ad Creatives",
    tagline: "Scroll-stopping ad creatives. Generated in seconds.",
    description: "Create performance-driven ad visuals for Meta, Google, and Instagram. Add bold text overlays, seasonal themes, and campaign-ready compositions — all powered by AI.",
    icon: Palette,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    credits: "3–5 credits",
    time: "5–8 seconds",
    plan: "Free & Starter",
    features: [
      "Meta, Google & Instagram sizes",
      "Bold text overlay placements",
      "Seasonal & sale campaign themes",
      "Brand color integration",
      "A/B variant generation",
      "Direct export for ad platforms",
    ],
    useCases: ["Facebook Ads", "Instagram Stories", "Google Display", "Seasonal sales"],
  },
};

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = TOOLS[slug || ""] || TOOLS["catalog"];
  const Icon = tool.icon;

  return (
    <div className="min-h-screen" style={{ background: "#0D0F14", color: "#F0EBD8" }}>
      <WebsiteNav />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: tool.bg, border: `1px solid ${tool.color}30` }}>
              <Icon className="h-6 w-6" style={{ color: tool.color }} />
            </div>
            {tool.badge && (
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                style={{ background: tool.bg, color: tool.color, border: `1px solid ${tool.color}30` }}>
                {tool.badge}
              </span>
            )}
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
            {tool.label}
          </h1>
          <p className="text-[22px] font-semibold mb-4" style={{ color: tool.color }}>{tool.tagline}</p>
          <p className="text-[17px] leading-relaxed mb-8" style={{ color: "#8A8F9E" }}>{tool.description}</p>

          <div className="flex flex-wrap gap-4 mb-10">
            {[
              ["⚡", tool.credits, "per generation"],
              ["⏱", tool.time, "average time"],
              ["🔓", tool.plan, "available on"],
            ].map(([icon, val, label]) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span>{icon}</span>
                <div>
                  <p className="text-[13px] font-bold text-white">{val}</p>
                  <p className="text-[11px]" style={{ color: "#8A8F9E" }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link to="/signup" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px]"
              style={{ background: "#89E900", color: "#0D0F14" }}>
              Try free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/demo" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-[15px]"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EBD8" }}>
              See demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-black mb-6">What's included</h2>
            <ul className="space-y-3">
              {tool.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                    style={{ background: tool.bg, border: `1px solid ${tool.color}30` }}>
                    <Check className="h-3 w-3" style={{ color: tool.color }} />
                  </div>
                  <span className="text-[14px]" style={{ color: "#C4C9D4" }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-black mb-6">Best for</h2>
            <div className="grid grid-cols-2 gap-3">
              {tool.useCases.map((u) => (
                <div key={u} className="px-4 py-3 rounded-xl text-[13px] font-medium"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#C4C9D4" }}>
                  {u}
                </div>
              ))}
            </div>

            {/* Other tools */}
            <div className="mt-8">
              <p className="text-[12px] font-bold uppercase tracking-wider mb-4" style={{ color: "#8A8F9E" }}>Explore other tools</p>
              <div className="space-y-2">
                {Object.values(TOOLS).filter(t => t.slug !== tool.slug).map(t => {
                  const TIcon = t.icon;
                  return (
                    <Link key={t.slug} to={`/tools/${t.slug}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5"
                      style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: t.bg }}>
                        <TIcon className="h-4 w-4" style={{ color: t.color }} />
                      </div>
                      <span className="text-[13px] font-medium text-white">{t.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-auto" style={{ color: "#8A8F9E" }} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: tool.bg, border: `1px solid ${tool.color}30` }}>
          <Icon className="h-7 w-7" style={{ color: tool.color }} />
        </div>
        <h2 className="text-3xl font-black mb-3">Start with {tool.label}</h2>
        <p className="mb-8" style={{ color: "#8A8F9E" }}>15 free credits — no credit card required.</p>
        <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[16px]"
          style={{ background: "#89E900", color: "#0D0F14" }}>
          Get started free <ArrowRight className="h-5 w-5" />
        </Link>
      </section>
      <WebsiteFooter />
    </div>
  );
}