import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, ArrowRight, Check, Star, X,
  Camera, Layers, Users, Palette, Zap, Shield, ShoppingBag,
  Droplets, Monitor, Sofa, Package, UtensilsCrossed, Menu,
  ChevronRight, Twitter, Instagram, Youtube,
  Settings, LogOut, LayoutGrid, Clapperboard, Megaphone,
  ChevronDown, Send, Mail,
} from "lucide-react";
import { BizentoIcon } from "@/components/BizentoIcon";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TYPING_PROMPTS = [
  "sneaker on white marble surface, editorial lighting",
  "luxury watch on beach at golden sunset",
  "skincare products flat-lay, minimalist aesthetic",
  "dress on AI fashion model, downtown NYC background",
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
      if (charIdx === 0) { setDeleting(false); setPromptIdx((i) => (i + 1) % prompts.length); return; }
      const t = setTimeout(() => { setText(current.slice(0, charIdx - 1)); setCharIdx((c) => c - 1); }, 22);
      return () => clearTimeout(t);
    }
    if (charIdx < current.length) {
      const t = setTimeout(() => { setText(current.slice(0, charIdx + 1)); setCharIdx((c) => c + 1); }, 38);
      return () => clearTimeout(t);
    } else { setPaused(true); }
  }, [charIdx, deleting, paused, promptIdx, prompts]);

  return text;
}

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
];

const BEFORE_AFTER = [
  { category: "Fashion", before: "Plain white background, wrinkled fabric, poor lighting", after: "Model wearing it in Manhattan streets, golden hour glow", image: "/gen-fashion-product.png" },
  { category: "Beauty", before: "Cluttered desk, uneven shadows, no styling", after: "Minimalist flat-lay, marble surface, studio lighting", image: "/gen-beauty-product.png" },
  { category: "Electronics", before: "Box on table, warehouse background", after: "Floating on gradient, neon reflections, cinematic depth", image: "/gen-tech-product.png" },
  { category: "Fragrance", before: "Blurry close-up, no staging, casual shot", after: "Marble platform, dramatic studio lighting, luxury aesthetic", image: "/hero-product.png" },
];

const FEATURES = [
  { icon: Camera, title: "AI Background Generation", desc: "Transform plain product photos with AI-generated backgrounds — marble, studio, nature, urban, abstract and more.", image: "/gen-beauty-product.png" },
  { icon: Layers, title: "Multi-Angle Rendering", desc: "Generate multiple angles and perspectives from a single product photo, without a full photoshoot.", image: "/hero-product.png" },
  { icon: Users, title: "AI Fashion Models", desc: "Place apparel on realistic AI-generated models of any size, shape, and ethnicity — instantly.", image: "/gen-fashion-product.png" },
  { icon: Palette, title: "Style Variations", desc: "Create lifestyle, editorial, catalog, and social variations — all consistent with your brand.", image: "/gen-tech-product.png" },
  { icon: Zap, title: "Batch Processing", desc: "Process hundreds of product images simultaneously. Go from raw uploads to finished catalog in minutes.", image: "/gen-beauty-product.png" },
  { icon: Shield, title: "Brand Consistency", desc: "Save brand presets and apply them to every image instantly. Your catalog stays cohesive.", image: "/gen-fashion-product.png" },
];

const USE_CASES = [
  {
    icon: ShoppingBag,
    title: "Fashion & Apparel",
    desc: "Dress your products on AI models, in lifestyle backdrops, and editorial scenes — across every clothing category.",
    gradient: "linear-gradient(135deg, #1a0a2e 0%, #2d1a4a 50%, #3d1f5c 100%)",
    accent: "#c084fc",
    tag: "Most popular",
    stat: "5× faster to market",
  },
  {
    icon: Droplets,
    title: "Beauty & Skincare",
    desc: "Marble flat-lays, ingredient spotlights, and lifestyle imagery that sells your products' essence instantly.",
    gradient: "linear-gradient(135deg, #0a1a2e 0%, #0e2d44 50%, #0f3352 100%)",
    accent: "#38bdf8",
    tag: "Highest CTR",
    stat: "2× conversion uplift",
  },
  {
    icon: Monitor,
    title: "Electronics & Tech",
    desc: "Cinematic floating devices, neon reflections, and dark-mode aesthetics that look CGI-rendered.",
    gradient: "linear-gradient(135deg, #0a1a0a 0%, #0d2d15 50%, #0e3318 100%)",
    accent: "#89E900",
    tag: "CGI-quality",
    stat: "80% cost savings",
  },
  {
    icon: Sofa,
    title: "Furniture & Home",
    desc: "Styled room mockups, interior context shots, and on-model placement for any furniture or décor piece.",
    gradient: "linear-gradient(135deg, #1a1000 0%, #2d1f00 50%, #3d2a00 100%)",
    accent: "#f59e0b",
    tag: "Scene-ready",
    stat: "3× more engagement",
  },
  {
    icon: Package,
    title: "D2C Brands",
    desc: "Consistent visual identity across every touchpoint — ads, catalogs, social, and packaging — in minutes.",
    gradient: "linear-gradient(135deg, #1a0a0a 0%, #2d1010 50%, #3d1515 100%)",
    accent: "#f87171",
    tag: "Brand-consistent",
    stat: "10× content velocity",
  },
  {
    icon: UtensilsCrossed,
    title: "Food & Beverage",
    desc: "Mouth-watering food styling and packaging visuals that drive appetite and shelf appeal — no food stylist needed.",
    gradient: "linear-gradient(135deg, #0f1a0a 0%, #192d10 50%, #1e3812 100%)",
    accent: "#4ade80",
    tag: "Appetite-driving",
    stat: "4× social shares",
  },
];

const HOW_IT_WORKS = [
  { num: "01", title: "Upload Your Product", desc: "Drop in any product photo — even a simple smartphone shot. No special equipment needed.", color: "#89E900" },
  { num: "02", title: "Choose Your Style", desc: "Pick from 50+ templates or describe your vision in plain text. Our AI understands your brand.", color: "#3B82F6" },
  { num: "03", title: "Generate & Download", desc: "AI generates studio-quality images in seconds. Download, export, and publish instantly.", color: "#8B5CF6" },
];

const TESTIMONIALS = [
  { name: "Rahul Mehta", role: "Founder, StyleKart", avatar: "R", quote: "Pixalera cut our photoshoot budget by 80%. We went from waiting 2 weeks for images to publishing same-day. The quality is genuinely indistinguishable from studio shots." },
  { name: "Priya Sharma", role: "Head of Marketing, GlowBeauty", avatar: "P", quote: "Our CTR doubled after switching to Pixalera-generated images. The AI understands our brand aesthetic perfectly. I couldn't run campaigns without it." },
  { name: "James O'Brien", role: "E-commerce Director, TechMart UK", avatar: "J", quote: "We have 8,000+ SKUs. Pixalera processed our entire catalog in a weekend. The results are stunning and perfectly consistent." },
];

const FAQ = [
  { q: "How good is the image quality?", a: "Pixalera generates images at professional studio quality — indistinguishable from traditional photoshoots. We use state-of-the-art diffusion models fine-tuned specifically for product photography." },
  { q: "Can I process images in bulk?", a: "Yes. Our batch processing feature lets you upload and process hundreds of images at once, applying consistent style settings across your entire catalog." },
  { q: "What file formats are supported?", a: "We support JPEG, PNG, WebP for input. Outputs are available in JPEG, PNG, and WebP at up to 4K resolution depending on your plan." },
  { q: "Is there an API?", a: "Yes — our Pro plan includes API access, letting you integrate Pixalera directly into your inventory management, CMS, or custom workflows." },
  { q: "Do you offer a satisfaction guarantee?", a: "Absolutely. All paid plans include a 14-day satisfaction guarantee. If you're not happy, we'll refund you in full." },
  { q: "How do I get started?", a: "Sign up free — 15 credits on us, no credit card required. Upload a product photo and you'll have studio-quality results in under a minute." },
];

const SOCIAL_LINKS = [
  { icon: Twitter, href: "#", label: "X (Twitter)" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

const FOOTER_COLS = {
  Product: ["Features", "Pricing", "Demo", "How It Works"],
  Tools: ["Catalog Generator", "Product Photography", "Cinematic Ads", "Ad Creatives"],
  Resources: ["Help Center", "Guides", "Blog"],
  Legal: ["Privacy Policy", "Terms & Conditions", "Refund Policy", "Cookies Policy"],
};

function ProfileDropdown({ user, onClose }: { user: any; onClose: () => void }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const initials = (user.displayName || user.email || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    onClose();
    await signOut();
    navigate("/");
  };

  return (
    <div className="absolute right-0 top-11 w-56 rounded-2xl border border-white/10 shadow-2xl py-2 z-50"
      style={{ background: "rgba(20,22,28,0.97)", backdropFilter: "blur(28px)" }}>
      <div className="px-4 py-3 border-b border-white/8 mb-1">
        <p className="text-[13px] font-semibold text-white truncate">{user.displayName || "User"}</p>
        {user.email && <p className="text-[11px] text-white/35 truncate mt-0.5">{user.email}</p>}
      </div>
      <button onClick={() => { onClose(); navigate("/app"); }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/65 hover:bg-white/5 hover:text-white transition-colors">
        <LayoutGrid className="h-4 w-4 shrink-0" /> Go to Dashboard
      </button>
      <button onClick={() => { onClose(); navigate("/app/settings"); }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/65 hover:bg-white/5 hover:text-white transition-colors">
        <Settings className="h-4 w-4 shrink-0" /> Settings
      </button>
      <div className="h-px bg-white/8 my-1 mx-3" />
      <button onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/45 hover:bg-red-500/10 hover:text-red-400 transition-colors">
        <LogOut className="h-4 w-4 shrink-0" /> Log out
      </button>
    </div>
  );
}

export default function LandingPage() {
  const typedText = useTypingAnimation(TYPING_PROMPTS);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [email, setEmail] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const scrollTo = (href: string) => {
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
    }
    setMobileOpen(false);
  };

  const handleGenerate = () => {
    if (!user) { navigate("/signup"); return; }
    navigate("/app");
  };

  const initials = user
    ? (user.displayName || user.email || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  return (
    <div className="min-h-screen font-bricolage" style={{ background: "#0D0F14", color: "#E8EAF0" }}>

      {/* Subtle grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40M0 40h40M0 0v40M40 0v40' stroke='%2389E900' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(13,15,20,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: `1px solid rgba(255,255,255,${scrolled ? 0.06 : 0})`,
        }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2.5">
            <BizentoIcon size={32} />
            <span className="text-[17px] font-black tracking-tight" style={{ color: "#F0EBD8", letterSpacing: "-0.02em" }}>
              Pixalera<span style={{ color: "#89E900" }}>.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <button key={l.label} onClick={() => scrollTo(l.href)}
                className="text-[14px] font-medium transition-colors duration-150 hover:text-white"
                style={{ color: "#8A8F9E" }}>
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!loading && user ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all">
                  <Avatar className="h-8 w-8 ring-2 ring-[#89E900]/30">
                    {user.photoURL && <AvatarImage src={user.photoURL} referrerPolicy="no-referrer" />}
                    <AvatarFallback className="bg-[#89E900]/15 text-[#89E900] text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className={`h-3.5 w-3.5 text-white/30 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                {profileOpen && <ProfileDropdown user={user} onClose={() => setProfileOpen(false)} />}
              </div>
            ) : (
              <>
                <Link to="/login"
                  className="text-[14px] font-medium px-4 py-2 rounded-xl hover:text-white transition-colors"
                  style={{ color: "#8A8F9E" }}>
                  Log in
                </Link>
                <Link to="/signup"
                  className="text-[14px] font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
                  style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 0 24px rgba(137,233,0,0.2)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#9FFF00"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#89E900"; }}>
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 rounded-lg hover:bg-white/5" style={{ color: "#8A8F9E" }}>
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="border-0 p-0 w-72" style={{ background: "#12141A" }}>
              <div className="p-6 space-y-6">
                <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <BizentoIcon size={28} />
                  <span className="font-black text-[16px]" style={{ color: "#F0EBD8" }}>
                    Pixalera<span style={{ color: "#89E900" }}>.</span>
                  </span>
                </Link>
                <div className="space-y-1">
                  {NAV_LINKS.map((l) => (
                    <button key={l.label} onClick={() => scrollTo(l.href)}
                      className="block w-full text-left px-4 py-3 rounded-xl text-[15px] font-medium hover:text-white transition-colors"
                      style={{ color: "#8A8F9E" }}>{l.label}</button>
                  ))}
                </div>
                <div className="space-y-3 pt-4 border-t" style={{ borderColor: "#1E2028" }}>
                  {user ? (
                    <Link to="/app" onClick={() => setMobileOpen(false)}
                      className="block w-full text-center py-3 rounded-xl text-[14px] font-semibold"
                      style={{ background: "#89E900", color: "#0D0F14" }}>
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMobileOpen(false)}
                        className="block w-full text-center py-3 rounded-xl text-[14px] font-medium border"
                        style={{ color: "#8A8F9E", borderColor: "#1E2028" }}>
                        Log in
                      </Link>
                      <Link to="/signup" onClick={() => setMobileOpen(false)}
                        className="block w-full text-center py-3 rounded-xl text-[14px] font-semibold"
                        style={{ background: "#89E900", color: "#0D0F14" }}>
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <img src="/hero-studio-bg.png" alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          style={{ opacity: 0.85 }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(10,11,15,0.55) 0%, rgba(10,11,15,0.25) 50%, rgba(10,11,15,0.72) 100%)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to right, rgba(10,11,15,0.4) 0%, transparent 60%, rgba(10,11,15,0.2) 100%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: 700, height: 700, background: "radial-gradient(circle, rgba(137,233,0,0.07) 0%, transparent 70%)" }} />
        <img src="/hero-perfume-bottle.png" alt="AI product photography"
          className="absolute pointer-events-none hidden md:block"
          style={{ bottom: "-2%", right: "-2%", width: "38%", maxWidth: 480, objectFit: "contain", zIndex: 5, filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.7))" }} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-28 pb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border text-[13px] font-medium"
            style={{ background: "rgba(137,233,0,0.07)", borderColor: "rgba(137,233,0,0.25)", color: "#89E900", backdropFilter: "blur(8px)" }}>
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Creative Platform
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-[72px] font-extrabold leading-[1.0] tracking-tight mb-6 text-white">
            Your product.{" "}
            <span style={{ color: "#89E900", textShadow: "0 0 80px rgba(137,233,0,0.5)" }}>Any scene.</span>
            <br />Instant reality.
          </h1>

          <p className="text-[17px] md:text-[18px] leading-relaxed mb-10 max-w-2xl" style={{ color: "rgba(200,205,215,0.85)" }}>
            Transform simple product photos into stunning, studio-quality images
            <br className="hidden sm:block" /> and marketing creatives — powered by AI, in seconds.
          </p>

          {/* ── Prompt box + CTA row ── */}
          <div className="flex items-center gap-3 max-w-[780px]">
            {/* Prompt box */}
            <div
              className="flex-1 flex items-center gap-3 rounded-2xl transition-all duration-150"
              style={{
                background: "rgba(16,18,24,0.88)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(16px)",
                padding: "12px 14px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <input
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleGenerate(); }}
                placeholder={typedText || "Describe your product scene..."}
                className="flex-1 bg-transparent text-[14px] text-white placeholder-white/30 outline-none min-w-0"
              />
              <button
                onClick={handleGenerate}
                className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl transition-all duration-150 hover:scale-105 active:scale-95"
                style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 0 16px rgba(137,233,0,0.3)" }}
                title="Generate"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* CTA buttons — outside prompt box, right side */}
            <Link to="/signup"
              className="shrink-0 flex items-center gap-1.5 px-5 py-3.5 rounded-2xl text-[14px] font-semibold whitespace-nowrap transition-all duration-150"
              style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 0 20px rgba(137,233,0,0.25)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#9FFF00"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#89E900"; }}>
              Get Started
            </Link>
            <Link to="/features"
              className="shrink-0 flex items-center gap-1.5 px-5 py-3.5 rounded-2xl text-[14px] font-medium whitespace-nowrap border transition-all duration-150 hover:border-white/20 hover:text-white"
              style={{ color: "#8A8F9E", borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
              Demo
            </Link>
          </div>

          <p className="text-[11px] mt-3" style={{ color: "rgba(138,143,158,0.5)" }}>
            No credit card required · 15 free credits · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
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
                <div className="aspect-video relative overflow-hidden">
                  <img src={item.image} alt={item.category}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,20,26,0.85) 0%, transparent 50%)" }} />
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                      style={{ color: "#89E900", background: "rgba(137,233,0,0.1)", border: "1px solid rgba(137,233,0,0.2)" }}>
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                      style={{ background: "rgba(137,233,0,0.15)", color: "#89E900", border: "1px solid rgba(137,233,0,0.25)" }}>
                      AI Generated
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x" style={{ borderTop: "1px solid #1E2028", borderColor: "#1E2028" }}>
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

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold">How it works</h2>
            <p className="mt-4 text-[16px]" style={{ color: "#8A8F9E" }}>Three steps to studio-quality product visuals.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.num} className="rounded-2xl border p-6 hover:border-[rgba(137,233,0,0.2)] transition-all"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className="text-[40px] font-extrabold mb-4 leading-none" style={{ color: step.color, opacity: 0.6 }}>{step.num}</div>
                <h3 className="text-[18px] font-bold mb-2">{step.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "#8A8F9E" }}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/how-it-works"
              className="inline-flex items-center gap-2 text-[14px] font-medium hover:text-white transition-colors"
              style={{ color: "#89E900" }}>
              See full walkthrough <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold">
              Everything you need to <span style={{ color: "#89E900" }}>create at scale</span>
            </h2>
            <p className="mt-4 text-[16px] max-w-xl mx-auto" style={{ color: "#8A8F9E" }}>
              A full creative suite powered by the most advanced AI models.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat) => (
              <div key={feat.title}
                className="rounded-2xl border overflow-hidden group transition-all duration-300 hover:border-[#89E900]/20"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img src={feat.image} alt={feat.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,20,26,0.8) 0%, transparent 60%)" }} />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(137,233,0,0.1)", border: "1px solid rgba(137,233,0,0.2)" }}>
                      <feat.icon className="h-4 w-4" style={{ color: "#89E900" }} />
                    </div>
                    <h3 className="text-[15px] font-bold">{feat.title}</h3>
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#8A8F9E" }}>{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/features"
              className="inline-flex items-center gap-2 text-[14px] font-medium hover:text-white transition-colors"
              style={{ color: "#89E900" }}>
              View all features <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="py-24 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold">Built for every category</h2>
            <p className="mt-4 text-[16px]" style={{ color: "#8A8F9E" }}>Whatever you sell, Pixalera creates the visuals.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {USE_CASES.map((uc) => (
              <div key={uc.title}
                className="group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-default"
                style={{ borderColor: "#1E2028", background: "#12141A" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${uc.accent}35`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1E2028"; }}
              >
                {/* Gradient background panel */}
                <div className="relative h-36 w-full overflow-hidden" style={{ background: uc.gradient }}>
                  {/* Subtle radial glow */}
                  <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 70% 50%, ${uc.accent}20 0%, transparent 65%)` }} />
                  {/* Grid texture */}
                  <div className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20M0 20h20M0 0v20M20 0v20' stroke='%23ffffff' stroke-width='0.3'/%3E%3C/svg%3E")`,
                      backgroundSize: "20px 20px",
                    }}
                  />
                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                        style={{ background: `${uc.accent}18`, border: `1.5px solid ${uc.accent}40` }}>
                        <uc.icon className="h-7 w-7" style={{ color: uc.accent }} />
                      </div>
                    </div>
                  </div>
                  {/* Tag badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full"
                      style={{ background: `${uc.accent}18`, color: uc.accent, border: `1px solid ${uc.accent}30` }}>
                      {uc.tag}
                    </span>
                  </div>
                  {/* Stat badge */}
                  <div className="absolute bottom-3 right-3">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                      {uc.stat}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-[16px] mb-2 text-white">{uc.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#8A8F9E" }}>{uc.desc}</p>
                  <div className="mt-4 flex items-center gap-1.5"
                    style={{ color: uc.accent }}>
                    <span className="text-[12px] font-semibold">Explore →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold">Loved by creators worldwide</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="rounded-2xl border p-6 space-y-4 hover:border-[#89E900]/20 transition-all"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#89E900] text-[#89E900]" />)}
                </div>
                <p className="text-[14px] leading-relaxed italic" style={{ color: "rgba(200,205,215,0.75)" }}>"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0"
                    style={{ background: "#89E900" }}>{t.avatar}</div>
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

      {/* ── FAQ ── */}
      <section className="py-24 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold">Frequently asked questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}
                className="rounded-2xl border px-5 overflow-hidden"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <AccordionTrigger className="text-[15px] font-semibold py-4 hover:no-underline text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[14px] leading-relaxed pb-4" style={{ color: "#8A8F9E" }}>
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center rounded-2xl border py-16 px-8"
          style={{ background: "linear-gradient(135deg, rgba(137,233,0,0.05) 0%, rgba(137,233,0,0.02) 100%)", borderColor: "rgba(137,233,0,0.15)" }}>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Start creating <span style={{ color: "#89E900" }}>today</span>
          </h2>
          <p className="text-[17px] mb-10 max-w-xl mx-auto" style={{ color: "#8A8F9E" }}>
            Join thousands of brands who've made the switch to AI product photography. 15 free credits. No card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-[15px] font-bold transition-all"
              style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 4px 30px rgba(137,233,0,0.3)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#9FFF00"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#89E900"; }}>
              <Sparkles className="h-4 w-4" />
              Get Started Free
            </Link>
            <Link to="/pricing"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-[15px] font-medium border transition-all hover:border-white/20 hover:text-white"
              style={{ color: "#8A8F9E", borderColor: "#1E2028" }}>
              View Pricing <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t" style={{ borderColor: "#1E2028", background: "#111316" }}>
        <div className="max-w-6xl mx-auto px-6 py-16">

          {/* Columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <BizentoIcon size={28} />
                <span className="font-black text-[16px]" style={{ color: "#F0EBD8" }}>
                  Pixalera<span style={{ color: "#89E900" }}>.</span>
                </span>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: "#8A8F9E" }}>
                AI-powered product photography and catalog generation for ecommerce sellers.
              </p>
              <div className="flex gap-2.5">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                  <a key={label} href={href} aria-label={label}
                    className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#8A8F9E" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(137,233,0,0.12)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(137,233,0,0.3)";
                      (e.currentTarget as HTMLElement).style.color = "#89E900";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                      (e.currentTarget as HTMLElement).style.color = "#8A8F9E";
                    }}>
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_COLS).map(([category, links]) => (
              <div key={category}>
                <p className="text-[12px] font-bold uppercase tracking-wider mb-4" style={{ color: "#8A8F9E" }}>{category}</p>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <button
                        className="text-[13px] transition-colors"
                        style={{ color: "rgba(138,143,158,0.65)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#89E900")}
                        onMouseLeave={e => (e.currentTarget.style.color = "rgba(138,143,158,0.65)")}
                      >{link}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter — between footer columns and copyright */}
          <div className="rounded-2xl overflow-hidden mb-8" style={{ background: "linear-gradient(135deg, rgba(137,233,0,0.06) 0%, rgba(137,233,0,0.02) 100%)", border: "1px solid rgba(137,233,0,0.14)" }}>
            <div className="flex flex-col md:flex-row items-center gap-6 px-6 py-5">
              <div className="flex items-center gap-3 shrink-0">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(137,233,0,0.12)", border: "1px solid rgba(137,233,0,0.2)" }}>
                  <Mail className="h-5 w-5" style={{ color: "#89E900" }} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white">Stay updated with AI ecommerce tips</h3>
                  <p className="text-[12px]" style={{ color: "#8A8F9E" }}>Guides, product updates, and strategies — straight to your inbox.</p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto md:ml-auto shrink-0">
                <div className="flex-1 md:w-60 flex items-center gap-2 rounded-xl px-3.5 py-2.5"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
                  <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: "#8A8F9E" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 bg-transparent text-[13px] text-white placeholder-white/30 outline-none min-w-0"
                  />
                </div>
                <button
                  className="px-5 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 0 16px rgba(137,233,0,0.2)" }}>
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t gap-4" style={{ borderColor: "#1E2028" }}>
            <p className="text-[12px]" style={{ color: "rgba(138,143,158,0.45)" }}>
              © {new Date().getFullYear()} Pixalera AI. All rights reserved.
            </p>
            <p className="text-[12px]" style={{ color: "rgba(138,143,158,0.45)" }}>
              Built for ecommerce sellers 🚀
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
