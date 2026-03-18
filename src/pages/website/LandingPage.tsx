import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, ArrowRight, Check, Star, X, CheckCircle2, XCircle,
  Camera, Layers, Users, Palette, Zap, Shield, ShoppingBag,
  Droplets, Monitor, Sofa, Package, UtensilsCrossed, Menu, ChevronDown, ChevronUp,
} from "lucide-react";
import { PixaLeraIcon } from "@/components/PixaLeraIcon";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const TYPING_PROMPTS = [
  "sneaker on white marble surface, editorial lighting",
  "dress on AI fashion model, downtown NYC background",
  "luxury watch on beach at golden sunset",
  "skincare products flat-lay, minimalist aesthetic",
];

function useTypingAnimation(prompts: string[]) {
  const [text, setText] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const current = prompts[promptIdx];
    if (paused) {
      const t = setTimeout(() => { setPaused(false); setDeleting(true); }, 2200);
      return () => clearTimeout(t);
    }
    if (deleting) {
      if (charIdx === 0) {
        setDeleting(false);
        setPromptIdx((i) => (i + 1) % prompts.length);
        return;
      }
      const t = setTimeout(() => {
        setText(current.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      }, 22);
      return () => clearTimeout(t);
    }
    if (charIdx < current.length) {
      const t = setTimeout(() => {
        setText(current.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, 38);
      return () => clearTimeout(t);
    } else {
      setPaused(true);
    }
  }, [charIdx, deleting, paused, promptIdx, prompts]);

  return text;
}

const BRANDS = ["Shopify", "Amazon", "Flipkart", "Myntra", "Nykaa", "Meesho", "WooCommerce", "Etsy"];

const BEFORE_AFTER = [
  { category: "Fashion", before: "Plain white background, wrinkled fabric, poor lighting", after: "Model wearing it in Manhattan streets, golden hour glow", grad: "from-slate-700 to-slate-900", accentGrad: "from-violet-500/40 to-pink-500/40" },
  { category: "Beauty", before: "Cluttered desk, uneven shadows, no styling", after: "Minimalist flat-lay, marble surface, studio lighting", grad: "from-rose-900 to-slate-900", accentGrad: "from-pink-500/40 to-orange-400/40" },
  { category: "Electronics", before: "Box on table, warehouse background", after: "Floating on gradient, neon reflections, cinematic depth", grad: "from-blue-900 to-slate-900", accentGrad: "from-blue-500/40 to-cyan-400/40" },
  { category: "Jewelry", before: "Blurry close-up, no staging, casual shot", after: "Velvet surface, dramatic rim lighting, luxury aesthetic", grad: "from-amber-900 to-slate-900", accentGrad: "from-yellow-500/40 to-amber-400/40" },
];

const PROBLEMS = [
  { title: "Expensive photoshoots", desc: "$500–$2,000 per session. Studio, equipment, crew, model fees — all adding up." },
  { title: "Slow turnaround", desc: "1–2 weeks from shoot to edited, delivery-ready images. Kills your launch velocity." },
  { title: "Inconsistent quality", desc: "Every photographer has a different style. Maintaining brand consistency is a constant battle." },
  { title: "Limited scalability", desc: "100 SKUs? 10,000 SKUs? Traditional photography can't scale with your catalog." },
];

const SOLUTIONS = [
  { title: "AI-generated from $0.50/image", desc: "Studio-quality results at a fraction of the cost. No crew, no bookings, no overhead." },
  { title: "Results in seconds", desc: "Upload a photo, get professional outputs in under a minute. Ship faster than ever." },
  { title: "Consistent brand aesthetics", desc: "Every image follows your brand style. One style applied uniformly across your entire catalog." },
  { title: "Unlimited at any scale", desc: "Process 1 or 100,000 images. PixaLera scales infinitely with your growth." },
];

const FEATURES = [
  { icon: Camera, title: "AI Background Generation", desc: "Transform plain product photos with AI-generated backgrounds that match your brand — marble, studio, nature, urban, abstract and more.", grad: "from-[#89E900]/20 via-emerald-900/30 to-slate-900" },
  { icon: Layers, title: "Multi-Angle Rendering", desc: "Generate multiple angles and perspectives from a single product photo. Show your product from every angle without a full shoot.", grad: "from-blue-900/50 via-slate-800/40 to-slate-900" },
  { icon: Users, title: "AI Fashion Models", desc: "Place apparel and accessories on realistic AI-generated models of any size, shape, and ethnicity — without hiring a single model.", grad: "from-violet-900/50 via-slate-800/40 to-slate-900" },
  { icon: Palette, title: "Style Variations", desc: "Create multiple style variations from a single photo — lifestyle, editorial, catalog, social — all consistent with your brand.", grad: "from-pink-900/40 via-slate-800/40 to-slate-900" },
  { icon: Zap, title: "Batch Processing", desc: "Process hundreds of product images simultaneously with the same style settings. Go from raw uploads to finished catalog in minutes.", grad: "from-amber-900/40 via-slate-800/40 to-slate-900" },
  { icon: Shield, title: "Brand Consistency", desc: "Save brand presets and apply them to every image instantly. Your entire catalog stays visually cohesive at all times.", grad: "from-cyan-900/40 via-slate-800/40 to-slate-900" },
];

const USE_CASES = [
  { icon: ShoppingBag, title: "Fashion & Apparel", desc: "Models, backdrops, and editorial styles for every clothing category.", grad: "from-violet-600/50 to-purple-900/80" },
  { icon: Droplets, title: "Beauty & Skincare", desc: "Clean flat-lays, lifestyle scenes, and ingredient-focused visuals.", grad: "from-pink-600/50 to-rose-900/80" },
  { icon: Monitor, title: "Electronics", desc: "Cinematic tech photography — floating devices, neon reflections, dark aesthetics.", grad: "from-blue-600/50 to-blue-900/80" },
  { icon: Sofa, title: "Furniture & Home", desc: "Styled room mockups and interior context for any furniture piece.", grad: "from-amber-600/50 to-orange-900/80" },
  { icon: Package, title: "D2C Brands", desc: "Consistent visual identity across all touchpoints — ads, catalog, social.", grad: "from-[#89E900]/40 to-emerald-900/80" },
  { icon: UtensilsCrossed, title: "Food & Beverage", desc: "Mouth-watering food photography and packaging visuals without a food stylist.", grad: "from-red-600/50 to-red-900/80" },
];

const HOW_IT_WORKS = [
  { num: "01", title: "Upload Your Product", desc: "Drop in any product photo — even a simple smartphone shot. No special equipment needed.", grad: "from-[#89E900]/15 to-slate-900" },
  { num: "02", title: "Choose Your Style", desc: "Pick from 50+ templates or describe your vision in plain text. Our AI understands your brand.", grad: "from-blue-900/40 to-slate-900" },
  { num: "03", title: "Generate & Download", desc: "AI generates studio-quality images in seconds. Download, export, and publish instantly.", grad: "from-violet-900/40 to-slate-900" },
];

const COMPARISON = [
  { label: "Cost per image", traditional: "$15–$40", pixalera: "From $0.50" },
  { label: "Turnaround time", traditional: "1–2 weeks", pixalera: "Under 60 seconds" },
  { label: "Scalability", traditional: "Limited by budget", pixalera: "Unlimited" },
  { label: "Consistency", traditional: "Varies by shoot", pixalera: "100% consistent" },
  { label: "Effort required", traditional: "Full production crew", pixalera: "Just upload & click" },
];

const TESTIMONIALS = [
  {
    name: "Rahul Mehta", role: "Founder, StyleKart", avatar: "R",
    quote: "PixaLera cut our photoshoot budget by 80%. We went from waiting 2 weeks for images to publishing same-day. The quality is genuinely indistinguishable from studio shots.",
  },
  {
    name: "Priya Sharma", role: "Head of Marketing, GlowBeauty", avatar: "P",
    quote: "Our CTR doubled after switching to PixaLera-generated images. The AI understands our brand aesthetic perfectly. I use it daily — couldn't run campaigns without it.",
  },
  {
    name: "James O'Brien", role: "E-commerce Director, TechMart UK", avatar: "J",
    quote: "We have 8,000+ SKUs. Traditional photography was impossible to scale. PixaLera processed our entire catalog in a weekend. It's simply unmatched for e-commerce at scale.",
  },
];

const PRICING = [
  {
    name: "Basic", price: "29", desc: "Perfect for solo sellers and small stores.",
    features: ["100 images/month", "5 style presets", "Standard AI model", "720p exports", "Email support"],
    popular: false, cta: "Start Free Trial",
  },
  {
    name: "Pro", price: "79", desc: "Built for growing brands with volume needs.",
    features: ["500 images/month", "Unlimited presets", "Pro AI model", "4K exports", "Batch processing", "Priority support"],
    popular: true, cta: "Start Free Trial",
  },
  {
    name: "Scale", price: "199", desc: "Enterprise-grade for large catalogs.",
    features: ["2000 images/month", "API access", "Custom AI fine-tuning", "4K exports", "Dedicated account manager", "SLA guarantee"],
    popular: false, cta: "Contact Sales",
  },
];

const FAQ = [
  { q: "How good is the image quality?", a: "PixaLera generates images at professional studio quality — indistinguishable from traditional photoshoots. We use state-of-the-art diffusion models fine-tuned specifically for product photography." },
  { q: "Can I process images in bulk?", a: "Yes. Our batch processing feature lets you upload and process hundreds of images at once, applying consistent style settings across your entire catalog." },
  { q: "What file formats are supported?", a: "We support JPEG, PNG, WebP for input. Outputs are available in JPEG, PNG, and WebP at up to 4K resolution depending on your plan." },
  { q: "Is there an API?", a: "Yes — our Scale plan includes full API access, letting you integrate PixaLera directly into your inventory management, CMS, or custom workflows." },
  { q: "Do you offer a satisfaction guarantee?", a: "Absolutely. All plans include a 14-day free trial and if you're not satisfied within 30 days of your first paid billing, we'll refund you in full." },
  { q: "How do I get started?", a: "Sign up, upload one product photo, and you'll have studio-quality results in under a minute — no credit card required for the trial." },
];

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export default function LandingPage() {
  const typedText = useTypingAnimation(TYPING_PROMPTS);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen font-bricolage" style={{ background: "#0D0F14", color: "#E8EAF0" }}>

      {/* ── Global grid pattern ── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40M0 40h40M0 0v40M40 0v40' stroke='%2389E900' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 1 — NAVBAR
      ───────────────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(13,15,20,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <PixaLeraIcon size={30} />
            <span className="text-[16px] font-extrabold tracking-tight" style={{ color: "#E8EAF0" }}>
              Pixa<span style={{ color: "#89E900" }}>Lera</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <button key={l.label} onClick={() => scrollTo(l.href)}
                className="text-[14px] font-medium transition-colors duration-150"
                style={{ color: "#8A8F9E" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#E8EAF0")}
                onMouseLeave={e => (e.currentTarget.style.color = "#8A8F9E")}
              >{l.label}</button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-[14px] font-medium px-4 py-2 rounded-xl transition-colors"
              style={{ color: "#8A8F9E" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#E8EAF0")}
              onMouseLeave={e => (e.currentTarget.style.color = "#8A8F9E")}
            >Log in</Link>
            <Link to="/signup"
              className="text-[14px] font-semibold px-5 py-2.5 rounded-xl transition-all duration-150 flex items-center gap-1.5"
              style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 0 24px rgba(137,233,0,0.2)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px rgba(137,233,0,0.4)"; (e.currentTarget as HTMLElement).style.background = "#9FFF00"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(137,233,0,0.2)"; (e.currentTarget as HTMLElement).style.background = "#89E900"; }}
            >Get Started <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 rounded-lg" style={{ color: "#8A8F9E" }}>
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="border-0 p-0 w-72" style={{ background: "#12141A" }}>
              <div className="p-6 space-y-6">
                <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <PixaLeraIcon size={28} />
                  <span className="font-extrabold text-white">Pixa<span style={{ color: "#89E900" }}>Lera</span></span>
                </Link>
                <div className="space-y-1">
                  {NAV_LINKS.map((l) => (
                    <button key={l.label} onClick={() => scrollTo(l.href)}
                      className="block w-full text-left px-4 py-3 rounded-xl text-[15px] font-medium transition-colors"
                      style={{ color: "#8A8F9E" }}
                    >{l.label}</button>
                  ))}
                </div>
                <div className="space-y-3 pt-4 border-t" style={{ borderColor: "#1E2028" }}>
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="block w-full text-center py-3 rounded-xl text-[14px] font-medium border"
                    style={{ color: "#8A8F9E", borderColor: "#1E2028" }}
                  >Log in</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}
                    className="block w-full text-center py-3 rounded-xl text-[14px] font-semibold"
                    style={{ background: "#89E900", color: "#0D0F14" }}
                  >Get Started</Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 2 — HERO
      ───────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full blur-[140px] pointer-events-none" style={{ background: "rgba(137,233,0,0.06)" }} />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border text-[13px] font-medium"
            style={{ background: "rgba(137,233,0,0.06)", borderColor: "rgba(137,233,0,0.2)", color: "#89E900" }}>
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Product Photography
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
            Your product.{" "}
            <span style={{ color: "#89E900", textShadow: "0 0 60px rgba(137,233,0,0.35)" }}>
              Any scene.
            </span>
            {" "}Instant reality.
          </h1>

          <p className="text-[18px] md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: "#8A8F9E" }}>
            Transform simple product photos into stunning, studio-quality images and marketing creatives — powered by AI, in seconds.
          </p>

          {/* Typing prompt input */}
          <div className="max-w-xl mx-auto mb-4">
            <div className="flex items-center gap-0 rounded-xl border overflow-hidden"
              style={{ background: "#12141A", borderColor: "#1E2028" }}>
              <div className="flex-1 px-5 py-3.5 text-[14px] font-mono text-left min-h-[52px] flex items-center"
                style={{ color: "#8A8F9E" }}>
                <span>{typedText}</span>
                <span className="ml-0.5 inline-block w-0.5 h-4 rounded-sm animate-pulse" style={{ background: "#89E900" }} />
              </div>
              <Link to="/signup"
                className="flex items-center gap-2 px-5 py-3.5 text-[14px] font-semibold whitespace-nowrap transition-all duration-150 m-1.5 rounded-lg"
                style={{ background: "#89E900", color: "#0D0F14" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#9FFF00"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#89E900"}
              >
                <Sparkles className="h-4 w-4" />
                Generate
              </Link>
            </div>
          </div>
          <p className="text-[12px] mb-14" style={{ color: "#8A8F9E" }}>
            No credit card required · 10 free generations · Cancel anytime
          </p>

          {/* Hero visual card */}
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 -z-10 rounded-2xl blur-[60px]" style={{ background: "rgba(137,233,0,0.08)" }} />
            <div className="rounded-2xl border overflow-hidden aspect-video flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #12141A 0%, #1a2200 50%, #0f1800 100%)", borderColor: "#1E2028" }}>
              <div className="flex items-center gap-8 px-12">
                <div className="flex-1 rounded-xl border aspect-square flex items-center justify-center" style={{ background: "rgba(255,255,255,0.03)", borderColor: "#1E2028", maxWidth: 180 }}>
                  <Camera className="h-10 w-10" style={{ color: "#8A8F9E", opacity: 0.3 }} />
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-full flex items-center justify-center animate-pulse-kiwi"
                    style={{ background: "rgba(137,233,0,0.12)", border: "1px solid rgba(137,233,0,0.25)" }}>
                    <Sparkles className="h-6 w-6" style={{ color: "#89E900" }} />
                  </div>
                  <ArrowRight className="h-5 w-5" style={{ color: "#89E900", opacity: 0.6 }} />
                </div>
                <div className="flex-1 rounded-xl border aspect-square flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(137,233,0,0.08), rgba(0,200,100,0.05))", borderColor: "rgba(137,233,0,0.2)", maxWidth: 180 }}>
                  <div className="text-center">
                    <Zap className="h-10 w-10 mx-auto mb-1" style={{ color: "#89E900", opacity: 0.7 }} />
                    <p className="text-[11px] font-semibold" style={{ color: "#89E900" }}>Studio Quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 3 — SOCIAL PROOF BAR
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-5 px-6 border-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-2.5 shrink-0">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#89E900] text-[#89E900]" />)}
            <span className="text-[14px] ml-1" style={{ color: "#8A8F9E" }}>
              Trusted by <strong className="text-white">10,000+</strong> sellers worldwide
            </span>
          </div>

          <div className="relative overflow-hidden flex-1 max-w-lg">
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #0D0F14, transparent)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #0D0F14, transparent)" }} />
            <div className="flex animate-marquee whitespace-nowrap">
              {[...BRANDS, ...BRANDS].map((brand, i) => (
                <span key={i} className="mx-8 text-[13px] font-semibold tracking-widest uppercase"
                  style={{ color: "rgba(138,143,158,0.45)" }}>
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 4 — BEFORE / AFTER
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              See the <span style={{ color: "#89E900" }}>transformation</span>
            </h2>
            <p className="mt-4 text-[16px] max-w-xl mx-auto" style={{ color: "#8A8F9E" }}>
              From raw product photos to stunning, ready-to-publish creatives — across every category.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {BEFORE_AFTER.map((item) => (
              <div key={item.category}
                className="rounded-2xl border overflow-hidden transition-all duration-300 group hover:border-[#89E900]/25"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className={`aspect-video bg-gradient-to-br ${item.grad} relative flex items-center justify-center`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.accentGrad} opacity-60`} />
                  <div className="relative z-10 flex items-center gap-5">
                    <div className="rounded-xl p-5 backdrop-blur-sm" style={{ background: "rgba(13,15,20,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <Camera className="h-8 w-8" style={{ color: "rgba(255,255,255,0.3)" }} />
                    </div>
                    <ArrowRight className="h-5 w-5 opacity-40 text-white" />
                    <div className="rounded-xl p-5 backdrop-blur-sm" style={{ background: "rgba(13,15,20,0.6)", border: "1px solid rgba(137,233,0,0.2)" }}>
                      <Sparkles className="h-8 w-8" style={{ color: "#89E900" }} />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full" style={{ color: "#89E900", background: "rgba(137,233,0,0.1)", border: "1px solid rgba(137,233,0,0.2)" }}>
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x" style={{ borderTop: "1px solid #1E2028", divideColor: "#1E2028" }}>
                  <div className="p-4">
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#8A8F9E" }}>Raw Input</p>
                    <p className="text-[12px] leading-relaxed" style={{ color: "#8A8F9E" }}>{item.before}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#89E900" }}>Pixalera AI</p>
                    <p className="text-[12px] leading-relaxed" style={{ color: "rgba(137,233,0,0.75)" }}>{item.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 5 — PROBLEM → SOLUTION
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">Why <span style={{ color: "#89E900" }}>PixaLera</span> exists</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Problem */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: "#12141A", borderColor: "#1E2028" }}>
              <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ background: "rgba(239,68,68,0.06)", borderColor: "#1E2028" }}>
                <X className="h-5 w-5 text-red-400" />
                <h3 className="font-bold text-red-400">The Problem</h3>
              </div>
              <div className="p-6 space-y-5">
                {PROBLEMS.map((p, i) => (
                  <div key={i} className="flex gap-3.5">
                    <XCircle className="h-5 w-5 text-red-500/70 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[14px] font-semibold text-white/85">{p.title}</p>
                      <p className="text-[13px] mt-0.5 leading-relaxed" style={{ color: "#8A8F9E" }}>{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Solution */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: "#12141A", borderColor: "rgba(137,233,0,0.15)" }}>
              <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ background: "rgba(137,233,0,0.06)", borderColor: "rgba(137,233,0,0.12)" }}>
                <CheckCircle2 className="h-5 w-5" style={{ color: "#89E900" }} />
                <h3 className="font-bold" style={{ color: "#89E900" }}>The PixaLera Solution</h3>
              </div>
              <div className="p-6 space-y-5">
                {SOLUTIONS.map((s, i) => (
                  <div key={i} className="flex gap-3.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#89E900" }} />
                    <div>
                      <p className="text-[14px] font-semibold text-white/85">{s.title}</p>
                      <p className="text-[13px] mt-0.5 leading-relaxed" style={{ color: "#8A8F9E" }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 6 — FEATURES
      ───────────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Everything you need to <span style={{ color: "#89E900" }}>scale visuals</span>
            </h2>
          </div>
          <div className="space-y-5">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className="rounded-2xl border overflow-hidden flex flex-col md:flex-row transition-all duration-300 group hover:border-[#89E900]/20"
                style={{ background: "#12141A", borderColor: "#1E2028", flexDirection: i % 2 === 0 ? "row" : "row-reverse" as any }}>
                <div className={`flex-1 aspect-[4/3] md:max-w-[40%] bg-gradient-to-br ${f.grad} flex items-center justify-center`}>
                  <f.icon className="h-14 w-14 transition-transform duration-300 group-hover:scale-110" style={{ color: "#89E900", opacity: 0.7 }} />
                </div>
                <div className="flex-1 p-8 flex flex-col justify-center">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(137,233,0,0.08)", border: "1px solid rgba(137,233,0,0.15)" }}>
                    <f.icon className="h-5 w-5" style={{ color: "#89E900" }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: "#8A8F9E" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 7 — USE CASES
      ───────────────────────────────────────────────────────────────────── */}
      <section id="use-cases" className="py-24 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Built for <span style={{ color: "#89E900" }}>every industry</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {USE_CASES.map((u) => (
              <div key={u.title}
                className="rounded-2xl border overflow-hidden group cursor-pointer transition-all duration-300 hover:border-[#89E900]/30"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className={`aspect-[4/3] bg-gradient-to-br ${u.grad} flex items-center justify-center relative overflow-hidden`}>
                  <u.icon className="h-12 w-12 text-white/30 transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12141A] to-transparent opacity-60" />
                </div>
                <div className="p-5">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "rgba(137,233,0,0.08)", border: "1px solid rgba(137,233,0,0.12)" }}>
                    <u.icon className="h-4.5 w-4.5" style={{ color: "#89E900" }} />
                  </div>
                  <h3 className="text-[15px] font-bold text-white mb-1.5">{u.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#8A8F9E" }}>{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 8 — HOW IT WORKS
      ───────────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              How it <span style={{ color: "#89E900" }}>works</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.num} className="rounded-2xl border overflow-hidden" style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className={`aspect-[4/3] bg-gradient-to-br ${step.grad} flex items-center justify-center`}>
                  <span className="text-7xl font-extrabold select-none" style={{ color: "rgba(137,233,0,0.2)" }}>{step.num}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-[17px] font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#8A8F9E" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 9 — COMPARISON TABLE
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Why choose <span style={{ color: "#89E900" }}>PixaLera</span>?
            </h2>
          </div>
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#1E2028" }}>
            <div className="grid grid-cols-3">
              <div className="p-4 border-b border-r" style={{ borderColor: "#1E2028", background: "#0D0F14" }} />
              <div className="p-4 border-b border-r text-center" style={{ borderColor: "#1E2028", background: "rgba(255,255,255,0.02)" }}>
                <p className="text-[13px] font-bold" style={{ color: "#8A8F9E" }}>Traditional Studio</p>
              </div>
              <div className="p-4 border-b text-center" style={{ borderColor: "#1E2028", background: "rgba(137,233,0,0.05)" }}>
                <p className="text-[13px] font-bold" style={{ color: "#89E900" }}>PixaLera AI</p>
              </div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={row.label} className="grid grid-cols-3" style={{ background: i % 2 === 0 ? "#12141A" : "#0F1117" }}>
                <div className="p-4 border-r text-[13px] font-medium text-white/70" style={{ borderColor: "#1E2028" }}>{row.label}</div>
                <div className="p-4 border-r text-center text-[13px]" style={{ borderColor: "#1E2028", color: "#8A8F9E" }}>{row.traditional}</div>
                <div className="p-4 text-center text-[13px] font-bold" style={{ color: "#89E900" }}>{row.pixalera}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 10 — TESTIMONIALS
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Loved by <span style={{ color: "#89E900" }}>sellers worldwide</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-300 hover:border-[#89E900]/20"
                style={{ background: "rgba(18,20,26,0.5)", borderColor: "#1E2028", backdropFilter: "blur(8px)" }}>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#89E900] text-[#89E900]" />)}
                </div>
                <p className="text-[13px] leading-relaxed flex-1" style={{ color: "#8A8F9E" }}>"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0" style={{ background: "#89E900", color: "#0D0F14" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white/85">{t.name}</p>
                    <p className="text-[11px]" style={{ color: "#8A8F9E" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 11 — PRICING
      ───────────────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Simple, transparent <span style={{ color: "#89E900" }}>pricing</span>
            </h2>
          </div>
          <p className="text-center text-[15px] mb-14" style={{ color: "#8A8F9E" }}>
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="grid md:grid-cols-3 gap-5 items-start">
            {PRICING.map((plan) => (
              <div key={plan.name}
                className={`rounded-2xl border p-7 flex flex-col transition-all duration-300 ${plan.popular ? "md:scale-105" : ""}`}
                style={{
                  background: "#12141A",
                  borderColor: plan.popular ? "rgba(137,233,0,0.35)" : "#1E2028",
                  boxShadow: plan.popular ? "0 0 40px rgba(137,233,0,0.08)" : "none",
                }}>
                {plan.popular && (
                  <div className="mb-4">
                    <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full" style={{ background: "rgba(137,233,0,0.12)", color: "#89E900" }}>
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-[18px] font-bold text-white">{plan.name}</h3>
                <div className="mt-3 mb-2 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white tabular-nums">${plan.price}</span>
                  <span className="text-[14px] mb-1" style={{ color: "#8A8F9E" }}>/month</span>
                </div>
                <p className="text-[13px] mb-6" style={{ color: "#8A8F9E" }}>{plan.desc}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[13px]" style={{ color: "#8A8F9E" }}>
                      <Check className="h-4 w-4 shrink-0" style={{ color: plan.popular ? "#89E900" : "#8A8F9E" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup"
                  className="block text-center py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-150"
                  style={plan.popular
                    ? { background: "#89E900", color: "#0D0F14", boxShadow: "0 0 24px rgba(137,233,0,0.2)" }
                    : { background: "transparent", color: "#E8EAF0", border: "1px solid #1E2028" }
                  }
                  onMouseEnter={e => plan.popular && ((e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px rgba(137,233,0,0.4)")}
                  onMouseLeave={e => plan.popular && ((e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(137,233,0,0.2)")}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 12 — FAQ
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Frequently asked <span style={{ color: "#89E900" }}>questions</span>
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-0">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-0 border-b" style={{ borderColor: "#1E2028" }}>
                <AccordionTrigger className="py-5 text-[15px] font-semibold text-left text-white/85 hover:text-white hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[14px] leading-relaxed" style={{ color: "#8A8F9E" }}>
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 13 — FINAL CTA
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 text-center relative overflow-hidden" style={{ background: "#0A0C11" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full blur-[160px] pointer-events-none" style={{ background: "rgba(137,233,0,0.06)" }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            Ready to transform your <span style={{ color: "#89E900" }}>product visuals</span>?
          </h2>
          <p className="text-[17px] mb-10" style={{ color: "#8A8F9E" }}>
            Join 10,000+ sellers generating studio-quality product images with AI. Start free — no credit card needed.
          </p>
          <Link to="/signup"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-[16px] font-bold transition-all duration-150 animate-pulse-kiwi"
            style={{ background: "#89E900", color: "#0D0F14" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#9FFF00"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#89E900"; }}
          >
            Start Free Trial <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-[12px]" style={{ color: "#8A8F9E" }}>No credit card required · 10 free generations</p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 14 — FOOTER
      ───────────────────────────────────────────────────────────────────── */}
      <footer className="py-14 px-6 border-t" style={{ borderColor: "#1E2028" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <PixaLeraIcon size={28} />
                <span className="font-extrabold text-white text-[16px]">Pixa<span style={{ color: "#89E900" }}>Lera</span></span>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: "#8A8F9E" }}>
                AI-powered product photography for e-commerce sellers worldwide.
              </p>
            </div>
            {[
              { heading: "Product", links: ["Features", "Use Cases", "Pricing", "Changelog"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { heading: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"] },
            ].map((col) => (
              <div key={col.heading}>
                <p className="text-[13px] font-bold text-white/70 mb-4 uppercase tracking-wider">{col.heading}</p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-[13px] cursor-pointer transition-colors" style={{ color: "#8A8F9E" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#E8EAF0")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#8A8F9E")}
                      >{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t text-center text-[12px]" style={{ borderColor: "#1E2028", color: "#8A8F9E" }}>
            © 2026 PixaLera. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
