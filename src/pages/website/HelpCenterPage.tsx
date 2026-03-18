import { Link } from "react-router-dom";
import { PixaleraIcon } from "@/components/PixaleraIcon";
import { Search, BookOpen, Zap, CreditCard, Settings, Image, MessageCircle, ChevronRight } from "lucide-react";
import { useState } from "react";

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
          <Link to="/pricing" className="text-[13px] font-medium hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Pricing</Link>
          <Link to="/login" className="text-[13px] font-medium hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Log in</Link>
          <Link to="/signup" className="text-[13px] font-semibold px-4 py-2 rounded-xl" style={{ background: "#89E900", color: "#0D0F14" }}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

const CATEGORIES = [
  {
    icon: Zap, label: "Getting Started", color: "#89E900", bg: "rgba(137,233,0,0.08)",
    articles: ["How to upload your first product image", "Understanding credit costs", "Choosing the right tool", "Your first catalog generation"],
  },
  {
    icon: Image, label: "AI Tools", color: "#a855f7", bg: "rgba(168,85,247,0.08)",
    articles: ["Catalog Generator guide", "Product Photography prompts", "Ad Creative best practices", "Cinematic Ads (Pro)"],
  },
  {
    icon: CreditCard, label: "Credits & Billing", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",
    articles: ["How credits work", "Plan comparison", "Upgrading your plan", "Credit top-ups and add-ons"],
  },
  {
    icon: BookOpen, label: "Guides & Tips", color: "#3b82f6", bg: "rgba(59,130,246,0.08)",
    articles: ["Writing better prompts", "Optimal image upload sizes", "Exporting for different platforms", "Batch generation workflow"],
  },
  {
    icon: Settings, label: "Account", color: "#10b981", bg: "rgba(16,185,129,0.08)",
    articles: ["Changing your email or password", "Team & multi-seat access", "API access (coming soon)", "Deleting your account"],
  },
  {
    icon: MessageCircle, label: "Troubleshooting", color: "#ef4444", bg: "rgba(239,68,68,0.08)",
    articles: ["Generation failed — what to do", "Image not loading", "Credits not deducted correctly", "Contacting support"],
  },
];

const POPULAR = [
  "How credits are calculated",
  "Best image formats to upload",
  "Why is my generation blurry?",
  "Can I use generated images commercially?",
  "How do I cancel my plan?",
  "What file sizes are supported?",
];

export default function HelpCenterPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen" style={{ background: "#0D0F14", color: "#F0EBD8" }}>
      <WebsiteNav />

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-12" style={{ background: "linear-gradient(180deg, rgba(137,233,0,0.04) 0%, transparent 100%)" }}>
        <h1 className="text-5xl font-black mb-3">Help Center</h1>
        <p className="text-[17px] mb-8" style={{ color: "#8A8F9E" }}>Find answers, guides, and everything you need to get the most out of Pixalera.</p>
        <div className="max-w-xl mx-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <Search className="h-5 w-5 shrink-0" style={{ color: "#8A8F9E" }} />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search articles, guides, FAQs..."
            className="flex-1 bg-transparent text-[15px] text-white placeholder-[#8A8F9E] outline-none"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-[14px] font-bold uppercase tracking-wider mb-6" style={{ color: "#8A8F9E" }}>Browse by topic</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.label} className="rounded-2xl p-5 transition-all hover:scale-[1.01] cursor-pointer"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: cat.bg, border: `1px solid ${cat.color}30` }}>
                    <Icon className="h-5 w-5" style={{ color: cat.color }} />
                  </div>
                  <h3 className="text-[15px] font-bold text-white">{cat.label}</h3>
                </div>
                <ul className="space-y-2">
                  {cat.articles.map(a => (
                    <li key={a}>
                      <button className="text-[13px] text-left flex items-center gap-1.5 transition-colors hover:text-white"
                        style={{ color: "#8A8F9E" }}>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />{a}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-[14px] font-bold uppercase tracking-wider mb-4" style={{ color: "#8A8F9E" }}>Popular questions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {POPULAR.map(q => (
            <button key={q} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all hover:bg-white/5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <BookOpen className="h-4 w-4 shrink-0" style={{ color: "#89E900" }} />
              <span className="text-[13px] text-white">{q}</span>
              <ChevronRight className="h-4 w-4 ml-auto shrink-0" style={{ color: "#8A8F9E" }} />
            </button>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-2xl mx-auto px-6 py-12 text-center">
        <div className="rounded-2xl p-8" style={{ background: "rgba(137,233,0,0.05)", border: "1px solid rgba(137,233,0,0.15)" }}>
          <MessageCircle className="h-10 w-10 mx-auto mb-4" style={{ color: "#89E900" }} />
          <h3 className="text-xl font-black mb-2">Still need help?</h3>
          <p className="text-[14px] mb-6" style={{ color: "#8A8F9E" }}>Our support team typically replies within a few hours.</p>
          <a href="mailto:support@pixalera.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[14px]"
            style={{ background: "#89E900", color: "#0D0F14" }}>
            Contact support
          </a>
        </div>
      </section>
    </div>
  );
}
