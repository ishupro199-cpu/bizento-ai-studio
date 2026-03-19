import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Camera, Layers, Users, Palette,
  Zap, Shield, LayoutGrid, Clapperboard, Megaphone, Check,
  ChevronRight, Star,
} from "lucide-react";
import { WebsiteNav } from "@/components/website/WebsiteNav";
import { WebsiteFooter } from "@/components/website/WebsiteFooter";

const TOOLS = [
  {
    id: "catalog",
    icon: LayoutGrid,
    title: "Catalog Generator",
    tagline: "Professional catalog shots — automatically.",
    desc: "Turn raw product images into flawless ecommerce catalog photos. White backgrounds, clean shadows, consistent angles — all in seconds.",
    bullets: ["Auto-remove backgrounds", "Studio-lighting simulation", "Multi-angle output", "Consistent style across SKUs"],
    image: "/hero-product.png",
    color: "#89E900",
  },
  {
    id: "photo",
    icon: Camera,
    title: "Product Photography",
    tagline: "Studio quality. Zero setup.",
    desc: "Generate lifestyle product photography with AI — place your product in any scene, season, or setting without renting a studio.",
    bullets: ["50+ scene templates", "Custom background prompts", "Natural lighting simulation", "Seasonal campaign visuals"],
    image: "/gen-beauty-product.png",
    color: "#3B82F6",
  },
  {
    id: "cinematic",
    icon: Clapperboard,
    title: "Cinematic Ads",
    tagline: "CGI-level quality. In seconds.",
    desc: "Create jaw-dropping cinematic product advertisements — dramatic lighting, 3D effects, and motion-ready compositions that stop the scroll.",
    bullets: ["CGI-style rendering", "Dramatic lighting presets", "Brand color integration", "Platform-ready exports"],
    image: "/gen-tech-product.png",
    color: "#8B5CF6",
  },
  {
    id: "creative",
    icon: Megaphone,
    title: "Ad Creatives",
    tagline: "Scroll-stopping social ads — instantly.",
    desc: "Design high-converting social media ad creatives. Optimized layouts for Instagram, TikTok, Facebook, YouTube, and more.",
    bullets: ["Platform-sized exports", "CTA text overlays", "A/B variant generation", "Brand kit integration"],
    image: "/gen-fashion-product.png",
    color: "#F59E0B",
  },
];

const CAPABILITIES = [
  { icon: Camera, title: "AI Background Generation", desc: "Marble, studio, nature, urban, abstract — any backdrop your brand needs, generated on demand." },
  { icon: Layers, title: "Multi-Angle Rendering", desc: "Show your product from every angle without a full photoshoot. Generate front, side, top, and detail shots from a single image." },
  { icon: Users, title: "AI Fashion Models", desc: "Place apparel on realistic AI-generated models of any size, shape, and ethnicity — without hiring anyone." },
  { icon: Palette, title: "Style Variations", desc: "Create editorial, lifestyle, catalog, and social variations from a single product photo. Your catalog stays visually cohesive." },
  { icon: Zap, title: "Batch Processing", desc: "Process hundreds of product images simultaneously with the same style settings. Publish entire catalogs in minutes, not weeks." },
  { icon: Shield, title: "Brand Presets", desc: "Save and reuse brand style presets. Apply your exact visual identity to every image with a single click." },
];

const COMPARE_ROWS = [
  { feature: "Turnaround time", traditional: "2–3 weeks", pixalera: "Under 1 minute" },
  { feature: "Cost per image", traditional: "₹500–₹5,000", pixalera: "From ₹2–₹10" },
  { feature: "Min. order quantity", traditional: "Usually 50+", pixalera: "1 image" },
  { feature: "Reshooting needed", traditional: "Yes — expensive", pixalera: "One click" },
  { feature: "Brand consistency", traditional: "Hard to maintain", pixalera: "Guaranteed with presets" },
  { feature: "Scalability", traditional: "Bottlenecked", pixalera: "Unlimited" },
];

const TESTIMONIALS = [
  { name: "Arjun Patel", role: "Founder, WearLab", avatar: "A", quote: "We cut our photoshoot budget by 80% and our catalog looks better than ever. Pixalera AI is a no-brainer for any ecommerce brand." },
  { name: "Sneha Kapoor", role: "CMO, PureGlow", avatar: "S", quote: "Our Instagram content went from average to stunning. The AI understands our aesthetic perfectly. We produce 5x more content now." },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen font-bricolage" style={{ background: "#0D0F14", color: "#E8EAF0" }}>
      <WebsiteNav />

      {/* ── HERO ── */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <img src="/hero-studio-bg.png" alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          style={{ opacity: 0.3 }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(10,11,15,0.7) 0%, rgba(10,11,15,0.5) 50%, rgba(10,11,15,0.85) 100%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(137,233,0,0.07) 0%, transparent 70%)" }} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border text-[13px] font-medium"
            style={{ background: "rgba(137,233,0,0.07)", borderColor: "rgba(137,233,0,0.25)", color: "#89E900" }}>
            <Sparkles className="h-3.5 w-3.5" />
            Full Feature Suite
          </div>
          <h1 className="text-5xl md:text-[64px] font-extrabold leading-tight tracking-tight mb-6">
            AI tools built for
            <br /><span style={{ color: "#89E900" }}>ecommerce sellers</span>
          </h1>
          <p className="text-[17px] max-w-2xl mx-auto mb-10" style={{ color: "#8A8F9E" }}>
            Four powerful creative tools — backed by the most advanced AI models — to help you create studio-quality visuals at any scale.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/signup"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[15px] font-bold transition-all"
              style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 0 30px rgba(137,233,0,0.25)" }}>
              <Sparkles className="h-4 w-4" /> Start Free
            </Link>
            <Link to="/pricing"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[15px] font-medium border hover:border-white/20 hover:text-white transition-all"
              style={{ color: "#8A8F9E", borderColor: "#1E2028" }}>
              View Pricing <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TOOLS ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          {TOOLS.map((tool, idx) => (
            <div key={tool.id}
              className={`flex flex-col ${idx % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-12 items-center`}>
              {/* Image */}
              <div className="flex-1 rounded-2xl overflow-hidden border" style={{ borderColor: "#1E2028" }}>
                <img src={tool.image} alt={tool.title} className="w-full aspect-[4/3] object-cover" />
              </div>
              {/* Content */}
              <div className="flex-1 space-y-5">
                <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
                  style={{ background: `${tool.color}15`, border: `1px solid ${tool.color}30`, color: tool.color }}>
                  <tool.icon className="h-3.5 w-3.5" />
                  {tool.title}
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">{tool.tagline}</h2>
                <p className="text-[16px] leading-relaxed" style={{ color: "#8A8F9E" }}>{tool.desc}</p>
                <ul className="space-y-2.5">
                  {tool.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-[14px]">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${tool.color}15` }}>
                        <Check className="h-3 w-3" style={{ color: tool.color }} />
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link to="/signup"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold mt-2 transition-colors hover:opacity-80"
                  style={{ color: tool.color }}>
                  Try it free <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section className="py-24 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold">Core capabilities</h2>
            <p className="mt-4 text-[16px]" style={{ color: "#8A8F9E" }}>Powering every tool under the hood.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map((cap) => (
              <div key={cap.title}
                className="rounded-2xl border p-5 hover:border-[#89E900]/20 transition-all"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(137,233,0,0.1)", border: "1px solid rgba(137,233,0,0.2)" }}>
                  <cap.icon className="h-5 w-5" style={{ color: "#89E900" }} />
                </div>
                <h3 className="text-[16px] font-bold mb-2">{cap.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "#8A8F9E" }}>{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold">
              Traditional shoot vs. <span style={{ color: "#89E900" }}>Pixalera AI</span>
            </h2>
          </div>
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#1E2028" }}>
            <div className="grid grid-cols-3 text-center" style={{ background: "#12141A" }}>
              <div className="py-4 px-4 text-[13px] font-bold" style={{ color: "#8A8F9E", borderRight: "1px solid #1E2028" }}>Feature</div>
              <div className="py-4 px-4 text-[13px] font-bold" style={{ color: "#8A8F9E", borderRight: "1px solid #1E2028" }}>Traditional Shoot</div>
              <div className="py-4 px-4 text-[13px] font-bold" style={{ color: "#89E900" }}>Pixalera AI</div>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div key={row.feature}
                className="grid grid-cols-3 text-center border-t"
                style={{ borderColor: "#1E2028", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                <div className="py-3.5 px-4 text-[13px] font-medium text-left" style={{ borderRight: "1px solid #1E2028" }}>{row.feature}</div>
                <div className="py-3.5 px-4 text-[13px]" style={{ color: "#8A8F9E", borderRight: "1px solid #1E2028" }}>{row.traditional}</div>
                <div className="py-3.5 px-4 text-[13px] font-semibold" style={{ color: "#89E900" }}>{row.pixalera}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold">What our users say</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="rounded-2xl border p-6 space-y-4 hover:border-[#89E900]/20 transition-all"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#89E900] text-[#89E900]" />)}
                </div>
                <p className="text-[14px] leading-relaxed italic" style={{ color: "rgba(200,205,215,0.75)" }}>"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0" style={{ background: "#89E900" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold">{t.name}</p>
                    <p className="text-[11px]" style={{ color: "#8A8F9E" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-2xl border py-14 px-8"
          style={{ background: "linear-gradient(135deg, rgba(137,233,0,0.05) 0%, rgba(137,233,0,0.02) 100%)", borderColor: "rgba(137,233,0,0.15)" }}>
          <h2 className="text-4xl font-extrabold mb-4">Ready to transform your catalog?</h2>
          <p className="text-[16px] mb-8" style={{ color: "#8A8F9E" }}>Start free with 15 credits. No credit card required.</p>
          <Link to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-[15px] font-bold transition-all"
            style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 4px 24px rgba(137,233,0,0.3)" }}>
            <Sparkles className="h-4 w-4" /> Get Started Free
          </Link>
        </div>
      </section>

      <WebsiteFooter />
    </div>
  );
}
