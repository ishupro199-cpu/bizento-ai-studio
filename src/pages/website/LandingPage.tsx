import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, ArrowRight, Check, Star, X, CheckCircle2, XCircle,
  Camera, Layers, Users, Palette, Zap, Shield, ShoppingBag,
  Droplets, Monitor, Sofa, Package, UtensilsCrossed, Menu,
  ChevronRight, Mail, Twitter, Instagram, Linkedin, Github,
  Plus, Send, LayoutGrid, Clapperboard, Megaphone, Image as ImageIcon,
  Settings, LogOut, Crown, ChevronDown,
} from "lucide-react";
import { BizentoIcon } from "@/components/BizentoIcon";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
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

const TOOLS = [
  { id: "catalog", name: "Generate Catalog", icon: LayoutGrid },
  { id: "photo", name: "Product Photography", icon: Camera },
  { id: "cinematic", name: "Cinematic Ads", icon: Clapperboard },
  { id: "creative", name: "Ad Creatives", icon: Megaphone },
];
const MODELS = [
  { id: "flash", name: "Flash" },
  { id: "pro", name: "Pro" },
];
const QUALITIES = [
  { id: "1K", label: "1K", bonus: 0 },
  { id: "2K", label: "2K", bonus: 2 },
  { id: "4K", label: "4K", bonus: 6 },
];

function calcCredits(tool: string, model: string, quality: string): number {
  const base = model === "flash"
    ? (tool === "catalog" ? 5 : 3)
    : (tool === "catalog" ? 10 : 5);
  const bonus = quality === "2K" ? 2 : quality === "4K" ? 6 : 0;
  return base + bonus;
}

const BEFORE_AFTER = [
  { category: "Fashion", before: "Plain white background, wrinkled fabric, poor lighting", after: "Model wearing it in Manhattan streets, golden hour glow", image: "/gen-fashion-product.png" },
  { category: "Beauty", before: "Cluttered desk, uneven shadows, no styling", after: "Minimalist flat-lay, marble surface, studio lighting", image: "/gen-beauty-product.png" },
  { category: "Electronics", before: "Box on table, warehouse background", after: "Floating on gradient, neon reflections, cinematic depth", image: "/gen-tech-product.png" },
  { category: "Fragrance", before: "Blurry close-up, no staging, casual shot", after: "Marble platform, dramatic studio lighting, luxury aesthetic", image: "/hero-product.png" },
];

const FEATURES = [
  { icon: Camera, title: "AI Background Generation", desc: "Transform plain product photos with AI-generated backgrounds that match your brand — marble, studio, nature, urban, abstract and more.", image: "/gen-beauty-product.png" },
  { icon: Layers, title: "Multi-Angle Rendering", desc: "Generate multiple angles and perspectives from a single product photo. Show your product from every angle without a full shoot.", image: "/hero-product.png" },
  { icon: Users, title: "AI Fashion Models", desc: "Place apparel and accessories on realistic AI-generated models of any size, shape, and ethnicity — without hiring a single model.", image: "/gen-fashion-product.png" },
  { icon: Palette, title: "Style Variations", desc: "Create multiple style variations from a single photo — lifestyle, editorial, catalog, social — all consistent with your brand.", image: "/gen-tech-product.png" },
  { icon: Zap, title: "Batch Processing", desc: "Process hundreds of product images simultaneously with the same style settings. Go from raw uploads to finished catalog in minutes.", image: "/gen-beauty-product.png" },
  { icon: Shield, title: "Brand Consistency", desc: "Save brand presets and apply them to every image instantly. Your entire catalog stays visually cohesive at all times.", image: "/gen-fashion-product.png" },
];

const USE_CASES = [
  { icon: ShoppingBag, title: "Fashion & Apparel", desc: "Models, backdrops, and editorial styles for every clothing category.", image: "/gen-fashion-product.png" },
  { icon: Droplets, title: "Beauty & Skincare", desc: "Clean flat-lays, lifestyle scenes, and ingredient-focused visuals.", image: "/gen-beauty-product.png" },
  { icon: Monitor, title: "Electronics", desc: "Cinematic tech photography — floating devices, neon reflections, dark aesthetics.", image: "/gen-tech-product.png" },
  { icon: Sofa, title: "Furniture & Home", desc: "Styled room mockups and interior context for any furniture piece.", image: "/hero-product.png" },
  { icon: Package, title: "D2C Brands", desc: "Consistent visual identity across all touchpoints — ads, catalog, social.", image: "/gen-beauty-product.png" },
  { icon: UtensilsCrossed, title: "Food & Beverage", desc: "Mouth-watering food photography and packaging visuals without a food stylist.", image: "/gen-fashion-product.png" },
];

const HOW_IT_WORKS = [
  { num: "01", title: "Upload Your Product", desc: "Drop in any product photo — even a simple smartphone shot. No special equipment needed.", color: "#89E900" },
  { num: "02", title: "Choose Your Style", desc: "Pick from 50+ templates or describe your vision in plain text. Our AI understands your brand.", color: "#3B82F6" },
  { num: "03", title: "Generate & Download", desc: "AI generates studio-quality images in seconds. Download, export, and publish instantly.", color: "#8B5CF6" },
];

const TESTIMONIALS = [
  { name: "Rahul Mehta", role: "Founder, StyleKart", avatar: "R", quote: "Bizento AI cut our photoshoot budget by 80%. We went from waiting 2 weeks for images to publishing same-day. The quality is genuinely indistinguishable from studio shots." },
  { name: "Priya Sharma", role: "Head of Marketing, GlowBeauty", avatar: "P", quote: "Our CTR doubled after switching to Bizento AI-generated images. The AI understands our brand aesthetic perfectly. I use it daily — couldn't run campaigns without it." },
  { name: "James O'Brien", role: "E-commerce Director, TechMart UK", avatar: "J", quote: "We have 8,000+ SKUs. Bizento AI processed our entire catalog in a weekend. The results are stunning and consistent." },
];

const FAQ = [
  { q: "How good is the image quality?", a: "Bizento AI generates images at professional studio quality — indistinguishable from traditional photoshoots. We use state-of-the-art diffusion models fine-tuned specifically for product photography." },
  { q: "Can I process images in bulk?", a: "Yes. Our batch processing feature lets you upload and process hundreds of images at once, applying consistent style settings across your entire catalog." },
  { q: "What file formats are supported?", a: "We support JPEG, PNG, WebP for input. Outputs are available in JPEG, PNG, and WebP at up to 4K resolution depending on your plan." },
  { q: "Is there an API?", a: "Yes — our Pro plan includes API access, letting you integrate Bizento AI directly into your inventory management, CMS, or custom workflows." },
  { q: "Do you offer a satisfaction guarantee?", a: "Absolutely. All paid plans include a 14-day satisfaction guarantee. If you're not happy, we'll refund you in full." },
  { q: "How do I get started?", a: "Sign up free — 15 credits on us, no credit card required. Upload a product photo and you'll have studio-quality results in under a minute." },
];

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Resources", href: "#resources" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

const FOOTER_LINKS = {
  Product: ["Features", "Pricing", "Changelog", "API Docs"],
  Resources: ["Blog", "Case Studies", "Documentation", "Community"],
  Company: ["About Us", "Careers", "Press Kit", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
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
    <div
      className="absolute right-0 top-10 w-56 rounded-2xl border border-white/10 shadow-2xl py-2 z-50"
      style={{ background: "rgba(20,22,28,0.97)", backdropFilter: "blur(28px)" }}
    >
      <div className="px-4 py-3 border-b border-white/8 mb-1">
        <p className="text-[13px] font-semibold text-white truncate">{user.displayName || "User"}</p>
        {user.email && <p className="text-[11px] text-white/35 truncate mt-0.5">{user.email}</p>}
      </div>
      <button
        onClick={() => { onClose(); navigate("/app"); }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/65 hover:bg-white/5 hover:text-white transition-colors"
      >
        <LayoutGrid className="h-4 w-4 shrink-0" /> Go to Dashboard
      </button>
      <button
        onClick={() => { onClose(); navigate("/app/settings"); }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/65 hover:bg-white/5 hover:text-white transition-colors"
      >
        <Settings className="h-4 w-4 shrink-0" /> Settings
      </button>
      <div className="h-px bg-white/8 my-1 mx-3" />
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/45 hover:bg-red-500/10 hover:text-red-400 transition-colors"
      >
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
  const profileRef = useRef<HTMLDivElement>(null);

  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // Prompt box state
  const [promptText, setPromptText] = useState("");
  const [selectedTool, setSelectedTool] = useState("catalog");
  const [selectedModel, setSelectedModel] = useState("flash");
  const [selectedQuality, setSelectedQuality] = useState("1K");
  const [toolsOpen, setToolsOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  const creditCost = calcCredits(selectedTool, selectedModel, selectedQuality);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedImage(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = () => {
    if (!user) { navigate("/signup"); return; }
    navigate("/app");
  };

  const initials = user
    ? (user.displayName || user.email || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  return (
    <div className="min-h-screen font-bricolage" style={{ background: "#0D0F14", color: "#E8EAF0" }}>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      {/* Global grid pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40M0 40h40M0 0v40M40 0v40' stroke='%2389E900' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(13,15,20,0.9)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <BizentoIcon size={32} />
            <span className="text-[17px] font-black tracking-tight" style={{ color: "#F0EBD8", letterSpacing: "-0.02em" }}>
              Bizento<span style={{ color: "#89E900" }}>.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <button key={l.label}
                onClick={() => scrollTo(l.href)}
                className="text-[14px] font-medium transition-colors duration-150"
                style={{ color: "#8A8F9E" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#E8EAF0")}
                onMouseLeave={e => (e.currentTarget.style.color = "#8A8F9E")}
              >{l.label}</button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!loading && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-white/5"
                >
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
                  className="text-[14px] font-medium px-4 py-2 rounded-xl transition-colors"
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
              </>
            )}
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 rounded-lg" style={{ color: "#8A8F9E" }}>
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="border-0 p-0 w-72" style={{ background: "#12141A" }}>
              <div className="p-6 space-y-6">
                <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <BizentoIcon size={28} />
                  <span className="font-black text-[16px]" style={{ color: "#F0EBD8" }}>
                    Bizento<span style={{ color: "#89E900" }}>.</span>
                  </span>
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
                  {user ? (
                    <Link to="/app" onClick={() => setMobileOpen(false)}
                      className="block w-full text-center py-3 rounded-xl text-[14px] font-semibold"
                      style={{ background: "#89E900", color: "#0D0F14" }}
                    >Go to Dashboard</Link>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMobileOpen(false)}
                        className="block w-full text-center py-3 rounded-xl text-[14px] font-medium border"
                        style={{ color: "#8A8F9E", borderColor: "#1E2028" }}
                      >Log in</Link>
                      <Link to="/signup" onClick={() => setMobileOpen(false)}
                        className="block w-full text-center py-3 rounded-xl text-[14px] font-semibold"
                        style={{ background: "#89E900", color: "#0D0F14" }}
                      >Get Started</Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">

        <img src="/hero-studio-bg.png" alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          style={{ opacity: 0.85 }}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(10,11,15,0.55) 0%, rgba(10,11,15,0.25) 50%, rgba(10,11,15,0.72) 100%)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to right, rgba(10,11,15,0.4) 0%, transparent 60%, rgba(10,11,15,0.2) 100%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: 700, height: 700, background: "radial-gradient(circle, rgba(137,233,0,0.07) 0%, transparent 70%)" }} />

        <img src="/hero-perfume-bottle.png" alt="AI product photography"
          className="absolute pointer-events-none hidden md:block"
          style={{ bottom: "-2%", right: "-2%", width: "38%", maxWidth: 480, objectFit: "contain", objectPosition: "bottom right", zIndex: 5, filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.7))" }}
        />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-28 pb-24 text-left">

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

          {/* ── ChatGPT-style Prompt Box ── */}
          <div className="max-w-[580px]">
            {/* Image preview (when uploaded) */}
            {uploadedImage && (
              <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                  <img src={uploadedImage} alt="Upload" className="h-12 w-12 rounded-xl object-cover border border-white/20" />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-1 -right-1 h-4 w-4 bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white/70 text-[10px] hover:text-white"
                  >×</button>
                </div>
                <span className="text-[11px] text-white/40">Product image attached</span>
              </div>
            )}

            {/* Input box */}
            <div
              className="rounded-2xl flex items-center gap-2 transition-all duration-150"
              style={{
                background: "rgba(16,18,24,0.88)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(16px)",
                padding: "10px 12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              {/* + button */}
              <div className="relative shrink-0" ref={toolsRef}>
                <button
                  onClick={() => setToolsOpen(v => !v)}
                  disabled={!!uploadedImage}
                  title="Tools / Upload"
                  className="h-9 w-9 flex items-center justify-center rounded-xl transition-all hover:bg-white/8 disabled:opacity-40"
                  style={{ border: "1px solid rgba(255,255,255,0.10)", color: "#8A8F9E" }}
                >
                  <Plus className="h-4 w-4" />
                </button>
                {toolsOpen && (
                  <div
                    className="absolute left-0 bottom-11 w-56 rounded-2xl border border-white/10 py-2 shadow-2xl z-50"
                    style={{ background: "rgba(18,20,26,0.98)", backdropFilter: "blur(24px)" }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 px-4 pt-1 pb-1.5">Upload</p>
                    <button
                      onClick={() => { fileInputRef.current?.click(); setToolsOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/65 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <ImageIcon className="h-4 w-4 shrink-0" /> Upload Image
                    </button>
                    <div className="h-px bg-white/8 my-1 mx-3" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 px-4 pt-1 pb-1.5">Tools</p>
                    {TOOLS.map(t => (
                      <button key={t.id}
                        onClick={() => { setSelectedTool(t.id); setToolsOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors ${selectedTool === t.id ? "text-primary bg-primary/8" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
                      >
                        <t.icon className="h-4 w-4 shrink-0" />
                        {t.name}
                        {selectedTool === t.id && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text input */}
              <input
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                placeholder={`Describe your ${TOOLS.find(t => t.id === selectedTool)?.name.toLowerCase() || "creation"}...`}
                className="flex-1 bg-transparent text-[14px] text-white placeholder-white/30 outline-none"
              />

              {/* Credit display */}
              <div
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold"
                style={{ background: "rgba(137,233,0,0.08)", color: "#89E900", border: "1px solid rgba(137,233,0,0.15)" }}
              >
                <Zap className="h-3 w-3" />
                {creditCost} cr
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl transition-all duration-150 hover:scale-105"
                style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 0 16px rgba(137,233,0,0.3)" }}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {/* Model selector */}
              <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {MODELS.map(m => (
                  <button key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                    style={selectedModel === m.id
                      ? { background: "#89E900", color: "#0D0F14" }
                      : { color: "#8A8F9E" }
                    }
                  >{m.name}</button>
                ))}
              </div>

              {/* Quality selector */}
              <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {QUALITIES.map(q => (
                  <button key={q.id}
                    onClick={() => setSelectedQuality(q.id)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                    style={selectedQuality === q.id
                      ? { background: "#89E900", color: "#0D0F14" }
                      : { color: "#8A8F9E" }
                    }
                  >{q.label}</button>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <Link to="/signup"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                  style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 0 16px rgba(137,233,0,0.2)" }}
                >
                  Get Started
                </Link>
                <Link to="/features"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-medium border transition-all"
                  style={{ color: "#8A8F9E", borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
                >
                  Demo
                </Link>
              </div>
            </div>

            <p className="text-[11px] mt-2.5" style={{ color: "rgba(138,143,158,0.5)" }}>
              No credit card required · 15 free credits · Cancel anytime
            </p>
          </div>
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
                <div className="grid grid-cols-2 divide-x" style={{ borderTop: "1px solid #1E2028" }}>
                  <div className="p-4">
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#8A8F9E" }}>Raw Input</p>
                    <p className="text-[12px] leading-relaxed" style={{ color: "#8A8F9E" }}>{item.before}</p>
                  </div>
                  <div className="p-4" style={{ borderColor: "#1E2028" }}>
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#89E900" }}>Bizento AI</p>
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
              <div key={step.num} className="rounded-2xl border p-6 transition-all duration-300 hover:border-[rgba(137,233,0,0.2)]"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className="text-[40px] font-extrabold mb-4 leading-none" style={{ color: step.color, opacity: 0.6 }}>{step.num}</div>
                <h3 className="text-[18px] font-bold mb-2">{step.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "#8A8F9E" }}>{step.desc}</p>
              </div>
            ))}
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
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section id="resources" className="py-24 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold">Built for every category</h2>
            <p className="mt-4 text-[16px]" style={{ color: "#8A8F9E" }}>Whatever you sell, Bizento AI creates the visuals.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {USE_CASES.map((uc) => (
              <div key={uc.title}
                className="rounded-2xl border p-5 flex gap-4 group transition-all duration-300 hover:border-[#89E900]/20"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(137,233,0,0.08)", border: "1px solid rgba(137,233,0,0.15)" }}>
                  <uc.icon className="h-5 w-5" style={{ color: "#89E900" }} />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] mb-1">{uc.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#8A8F9E" }}>{uc.desc}</p>
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
                className="rounded-2xl border p-6 space-y-4 transition-all duration-300 hover:border-[#89E900]/20"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#89E900] text-[#89E900]" />
                  ))}
                </div>
                <p className="text-[14px] leading-relaxed italic" style={{ color: "rgba(200,205,215,0.75)" }}>
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0"
                    style={{ background: "#89E900" }}>
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

      {/* ── FAQ ── */}
      <section className="py-24 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold">Frequently asked questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-2xl border px-5 overflow-hidden"
                style={{ background: "#12141A", borderColor: "#1E2028" }}
              >
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
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-[15px] font-bold transition-all duration-150"
              style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 4px 30px rgba(137,233,0,0.3)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#9FFF00"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 50px rgba(137,233,0,0.55)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#89E900"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 30px rgba(137,233,0,0.3)"; }}
            >
              <Sparkles className="h-4 w-4" />
              Get Started Free
            </Link>
            <Link to="/pricing"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-[15px] font-medium border transition-all duration-150"
              style={{ color: "#8A8F9E", borderColor: "#1E2028" }}
            >
              View Pricing <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-16 px-6" style={{ borderColor: "#1E2028", background: "#0A0C11" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <BizentoIcon size={28} />
                <span className="font-black text-[16px]" style={{ color: "#F0EBD8" }}>
                  Bizento<span style={{ color: "#89E900" }}>.</span>
                </span>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: "#8A8F9E" }}>
                AI-powered product photography and creative automation for modern brands.
              </p>
              <div className="flex gap-3 mt-5">
                {[Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                  <button key={i} className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/8"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#8A8F9E" }}>
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category}>
                <p className="text-[12px] font-bold uppercase tracking-wider mb-4" style={{ color: "#8A8F9E" }}>{category}</p>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <button className="text-[13px] transition-colors" style={{ color: "rgba(138,143,158,0.6)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#E8EAF0")}
                        onMouseLeave={e => (e.currentTarget.style.color = "rgba(138,143,158,0.6)")}
                      >{link}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t gap-4" style={{ borderColor: "#1E2028" }}>
            <p className="text-[13px]" style={{ color: "rgba(138,143,158,0.45)" }}>
              © {new Date().getFullYear()} Bizento AI. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#89E900" }} />
              <span className="text-[12px]" style={{ color: "rgba(137,233,0,0.6)" }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
