import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
  SparklesIcon,
  BoltIcon,
  StarIcon,
  CheckIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarSolid,
  BoltIcon as BoltSolid,
} from "@heroicons/react/24/solid";
import { ConfigProvider, Collapse, theme } from "antd";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { BizentoIcon } from "@/components/BizentoIcon";

const TYPING_PROMPTS = [
  "sneaker on white marble surface, editorial lighting",
  "luxury watch on beach at golden sunset",
  "skincare products flat-lay, minimalist aesthetic",
  "dress on AI fashion model, downtown NYC background",
  "perfume bottle on obsidian stone, cinematic shadows",
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
      const t = setTimeout(() => { setPaused(false); setDeleting(true); }, 2400);
      return () => clearTimeout(t);
    }
    if (deleting) {
      if (charIdx === 0) { setDeleting(false); setPromptIdx((i) => (i + 1) % prompts.length); return; }
      const t = setTimeout(() => { setText(current.slice(0, charIdx - 1)); setCharIdx((c) => c - 1); }, 18);
      return () => clearTimeout(t);
    }
    if (charIdx < current.length) {
      const t = setTimeout(() => { setText(current.slice(0, charIdx + 1)); setCharIdx((c) => c + 1); }, 35);
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

const FEATURES = [
  {
    title: "AI Background Generation",
    desc: "Transform plain product photos with AI-generated backgrounds — marble, studio, nature, urban, abstract and more. Every scene, on demand.",
    tag: "Most Used",
    accent: "#89E900",
    image: "/gen-beauty-product.png",
  },
  {
    title: "Multi-Angle Rendering",
    desc: "Generate multiple angles and perspectives from a single product photo, without a full photoshoot. One upload, infinite views.",
    tag: "New",
    accent: "#60a5fa",
    image: "/hero-product.png",
  },
  {
    title: "AI Fashion Models",
    desc: "Place apparel on realistic AI-generated models of any size, shape, and ethnicity — instantly. No model castings, no studio rentals.",
    tag: "Pro",
    accent: "#a78bfa",
    image: "/gen-fashion-product.png",
  },
  {
    title: "Style Variations",
    desc: "Create lifestyle, editorial, catalog, and social variations — all consistent with your brand identity, in one click.",
    tag: "Popular",
    accent: "#f472b6",
    image: "/gen-tech-product.png",
  },
  {
    title: "Batch Processing",
    desc: "Process hundreds of product images simultaneously. Go from raw uploads to finished catalog in minutes, not weeks.",
    tag: "Enterprise",
    accent: "#fb923c",
    image: "/gen-beauty-product.png",
  },
  {
    title: "Brand Consistency",
    desc: "Save brand presets and apply them to every image instantly. Your entire catalog stays cohesive and on-brand.",
    tag: "Smart",
    accent: "#34d399",
    image: "/gen-fashion-product.png",
  },
];

const HOW_IT_WORKS = [
  { num: "01", title: "Upload Your Product", desc: "Drop in any product photo — even a simple smartphone shot. No special equipment needed.", color: "#89E900" },
  { num: "02", title: "Choose Your Style", desc: "Pick from 50+ templates or describe your vision in plain text. Our AI understands your brand.", color: "#60a5fa" },
  { num: "03", title: "Generate & Download", desc: "AI generates studio-quality images in seconds. Download, export, and publish instantly.", color: "#a78bfa" },
];

const USE_CASES = [
  { title: "Fashion & Apparel", desc: "Dress your products on AI models, in lifestyle backdrops, and editorial scenes across every clothing category.", accent: "#c084fc", tag: "Most popular", stat: "5× faster to market" },
  { title: "Beauty & Skincare", desc: "Marble flat-lays, ingredient spotlights, and lifestyle imagery that sells your products' essence instantly.", accent: "#38bdf8", tag: "Highest CTR", stat: "2× conversion uplift" },
  { title: "Electronics & Tech", desc: "Cinematic floating devices, neon reflections, and dark-mode aesthetics that look CGI-rendered.", accent: "#89E900", tag: "CGI-quality", stat: "80% cost savings" },
  { title: "Furniture & Home", desc: "Styled room mockups, interior context shots, and on-model placement for any furniture or décor piece.", accent: "#f59e0b", tag: "Scene-ready", stat: "3× more engagement" },
  { title: "D2C Brands", desc: "Consistent visual identity across every touchpoint — ads, catalogs, social, and packaging — in minutes.", accent: "#f87171", tag: "Brand-consistent", stat: "10× content velocity" },
  { title: "Food & Beverage", desc: "Mouth-watering food styling and packaging visuals that drive appetite and shelf appeal — no food stylist needed.", accent: "#4ade80", tag: "Appetite-driving", stat: "4× social shares" },
];

const TESTIMONIALS = [
  { name: "Rahul Mehta", role: "Founder, StyleKart", avatar: "R", quote: "Pixalera cut our photoshoot budget by 80%. We went from waiting 2 weeks for images to publishing same-day. The quality is genuinely indistinguishable from studio shots.", stars: 5 },
  { name: "Priya Sharma", role: "Head of Marketing, GlowBeauty", avatar: "P", quote: "Our CTR doubled after switching to Pixalera-generated images. The AI understands our brand aesthetic perfectly. I couldn't run campaigns without it.", stars: 5 },
  { name: "James O'Brien", role: "E-commerce Director, TechMart UK", avatar: "J", quote: "We have 8,000+ SKUs. Pixalera processed our entire catalog in a weekend. The results are stunning and perfectly consistent.", stars: 5 },
  { name: "Aisha Patel", role: "CMO, NovaBrands", avatar: "A", quote: "The batch processing is a game changer. What used to take our team a month now happens overnight. Our content pipeline is completely transformed.", stars: 5 },
];

const FAQ = [
  { q: "How good is the image quality?", a: "Pixalera generates images at professional studio quality — indistinguishable from traditional photoshoots. We use state-of-the-art diffusion models fine-tuned specifically for product photography." },
  { q: "Can I process images in bulk?", a: "Yes. Our batch processing feature lets you upload and process hundreds of images at once, applying consistent style settings across your entire catalog." },
  { q: "What file formats are supported?", a: "We support JPEG, PNG, WebP for input. Outputs are available in JPEG, PNG, and WebP at up to 4K resolution depending on your plan." },
  { q: "Is there an API?", a: "Yes — our Pro plan includes API access, letting you integrate Pixalera directly into your inventory management, CMS, or custom workflows." },
  { q: "Do you offer a satisfaction guarantee?", a: "Absolutely. All paid plans include a 14-day satisfaction guarantee. If you're not happy, we'll refund you in full." },
  { q: "How do I get started?", a: "Sign up free — 15 credits on us, no credit card required. Upload a product photo and you'll have studio-quality results in under a minute." },
];

const FOOTER_COLS: Record<string, { label: string; to: string }[]> = {
  Product: [
    { label: "Features", to: "/features" },
    { label: "Pricing", to: "/pricing" },
    { label: "Demo", to: "/demo" },
    { label: "How It Works", to: "/how-it-works" },
  ],
  Tools: [
    { label: "Catalog Generator", to: "/tools/catalog" },
    { label: "Product Photography", to: "/tools/photo" },
    { label: "Cinematic Ads", to: "/tools/cinematic" },
    { label: "Ad Creatives", to: "/tools/creative" },
  ],
  Resources: [
    { label: "Help Center", to: "/help" },
    { label: "Guides", to: "/guides" },
    { label: "Blog", to: "/blog" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms", to: "/terms" },
    { label: "Refund Policy", to: "/refund-policy" },
    { label: "Cookies", to: "/cookies" },
  ],
};

function ProfileDropdown({ user, onClose }: { user: any; onClose: () => void }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const initials = (user.displayName || user.email || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const handleLogout = async () => { onClose(); await signOut(); navigate("/"); };
  return (
    <div className="absolute right-0 top-12 w-56 rounded-2xl py-2 z-50 liquid-glass-strong">
      <div className="px-4 py-3 border-b border-white/8 mb-1">
        <p className="text-[13px] font-semibold text-white truncate">{user.displayName || "User"}</p>
        {user.email && <p className="text-[11px] text-white/35 truncate mt-0.5">{user.email}</p>}
      </div>
      <button onClick={() => { onClose(); navigate("/app"); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/65 hover:bg-white/5 hover:text-white transition-colors">
        <Squares2X2Icon className="h-4 w-4 shrink-0" /> Dashboard
      </button>
      <button onClick={() => { onClose(); navigate("/app/settings"); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/65 hover:bg-white/5 hover:text-white transition-colors">
        <Cog6ToothIcon className="h-4 w-4 shrink-0" /> Settings
      </button>
      <div className="h-px bg-white/8 my-1 mx-3" />
      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors">
        <ArrowRightOnRectangleIcon className="h-4 w-4 shrink-0" /> Log out
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
  const [videoError, setVideoError] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const featuresRef = useScrollReveal();
  const howRef = useScrollReveal();
  const useCasesRef = useScrollReveal();
  const testimonialsRef = useScrollReveal();
  const faqRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
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

  const initials = user ? (user.displayName || user.email || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "";

  return (
    <div className="min-h-screen" style={{ background: "#0D0F14", color: "#E8EAF0" }}>

      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute" style={{ width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(137,233,0,0.05) 0%, transparent 70%)", top: "10%", left: "20%", filter: "blur(60px)" }} />
        <div className="absolute" style={{ width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.04) 0%, transparent 70%)", top: "50%", right: "10%", filter: "blur(80px)" }} />
        <div className="absolute" style={{ width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 70%)", bottom: "10%", left: "30%", filter: "blur(60px)" }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={scrolled ? {} : { background: "transparent" }}
      >
        <div className={`transition-all duration-500 ${scrolled ? "liquid-glass-nav" : ""}`}>
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <BizentoIcon size={30} />
              <span className="text-[17px] font-black tracking-tight" style={{ color: "#F0EBD8", letterSpacing: "-0.02em" }}>
                Pixalera<span style={{ color: "#89E900" }}>.</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((l) => (
                <button key={l.label} onClick={() => scrollTo(l.href)}
                  className="text-[14px] font-medium transition-colors duration-150 hover:text-white"
                  style={{ color: "#6B7280" }}>
                  {l.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {!loading && user ? (
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all">
                    <Avatar className="h-8 w-8 ring-2" style={{ boxShadow: "0 0 0 2px rgba(137,233,0,0.3)" }}>
                      {user.photoURL && <AvatarImage src={user.photoURL} referrerPolicy="no-referrer" />}
                      <AvatarFallback style={{ background: "rgba(137,233,0,0.15)", color: "#89E900" }} className="text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <ChevronDownIcon className={`h-3.5 w-3.5 text-white/30 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                  </button>
                  {profileOpen && <ProfileDropdown user={user} onClose={() => setProfileOpen(false)} />}
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-[14px] font-medium px-4 py-2 rounded-xl hover:text-white transition-colors" style={{ color: "#6B7280" }}>
                    Log in
                  </Link>
                  <Link to="/signup"
                    className="text-[14px] font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all duration-150"
                    style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 0 24px rgba(137,233,0,0.25)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#9FFF00"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#89E900"; }}>
                    Get Started <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
            </div>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 rounded-lg hover:bg-white/5" style={{ color: "#6B7280" }}>
                  <Bars3Icon className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="border-0 p-0 w-72" style={{ background: "rgba(14,16,22,0.97)", backdropFilter: "blur(40px)" }}>
                <div className="p-6 space-y-6">
                  <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                    <BizentoIcon size={28} />
                    <span className="font-black text-[16px]" style={{ color: "#F0EBD8" }}>Pixalera<span style={{ color: "#89E900" }}>.</span></span>
                  </Link>
                  <div className="space-y-1">
                    {NAV_LINKS.map((l) => (
                      <button key={l.label} onClick={() => scrollTo(l.href)}
                        className="block w-full text-left px-4 py-3 rounded-xl text-[15px] font-medium hover:text-white hover:bg-white/5 transition-all"
                        style={{ color: "#6B7280" }}>{l.label}</button>
                    ))}
                  </div>
                  <div className="space-y-3 pt-4 border-t border-white/8">
                    {user ? (
                      <Link to="/app" onClick={() => setMobileOpen(false)}
                        className="block w-full text-center py-3 rounded-xl text-[14px] font-semibold"
                        style={{ background: "#89E900", color: "#0D0F14" }}>Dashboard</Link>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setMobileOpen(false)}
                          className="block w-full text-center py-3 rounded-xl text-[14px] font-medium border border-white/10"
                          style={{ color: "#6B7280" }}>Log in</Link>
                        <Link to="/signup" onClick={() => setMobileOpen(false)}
                          className="block w-full text-center py-3 rounded-xl text-[14px] font-semibold"
                          style={{ background: "#89E900", color: "#0D0F14" }}>Get Started</Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden" style={{ perspective: "1000px" }}>
        {/* Video / fallback image background */}
        {!videoError ? (
          <video
            autoPlay muted loop playsInline
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.7 }}
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        ) : (
          <img src="/hero-studio-bg.png" alt="" aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.7 }} />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(13,15,20,0.6) 0%, rgba(13,15,20,0.2) 40%, rgba(13,15,20,0.85) 100%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(13,15,20,0.5) 0%, transparent 55%)" }} />

        {/* Floating product image */}
        <img src="/hero-perfume-bottle.png" alt="AI product photography"
          className="absolute pointer-events-none hidden lg:block animate-float"
          style={{ bottom: "-3%", right: "2%", width: "34%", maxWidth: 460, objectFit: "contain", zIndex: 5, filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.8))" }} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-28 pb-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[13px] font-medium liquid-glass"
            style={{ color: "#89E900", borderColor: "rgba(137,233,0,0.25)", borderWidth: 1, borderStyle: "solid" }}>
            <SparklesIcon className="h-3.5 w-3.5" />
            AI-Powered Creative Platform
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-[76px] font-extrabold leading-[0.96] tracking-tight mb-6 text-white">
            Your product.{" "}
            <span style={{ color: "#89E900", textShadow: "0 0 80px rgba(137,233,0,0.6)" }}>Any scene.</span>
            <br />Instant reality.
          </h1>

          <p className="text-[17px] md:text-[18px] leading-relaxed mb-10 max-w-xl" style={{ color: "rgba(200,205,215,0.82)" }}>
            Transform simple product photos into stunning, studio-quality images and marketing creatives — powered by AI, in seconds.
          </p>

          {/* Prompt box */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-[720px]">
            <div className="flex-1 flex items-center gap-3 rounded-2xl transition-all duration-200 liquid-glass"
              style={{ padding: "13px 16px" }}>
              <input
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleGenerate(); }}
                placeholder={typedText || "Describe your product scene..."}
                className="flex-1 bg-transparent text-[14px] text-white placeholder-white/25 outline-none min-w-0"
              />
              <button onClick={handleGenerate}
                className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl transition-all duration-150 hover:scale-105 active:scale-95"
                style={{ background: "#89E900", color: "#0D0F14" }}>
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
            <Link to="/signup"
              className="shrink-0 flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-2xl text-[14px] font-semibold transition-all duration-150 hover:scale-[1.02]"
              style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 0 28px rgba(137,233,0,0.3)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#9FFF00"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#89E900"; }}>
              Get Started Free <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <p className="text-[12px] mt-4" style={{ color: "rgba(107,114,128,0.7)" }}>
            No credit card required · 15 free credits · Cancel anytime
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-4 mt-10">
            <div className="flex -space-x-2">
              {["R","P","J","A","K"].map((l, i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold"
                  style={{ background: `hsl(${i * 60}, 60%, 40%)`, zIndex: 5 - i }}>
                  {l}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => <StarSolid key={s} className="h-3 w-3" style={{ color: "#89E900" }} />)}
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: "rgba(156,163,175,0.8)" }}>
                Trusted by <strong className="text-white">2,400+</strong> brands
              </p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <ChevronDownIcon className="h-5 w-5" style={{ color: "rgba(137,233,0,0.5)" }} />
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="py-14 border-y border-white/6" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { val: "2M+", label: "Images Generated" },
              { val: "80%", label: "Cost Reduction" },
              { val: "15s", label: "Average Generation" },
              { val: "2,400+", label: "Brands Worldwide" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold mb-1" style={{ color: "#89E900" }}>{s.val}</div>
                <div className="text-[13px]" style={{ color: "rgba(156,163,175,0.7)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div ref={featuresRef}>
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-[13px] font-semibold uppercase tracking-widest mb-4" style={{ color: "#89E900" }}>Features</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Everything you need to sell.
              </h2>
              <p className="text-[17px] max-w-xl mx-auto" style={{ color: "rgba(156,163,175,0.8)" }}>
                One platform for all your product photography needs — from single shots to full catalog campaigns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <div key={i}
                  className={`scroll-reveal-scale reveal-delay-${[100,150,200,250,300,350][i] ?? 100} group relative rounded-2xl overflow-hidden liquid-glass-card transition-all duration-300 hover:scale-[1.02]`}
                  style={{ minHeight: 280 }}>
                  {/* Product image preview */}
                  <div className="h-40 overflow-hidden relative">
                    <img src={f.image} alt={f.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(13,15,20,0.95) 100%)" }} />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{ background: `${f.accent}18`, color: f.accent, border: `1px solid ${f.accent}30` }}>
                      {f.tag}
                    </div>
                  </div>
                  {/* Text content - NO icons as requested */}
                  <div className="p-5">
                    <div className="w-8 h-[2px] rounded-full mb-3" style={{ background: f.accent }} />
                    <h3 className="text-[16px] font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: "rgba(156,163,175,0.75)" }}>{f.desc}</p>
                    <button className="mt-4 flex items-center gap-1 text-[12px] font-semibold transition-colors" style={{ color: f.accent }}>
                      Learn more <ChevronRightIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-5xl mx-auto">
          <div ref={howRef}>
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-[13px] font-semibold uppercase tracking-widest mb-4" style={{ color: "#89E900" }}>How It Works</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Studio quality in three steps.
              </h2>
              <p className="text-[17px] max-w-xl mx-auto" style={{ color: "rgba(156,163,175,0.8)" }}>
                No designers. No studio. No waiting. Just results.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map((s, i) => (
                <div key={i} className={`scroll-reveal reveal-delay-${[0, 200, 400][i]}`}>
                  <div className="relative rounded-2xl p-7 liquid-glass-card h-full">
                    <div className="text-[48px] font-black mb-4 leading-none" style={{ color: `${s.color}20`, WebkitTextStroke: `1px ${s.color}40` }}>
                      {s.num}
                    </div>
                    <div className="w-6 h-[2px] rounded mb-3" style={{ background: s.color }} />
                    <h3 className="text-[17px] font-bold text-white mb-3">{s.title}</h3>
                    <p className="text-[14px] leading-relaxed" style={{ color: "rgba(156,163,175,0.75)" }}>{s.desc}</p>
                    {i < HOW_IT_WORKS.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                        <ArrowRightIcon className="h-4 w-4" style={{ color: "rgba(255,255,255,0.15)" }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div ref={useCasesRef}>
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-[13px] font-semibold uppercase tracking-widest mb-4" style={{ color: "#89E900" }}>Use Cases</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Built for every industry.
              </h2>
              <p className="text-[17px] max-w-xl mx-auto" style={{ color: "rgba(156,163,175,0.8)" }}>
                From fashion to food — Pixalera transforms how brands create visual content.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {USE_CASES.map((u, i) => (
                <div key={i}
                  className={`scroll-reveal-scale reveal-delay-${[100,150,200,250,300,350][i] ?? 100} group relative rounded-2xl p-6 liquid-glass-card transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden`}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${u.accent}08 0%, transparent 70%)` }} />
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-4"
                    style={{ background: `${u.accent}12`, color: u.accent }}>
                    {u.tag}
                  </div>
                  <h3 className="text-[17px] font-bold text-white mb-2">{u.title}</h3>
                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: "rgba(156,163,175,0.7)" }}>{u.desc}</p>
                  <div className="flex items-center gap-2">
                    <BoltSolid className="h-3.5 w-3.5" style={{ color: u.accent }} />
                    <span className="text-[13px] font-bold" style={{ color: u.accent }}>{u.stat}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6" style={{ background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-6xl mx-auto">
          <div ref={testimonialsRef}>
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-[13px] font-semibold uppercase tracking-widest mb-4" style={{ color: "#89E900" }}>Testimonials</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Brands that switched. Never looked back.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className={`scroll-reveal-left reveal-delay-${[100, 200, 100, 200][i]} rounded-2xl p-6 liquid-glass-card`}>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <StarSolid key={s} className="h-3.5 w-3.5" style={{ color: "#89E900" }} />
                    ))}
                  </div>
                  <p className="text-[14px] leading-relaxed mb-5 text-white/80">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "rgba(137,233,0,0.15)", color: "#89E900" }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">{t.name}</p>
                      <p className="text-[12px]" style={{ color: "rgba(156,163,175,0.6)" }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div ref={faqRef}>
            <div className="text-center mb-16 scroll-reveal">
              <p className="text-[13px] font-semibold uppercase tracking-widest mb-4" style={{ color: "#89E900" }}>FAQ</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Questions answered.
              </h2>
            </div>

            <div className="scroll-reveal reveal-delay-200">
              <ConfigProvider theme={{
                algorithm: theme.darkAlgorithm,
                token: { colorBgContainer: "rgba(255,255,255,0.03)", colorBorder: "rgba(255,255,255,0.08)", colorText: "rgba(255,255,255,0.85)", borderRadius: 12, colorPrimary: "#89E900" },
                components: { Collapse: { headerBg: "transparent" } }
              }}>
                <Collapse
                  accordion
                  expandIconPlacement="end"
                  items={FAQ.map((f, i) => ({
                    key: String(i),
                    label: <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{f.q}</span>,
                    children: <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(156,163,175,0.82)", paddingBottom: 4 }}>{f.a}</p>,
                    style: { marginBottom: 8, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" },
                  }))}
                  style={{ background: "transparent", border: "none" }}
                />
              </ConfigProvider>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center" ref={ctaRef}>
          <div className="rounded-3xl p-12 scroll-reveal-scale relative overflow-hidden liquid-glass-strong">
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(137,233,0,0.08) 0%, transparent 60%)" }} />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold mb-6 liquid-glass" style={{ color: "#89E900", border: "1px solid rgba(137,233,0,0.25)" }}>
                <BoltIcon className="h-3.5 w-3.5" /> Start free today
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Ready to transform your product imagery?
              </h2>
              <p className="text-[17px] mb-8 max-w-lg mx-auto" style={{ color: "rgba(156,163,175,0.8)" }}>
                Join 2,400+ brands already creating studio-quality content with AI. 15 free credits, no card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-[15px] font-bold transition-all duration-150 hover:scale-105"
                  style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 0 40px rgba(137,233,0,0.3)" }}>
                  Get Started Free <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link to="/demo"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-[15px] font-medium transition-all duration-150 hover:bg-white/8 liquid-glass"
                  style={{ color: "#fff" }}>
                  Watch Demo
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-6">
                {["No credit card required", "15 free credits", "Cancel anytime"].map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[12px]" style={{ color: "rgba(156,163,175,0.6)" }}>
                    <CheckIcon className="h-3.5 w-3.5" style={{ color: "#89E900" }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-16 px-6 border-t border-white/6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <BizentoIcon size={28} />
                <span className="font-black text-[16px]" style={{ color: "#F0EBD8" }}>Pixalera<span style={{ color: "#89E900" }}>.</span></span>
              </Link>
              <p className="text-[13px] leading-relaxed" style={{ color: "rgba(156,163,175,0.6)" }}>
                AI-powered product photography for modern brands.
              </p>
            </div>
            {Object.entries(FOOTER_COLS).map(([col, links]) => (
              <div key={col}>
                <p className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>{col}</p>
                <div className="space-y-2.5">
                  {links.map(link => (
                    <Link key={link.label} to={link.to}
                      className="block text-[13px] hover:text-white transition-colors"
                      style={{ color: "rgba(156,163,175,0.6)" }}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[12px]" style={{ color: "rgba(156,163,175,0.4)" }}>
              © {new Date().getFullYear()} Pixalera. All rights reserved.
            </p>
            <p className="text-[12px]" style={{ color: "rgba(156,163,175,0.4)" }}>
              Transforming product photography with AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
