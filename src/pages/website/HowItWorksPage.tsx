import { Link } from "react-router-dom";
import {
  Sparkles, Upload, Wand2, Download, ChevronRight,
  Check, Play, ArrowRight, Star, Zap,
} from "lucide-react";
import { BizentoIcon } from "@/components/BizentoIcon";

const STEPS = [
  {
    num: "01",
    icon: Upload,
    color: "#89E900",
    title: "Upload your product photo",
    desc: "Drop in any product image — even a basic smartphone shot. Bizento AI works with any quality input. JPEG, PNG, or WebP.",
    tips: [
      "Use a photo where the product is clearly visible",
      "Any background works — we remove it automatically",
      "Minimum 400×400px recommended for best results",
      "Batch upload for multiple products at once",
    ],
    image: "/hero-product.png",
  },
  {
    num: "02",
    icon: Wand2,
    color: "#3B82F6",
    title: "Choose your style & describe your vision",
    desc: "Pick from 50+ professionally-designed templates or type a custom description. Our AI understands plain English — no technical skills needed.",
    tips: [
      "Choose from catalog, lifestyle, cinematic, or editorial styles",
      'Type prompts like "luxury marble background" or "outdoor summer vibe"',
      "Select Nano Bana Flash for speed or Pro for maximum detail",
      "Apply saved brand presets for instant consistency",
    ],
    image: "/gen-beauty-product.png",
  },
  {
    num: "03",
    icon: Download,
    color: "#8B5CF6",
    title: "Generate, refine & download",
    desc: "Bizento AI generates studio-quality visuals in seconds. Review, pick your favorites, and download at up to 4K resolution — ready to publish.",
    tips: [
      "Multiple variations generated per prompt",
      "One-click regenerate with different styles",
      "Download as PNG, JPEG, or WebP",
      "Export directly to Shopify, WooCommerce, or Amazon",
    ],
    image: "/gen-tech-product.png",
  },
];

const MODELS = [
  {
    name: "Nano Bana Flash",
    icon: Zap,
    badge: "Fast",
    badgeColor: "#89E900",
    desc: "Our fastest model — ideal for high-volume catalog processing and quick iterations. 1 credit per generation.",
    specs: [
      { label: "Speed", value: "~8 seconds" },
      { label: "Quality", value: "HD (up to 2K)" },
      { label: "Credits", value: "1 per image" },
      { label: "Best for", value: "Catalogs, batches" },
    ],
  },
  {
    name: "Nano Bana Pro",
    icon: Sparkles,
    badge: "Premium",
    badgeColor: "#8B5CF6",
    desc: "Our highest-quality model — for hero shots, ad creatives, and cinematic visuals where detail matters. 2 credits per generation.",
    specs: [
      { label: "Speed", value: "~20 seconds" },
      { label: "Quality", value: "Ultra HD (up to 4K)" },
      { label: "Credits", value: "2 per image" },
      { label: "Best for", value: "Hero shots, ads" },
    ],
  },
];

const COMPARE = [
  { title: "Traditional Photoshoot", items: ["Setup: 2–3 weeks lead time", "Cost: ₹500–₹5,000 per image", "Reshoots: expensive and slow", "Scale: bottlenecked by studio time", "Consistency: hard to maintain"], negative: true },
  { title: "Bizento AI", items: ["Setup: under 60 seconds", "Cost: from ₹2–₹10 per image", "Regenerate with one click", "Scale: unlimited, instant", "Consistency: guaranteed with presets"], negative: false },
];

const TESTIMONIALS = [
  { name: "Ananya Singh", role: "Product Manager, CraftKart", avatar: "A", quote: "The workflow is incredibly simple. Upload → pick style → download. It took me 3 minutes to process my first 20 SKUs." },
  { name: "Karan Mehta", role: "Founder, LuxeWear", avatar: "K", quote: "I was skeptical about AI quality. But the Pro model is genuinely indistinguishable from our previous studio shots — at 1/50th of the cost." },
];

function WebsiteNav() {
  return (
    <nav className="border-b" style={{ borderColor: "#1E2028", background: "rgba(13,15,20,0.95)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <BizentoIcon size={30} />
          <span className="text-[16px] font-black" style={{ color: "#F0EBD8" }}>
            Bizento<span style={{ color: "#89E900" }}>.</span>
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

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen font-bricolage" style={{ background: "#0D0F14", color: "#E8EAF0" }}>
      <WebsiteNav />

      {/* ── HERO ── */}
      <section className="py-24 px-6 text-center" style={{ background: "radial-gradient(ellipse at top, rgba(137,233,0,0.06) 0%, transparent 65%)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border text-[13px] font-medium"
            style={{ background: "rgba(137,233,0,0.07)", borderColor: "rgba(137,233,0,0.25)", color: "#89E900" }}>
            <Play className="h-3.5 w-3.5 fill-current" />
            Simple 3-Step Process
          </div>
          <h1 className="text-5xl md:text-[60px] font-extrabold leading-tight tracking-tight mb-6">
            Studio-quality visuals
            <br /><span style={{ color: "#89E900" }}>in 60 seconds</span>
          </h1>
          <p className="text-[17px] mb-10" style={{ color: "#8A8F9E" }}>
            No photoshoot booking. No expensive equipment. No design skills needed.
            <br />Just upload, describe, and download.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[15px] font-bold transition-all"
              style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 0 30px rgba(137,233,0,0.25)" }}>
              <Sparkles className="h-4 w-4" /> Try It Free
            </Link>
            <Link to="/features"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[15px] font-medium border hover:border-white/20 hover:text-white transition-all"
              style={{ color: "#8A8F9E", borderColor: "#1E2028" }}>
              See Features <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STEP-BY-STEP ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-24">
          {STEPS.map((step, idx) => (
            <div key={step.num}
              className={`flex flex-col ${idx % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-14 items-center`}>
              {/* Image */}
              <div className="flex-1 relative">
                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "#1E2028" }}>
                  <img src={step.image} alt={step.title} className="w-full aspect-[4/3] object-cover" />
                </div>
                <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-2xl flex items-center justify-center text-[22px] font-extrabold"
                  style={{ background: step.color, color: "#0D0F14", boxShadow: `0 8px 24px ${step.color}40` }}>
                  {step.num}
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
                  style={{ background: `${step.color}15`, border: `1px solid ${step.color}25`, color: step.color }}>
                  <step.icon className="h-3.5 w-3.5" />
                  Step {step.num}
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold leading-snug">{step.title}</h2>
                <p className="text-[16px] leading-relaxed" style={{ color: "#8A8F9E" }}>{step.desc}</p>
                <ul className="space-y-2.5">
                  {step.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-3 text-[14px]">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${step.color}15` }}>
                        <Check className="h-3 w-3" style={{ color: step.color }} />
                      </div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI MODELS ── */}
      <section className="py-24 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold">Choose your AI model</h2>
            <p className="mt-4 text-[16px]" style={{ color: "#8A8F9E" }}>Speed or quality — both are exceptional.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {MODELS.map((model) => (
              <div key={model.name}
                className="rounded-2xl border p-6 space-y-5 hover:border-[#89E900]/20 transition-all"
                style={{ background: "#12141A", borderColor: "#1E2028" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${model.badgeColor}15`, border: `1px solid ${model.badgeColor}25` }}>
                      <model.icon className="h-5 w-5" style={{ color: model.badgeColor }} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold">{model.name}</h3>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: `${model.badgeColor}15`, color: model.badgeColor, border: `1px solid ${model.badgeColor}25` }}>
                    {model.badge}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: "#8A8F9E" }}>{model.desc}</p>
                <div className="grid grid-cols-2 gap-3">
                  {model.specs.map((spec) => (
                    <div key={spec.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#8A8F9E" }}>{spec.label}</p>
                      <p className="text-[13px] font-semibold">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold">
              The old way vs. <span style={{ color: "#89E900" }}>the new way</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {COMPARE.map((col) => (
              <div key={col.title}
                className="rounded-2xl border p-6 space-y-4"
                style={{
                  background: col.negative ? "#12141A" : "rgba(137,233,0,0.04)",
                  borderColor: col.negative ? "#1E2028" : "rgba(137,233,0,0.2)",
                }}>
                <h3 className="text-[16px] font-bold" style={{ color: col.negative ? "#8A8F9E" : "#89E900" }}>{col.title}</h3>
                <ul className="space-y-3">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[13px]">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0`}
                        style={{ background: col.negative ? "rgba(255,70,70,0.1)" : "rgba(137,233,0,0.1)" }}>
                        {col.negative
                          ? <span style={{ color: "#FF4646", fontSize: 12, fontWeight: 700 }}>✕</span>
                          : <Check className="h-3 w-3" style={{ color: "#89E900" }} />
                        }
                      </div>
                      <span style={{ color: col.negative ? "#8A8F9E" : "#E8EAF0" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6" style={{ background: "#0A0C11" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-10">What users say after trying it</h2>
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
          <h2 className="text-4xl font-extrabold mb-4">See it for yourself</h2>
          <p className="text-[16px] mb-8" style={{ color: "#8A8F9E" }}>
            Try the full 3-step process now — completely free. 15 credits. No card required.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/signup"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-[15px] font-bold transition-all"
              style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 4px 24px rgba(137,233,0,0.3)" }}>
              <Sparkles className="h-4 w-4" /> Start Free
            </Link>
            <Link to="/features"
              className="flex items-center gap-2 px-7 py-4 rounded-2xl text-[15px] font-medium border hover:border-white/20 hover:text-white transition-all"
              style={{ color: "#8A8F9E", borderColor: "#1E2028" }}>
              View all features <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
