import { Link } from "react-router-dom";
import {
  Sparkles, BookOpen, Video, FileText, HelpCircle,
  MessageCircle, ArrowRight, ChevronRight, Star,
  LayoutGrid, Camera, Clapperboard, Megaphone, Zap,
} from "lucide-react";
import { PixaleraIcon } from "@/components/PixaleraIcon";

const GUIDES = [
  {
    tag: "Getting Started",
    tagColor: "#89E900",
    title: "How to generate your first product photo in 60 seconds",
    desc: "A step-by-step walkthrough for new users — from upload to download in under a minute.",
    readTime: "3 min read",
    icon: Camera,
  },
  {
    tag: "Best Practices",
    tagColor: "#3B82F6",
    title: "10 tips for getting studio-quality catalog shots every time",
    desc: "Lighting, framing, prompt writing — the techniques that separate good outputs from great ones.",
    readTime: "7 min read",
    icon: LayoutGrid,
  },
  {
    tag: "Advanced",
    tagColor: "#8B5CF6",
    title: "Batch processing 500 SKUs: a complete workflow guide",
    desc: "How enterprise ecommerce teams use Pixalera AI to process thousands of products per week.",
    readTime: "10 min read",
    icon: Zap,
  },
  {
    tag: "Strategy",
    tagColor: "#F59E0B",
    title: "How to build a consistent visual brand with AI",
    desc: "Brand presets, style guides, and consistency techniques used by top D2C brands.",
    readTime: "6 min read",
    icon: Camera,
  },
  {
    tag: "Ads",
    tagColor: "#EC4899",
    title: "Creating high-converting Instagram ad creatives with AI",
    desc: "Format guides, CTA placement, and A/B testing strategies for paid social campaigns.",
    readTime: "8 min read",
    icon: Megaphone,
  },
  {
    tag: "Case Study",
    tagColor: "#89E900",
    title: "How StyleKart reduced photoshoot costs by 80%",
    desc: "A real-world breakdown of how one brand scaled their catalog from 200 to 2,000 images.",
    readTime: "5 min read",
    icon: Clapperboard,
  },
];

const VIDEOS = [
  { title: "Pixalera AI — 2-Minute Product Tour", duration: "2:14", thumbnail: "/hero-product.png" },
  { title: "Catalog Generator Walkthrough", duration: "5:30", thumbnail: "/gen-beauty-product.png" },
  { title: "AI Fashion Models — Full Demo", duration: "4:45", thumbnail: "/gen-fashion-product.png" },
  { title: "Batch Processing 100 SKUs Live", duration: "8:12", thumbnail: "/gen-tech-product.png" },
];

const FAQ = [
  { q: "How many credits does each generation use?", a: "Nano Bana Flash uses 1 credit per generation. Nano Bana Pro uses 2 credits and delivers higher detail and realism." },
  { q: "Can I use Pixalera AI for fashion with human models?", a: "Yes. Our AI Fashion Model tool lets you dress AI-generated models in your clothing, with full control over model appearance and styling." },
  { q: "What image size should I upload?", a: "For best results, upload images at 1000×1000px or larger, in JPEG or PNG format. The subject should be clearly visible with minimal background clutter." },
  { q: "How do I cancel my subscription?", a: "You can cancel anytime from Settings → Plan → Cancel Plan. Your credits remain active until the end of your billing period." },
  { q: "Is there a refund policy?", a: "Yes — all paid plans have a 14-day satisfaction guarantee. Contact support within 14 days of your first payment for a full refund." },
];

function WebsiteNav() {
  return (
    <nav className="border-b" style={{ borderColor: "#1E2028", background: "rgba(13,15,20,0.95)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <PixaleraIcon size={30} />
          <span className="text-[16px] font-black" style={{ color: "#F0EBD8" }}>
            Pixalera<span style={{ color: "#89E900" }}>.</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/features" className="text-[13px] font-medium hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Features</Link>
          <Link to="/pricing" className="text-[13px] font-medium hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Pricing</Link>
          <Link to="/login" className="text-[13px] font-medium hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Log in</Link>
          <Link to="/signup"
            className="text-[13px] font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: "#89E900", color: "#0D0F14" }}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen font-bricolage" style={{ background: "#0D0F14", color: "#E8EAF0" }}>
      <WebsiteNav />

      {/* ── HERO ── */}
      <section className="py-24 px-6 text-center" style={{ background: "radial-gradient(ellipse at top, rgba(137,233,0,0.05) 0%, transparent 65%)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border text-[13px] font-medium"
            style={{ background: "rgba(137,233,0,0.07)", borderColor: "rgba(137,233,0,0.25)", color: "#89E900" }}>
            <BookOpen className="h-3.5 w-3.5" />
            Resources & Guides
          </div>
          <h1 className="text-5xl md:text-[60px] font-extrabold leading-tight tracking-tight mb-6">
            Learn, explore,
            <br /><span style={{ color: "#89E900" }}>create better</span>
          </h1>
          <p className="text-[17px] mb-10" style={{ color: "#8A8F9E" }}>
            Guides, tutorials, and case studies to help you get the most out of Pixalera AI.
          </p>
        </div>
      </section>

      {/* ── RESOURCE CATEGORIES ── */}
      <section className="pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { icon: BookOpen, label: "Guides", active: true },
              { icon: Video, label: "Video Tutorials", active: false },
              { icon: FileText, label: "Case Studies", active: false },
              { icon: HelpCircle, label: "Help Center", active: false },
              { icon: MessageCircle, label: "Community", active: false },
            ].map(({ icon: Icon, label, active }) => (
              <button key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium border transition-all"
                style={active
                  ? { background: "#89E900", color: "#0D0F14", borderColor: "#89E900" }
                  : { background: "rgba(255,255,255,0.04)", borderColor: "#1E2028", color: "#8A8F9E" }
                }>
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUIDES GRID ── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-extrabold mb-8">Popular guides</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {GUIDES.map((guide) => (
              <div key={guide.title}
                className="rounded-2xl border p-5 group hover:border-[#89E900]/20 transition-all cursor-pointer"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ color: guide.tagColor, background: `${guide.tagColor}15`, border: `1px solid ${guide.tagColor}25` }}>
                    {guide.tag}
                  </span>
                  <span className="text-[11px]" style={{ color: "#8A8F9E" }}>{guide.readTime}</span>
                </div>
                <h3 className="text-[15px] font-bold mb-2 leading-snug group-hover:text-white transition-colors">{guide.title}</h3>
                <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#8A8F9E" }}>{guide.desc}</p>
                <div className="flex items-center gap-1 text-[12px] font-medium" style={{ color: "#89E900" }}>
                  Read guide <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEOS ── */}
      <section className="py-20 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-extrabold">Video tutorials</h2>
            <button className="text-[13px] font-medium flex items-center gap-1 hover:text-white transition-colors" style={{ color: "#89E900" }}>
              View all <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VIDEOS.map((vid) => (
              <div key={vid.title}
                className="rounded-2xl border overflow-hidden group hover:border-[#89E900]/20 transition-all cursor-pointer"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className="aspect-video relative overflow-hidden">
                  <img src={vid.thumbnail} alt={vid.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.4)" }}>
                    <div className="h-11 w-11 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                      style={{ background: "rgba(137,233,0,0.9)" }}>
                      <svg className="h-5 w-5 ml-0.5" fill="#0D0F14" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 text-[11px] font-bold px-2 py-0.5 rounded-md"
                    style={{ background: "rgba(0,0,0,0.8)", color: "#fff" }}>{vid.duration}</div>
                </div>
                <div className="p-3">
                  <p className="text-[13px] font-semibold leading-snug">{vid.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold mb-3">Help Center</h2>
            <p className="text-[16px]" style={{ color: "#8A8F9E" }}>Quick answers to common questions.</p>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details key={i}
                className="rounded-2xl border group"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <summary
                  className="flex items-center justify-between px-5 py-4 cursor-pointer list-none text-[15px] font-semibold"
                  style={{ outline: "none" }}>
                  {item.q}
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" style={{ color: "#8A8F9E" }} />
                </summary>
                <div className="px-5 pb-4 text-[14px] leading-relaxed" style={{ color: "#8A8F9E" }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border p-6 text-center"
            style={{ background: "rgba(137,233,0,0.04)", borderColor: "rgba(137,233,0,0.12)" }}>
            <MessageCircle className="h-8 w-8 mx-auto mb-3" style={{ color: "#89E900" }} />
            <h3 className="text-[17px] font-bold mb-2">Still have questions?</h3>
            <p className="text-[14px] mb-4" style={{ color: "#8A8F9E" }}>Our support team usually replies within a few hours.</p>
            <button
              className="px-6 py-2.5 rounded-xl text-[14px] font-semibold transition-all hover:opacity-90"
              style={{ background: "#89E900", color: "#0D0F14" }}>
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-3xl mx-auto text-center rounded-2xl border py-14 px-8"
          style={{ background: "linear-gradient(135deg, rgba(137,233,0,0.05) 0%, rgba(137,233,0,0.02) 100%)", borderColor: "rgba(137,233,0,0.15)" }}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to get started?</h2>
          <p className="text-[16px] mb-8" style={{ color: "#8A8F9E" }}>15 free credits. No card needed.</p>
          <Link to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-[15px] font-bold transition-all"
            style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 4px 24px rgba(137,233,0,0.3)" }}>
            <Sparkles className="h-4 w-4" /> Try Pixalera AI Free
          </Link>
        </div>
      </section>

    </div>
  );
}
