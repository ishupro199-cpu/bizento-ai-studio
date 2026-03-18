import { Link } from "react-router-dom";
import { PixaleraIcon } from "@/components/PixaleraIcon";
import { Play, Zap, Image, Film, Palette, ArrowRight, ChevronRight } from "lucide-react";
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
          <Link to="/signup" className="text-[13px] font-semibold px-4 py-2 rounded-xl transition-all" style={{ background: "#89E900", color: "#0D0F14" }}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

const DEMOS = [
  {
    id: "catalog",
    label: "Catalog Generator",
    icon: Image,
    color: "#a855f7",
    bg: "rgba(168,85,247,0.08)",
    before: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    after: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    prompt: "Clean white studio background, professional lighting, shadow beneath",
    time: "8s",
    credits: "5 credits",
  },
  {
    id: "photo",
    label: "Product Photography",
    icon: Zap,
    color: "#89E900",
    bg: "rgba(137,233,0,0.08)",
    before: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    after: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    prompt: "Marble surface, moody cinematic lighting, dark luxury backdrop",
    time: "6s",
    credits: "3 credits",
  },
  {
    id: "creative",
    label: "Ad Creatives",
    icon: Palette,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    before: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
    after: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
    prompt: "Summer campaign, vibrant colors, bold text overlay space",
    time: "5s",
    credits: "3 credits",
  },
  {
    id: "cinematic",
    label: "Cinematic Ads",
    icon: Film,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    before: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80",
    after: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80",
    prompt: "Cinematic beauty shot, golden hour glow, bokeh background",
    time: "12s",
    credits: "30 credits",
  },
];

export default function DemoPage() {
  const [active, setActive] = useState(0);
  const demo = DEMOS[active];

  return (
    <div className="min-h-screen" style={{ background: "#0D0F14", color: "#F0EBD8" }}>
      <WebsiteNav />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold mb-6"
          style={{ background: "rgba(137,233,0,0.1)", border: "1px solid rgba(137,233,0,0.2)", color: "#89E900" }}>
          <Play className="h-3.5 w-3.5" /> Interactive Demo
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
          See Pixalera <span style={{ color: "#89E900" }}>in action</span>
        </h1>
        <p className="text-[18px] max-w-2xl mx-auto mb-10" style={{ color: "#8A8F9E" }}>
          Pick a tool below and see how AI transforms a basic product photo into a stunning marketing asset — in seconds.
        </p>

        {/* Tool Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {DEMOS.map((d, i) => {
            const Icon = d.icon;
            return (
              <button key={d.id} onClick={() => setActive(i)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                style={{
                  background: active === i ? d.bg : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active === i ? d.color + "40" : "rgba(255,255,255,0.08)"}`,
                  color: active === i ? d.color : "#8A8F9E",
                }}>
                <Icon className="h-4 w-4" />{d.label}
              </button>
            );
          })}
        </div>

        {/* Demo Card */}
        <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Prompt bar */}
          <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
              <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#89E900" }} />
              <span className="text-[14px] flex-1 text-left" style={{ color: "#8A8F9E" }}>{demo.prompt}</span>
              <span className="text-[12px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: demo.bg, color: demo.color, border: `1px solid ${demo.color}30` }}>
                ⚡ {demo.credits}
              </span>
            </div>
          </div>
          {/* Before / After */}
          <div className="grid grid-cols-2 gap-0">
            <div className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#8A8F9E" }}>Before — Your photo</p>
              <div className="rounded-2xl overflow-hidden aspect-square" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <img src={demo.before} alt="Before" className="w-full h-full object-cover opacity-70" />
              </div>
            </div>
            <div className="p-6" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#89E900" }}>After — AI generated</p>
              <div className="rounded-2xl overflow-hidden aspect-square relative" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${demo.color}30` }}>
                <img src={demo.after} alt="After" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(13,15,20,0.6)" }}>
                  <div className="text-center">
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: demo.bg, border: `1px solid ${demo.color}40` }}>
                      <Play className="h-6 w-6" style={{ color: demo.color }} />
                    </div>
                    <p className="text-white font-bold">Try it live</p>
                    <p className="text-[12px] mt-1" style={{ color: "#8A8F9E" }}>Sign up free — {demo.credits}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Stats bar */}
          <div className="grid grid-cols-3 divide-x" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.06)" }}>
            {[["Generation time", demo.time], ["Cost", demo.credits], ["Resolution", "Up to 4K"]].map(([label, val]) => (
              <div key={label} className="py-4 text-center">
                <p className="text-[18px] font-black text-white">{val}</p>
                <p className="text-[11px]" style={{ color: "#8A8F9E" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-black mb-3">Ready to try it yourself?</h2>
        <p className="mb-8" style={{ color: "#8A8F9E" }}>Start free — 15 credits, no credit card required.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/signup" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] transition-all"
            style={{ background: "#89E900", color: "#0D0F14" }}>
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/pricing" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-[15px] transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EBD8" }}>
            See pricing <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
