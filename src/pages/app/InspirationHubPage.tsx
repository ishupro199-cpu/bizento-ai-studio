import { useState } from "react";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["All", "Catalog", "Ads", "CGI", "Fashion", "Lifestyle", "Minimal"];

const INSPIRATIONS = [
  {
    id: 1,
    title: "Amazon Best Seller Look",
    description: "Clean white background with perfect shadows and product isolation — optimized for marketplace listings.",
    category: "Catalog",
    label: "High Conversion",
    gradient: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    accentColor: "#222222",
    prompt: "Clean white background product photography with soft shadow, ecommerce catalog style, sharp focus, minimal",
    bgDark: false,
  },
  {
    id: 2,
    title: "Premium Brand Style",
    description: "Luxury marble surfaces with golden hour lighting that elevates any product to premium positioning.",
    category: "Catalog",
    label: "Premium Brand",
    gradient: "linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)",
    accentColor: "#ffffff",
    prompt: "Luxury marble studio, gold reflections, premium product placement, elegant shadows, editorial photography",
    bgDark: true,
  },
  {
    id: 3,
    title: "Cinematic Ad Style",
    description: "Hollywood-grade CGI visuals that turn your product into a cinematic hero shot.",
    category: "CGI",
    label: "Cinematic CGI",
    gradient: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 40%, #2d1b69 100%)",
    accentColor: "#89E900",
    prompt: "Cinematic CGI product advertisement, dramatic volumetric lighting, 4K quality, Hollywood style",
    bgDark: true,
  },
  {
    id: 4,
    title: "Neon Futuristic Drop",
    description: "Cyberpunk neon aesthetic with electric colors — perfect for tech and youth-oriented brands.",
    category: "Ads",
    label: "Viral Ad Style",
    gradient: "linear-gradient(135deg, #0d0221 0%, #0a1045 30%, #190041 60%, #2d0041 100%)",
    accentColor: "#ff00ff",
    prompt: "Neon cyberpunk product shot, purple and cyan glow, dark background, futuristic aesthetic, RGB lighting",
    bgDark: true,
  },
  {
    id: 5,
    title: "Floral Lifestyle",
    description: "Fresh botanical settings with natural light for wellness, beauty and lifestyle products.",
    category: "Lifestyle",
    label: "Lifestyle Feel",
    gradient: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 40%, #e8f5e9 100%)",
    accentColor: "#333333",
    prompt: "Fresh flowers surrounding product, soft petals, botanical garden, pastel tones, natural light, spring",
    bgDark: false,
  },
  {
    id: 6,
    title: "Beach Summer Campaign",
    description: "Sun-drenched golden hour on sandy beaches — perfect for summer product campaigns.",
    category: "Lifestyle",
    label: "Summer Campaign",
    gradient: "linear-gradient(135deg, #0077b6 0%, #00b4d8 40%, #f9c74f 100%)",
    accentColor: "#ffffff",
    prompt: "Sunny beach environment, golden sand, ocean waves background, warm tropical light, summer lifestyle",
    bgDark: true,
  },
  {
    id: 7,
    title: "Fashion Runway Look",
    description: "High-fashion editorial styling with dramatic lighting and model-inspired compositions.",
    category: "Fashion",
    label: "Editorial Fashion",
    gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #111111 100%)",
    accentColor: "#ffffff",
    prompt: "High fashion editorial photography, dramatic studio lighting, vogue style, black background, luxury brand",
    bgDark: true,
  },
  {
    id: 8,
    title: "Minimal White Catalog",
    description: "Pure white backgrounds with crisp shadows — the universal standard for ecommerce listings.",
    category: "Minimal",
    label: "Marketplace Ready",
    gradient: "linear-gradient(135deg, #ffffff 0%, #f1f3f5 100%)",
    accentColor: "#222222",
    prompt: "Pure white seamless background, clean product isolation, minimalist styling, ecommerce standard, crisp shadows",
    bgDark: false,
  },
  {
    id: 9,
    title: "Social Media Ad Creative",
    description: "Scroll-stopping visuals designed for Instagram, Facebook and TikTok ad formats.",
    category: "Ads",
    label: "Social Media",
    gradient: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
    accentColor: "#ffffff",
    prompt: "Social media ad creative, vibrant colors, Instagram ready, eye-catching composition, product hero",
    bgDark: true,
  },
  {
    id: 10,
    title: "Floating CGI Product",
    description: "Gravity-defying floating product with particle effects — the trending visual style for premium brands.",
    category: "CGI",
    label: "Trending Style",
    gradient: "linear-gradient(135deg, #03045e 0%, #0077b6 50%, #00b4d8 100%)",
    accentColor: "#89E900",
    prompt: "Product floating in mid-air, particle effects, CGI quality, dramatic lighting, premium brand visual",
    bgDark: true,
  },
  {
    id: 11,
    title: "Rustic & Organic",
    description: "Natural wood and organic textures that communicate authenticity for food and wellness brands.",
    category: "Lifestyle",
    label: "Authentic Brand",
    gradient: "linear-gradient(135deg, #8b5e3c 0%, #c8965a 50%, #f0e6d3 100%)",
    accentColor: "#ffffff",
    prompt: "Rustic wooden table, organic textures, natural materials, warm light, authentic lifestyle, artisan",
    bgDark: true,
  },
  {
    id: 12,
    title: "Dark Luxury Cosmetics",
    description: "Moody dark backgrounds with dramatic lighting for premium cosmetics and fragrance brands.",
    category: "Fashion",
    label: "Luxury Cosmetics",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 50%, #2a1a2e 100%)",
    accentColor: "#d4af37",
    prompt: "Dark luxury background, dramatic spotlight, premium cosmetics styling, moody editorial, high-end brand",
    bgDark: true,
  },
];

export default function InspirationHubPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const navigate = useNavigate();

  const filtered = activeCategory === "All"
    ? INSPIRATIONS
    : INSPIRATIONS.filter((p) => p.category === activeCategory);

  const handleUsePrompt = (prompt: string) => {
    navigate("/app", { state: { prompt } });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Inspiration Hub</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Discover high-converting visual styles used by top ecommerce brands. Click any style to use it.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
              activeCategory === c
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8 hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl overflow-hidden border border-white/10 hover:border-primary/30 transition-all duration-300 cursor-pointer bg-white/3"
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleUsePrompt(item.prompt)}
          >
            {/* Visual Preview */}
            <div
              className="relative h-44 flex items-center justify-center overflow-hidden"
              style={{ background: item.gradient }}
            >
              {/* Abstract product silhouette */}
              <div
                className="relative z-10 flex flex-col items-center gap-2 transition-transform duration-300 group-hover:scale-105"
              >
                <div
                  className="w-16 h-20 rounded-xl opacity-30"
                  style={{
                    background: item.bgDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.12)",
                    boxShadow: item.bgDark
                      ? "0 8px 32px rgba(255,255,255,0.1)"
                      : "0 8px 32px rgba(0,0,0,0.15)",
                  }}
                />
              </div>

              {/* Overlay with CTA on hover */}
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-200 ${
                  hoveredId === item.id ? "opacity-100" : "opacity-0"
                }`}
              >
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black"
                  style={{ background: "#89E900" }}>
                  <Play className="h-3.5 w-3.5" />
                  Use This Style
                </button>
              </div>

              {/* Label badge */}
              <div className="absolute top-3 left-3">
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide"
                  style={{
                    background: item.bgDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
                    color: item.bgDark ? "#ffffff" : "#222222",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {item.label}
                </span>
              </div>

              {/* Category badge */}
              <div className="absolute top-3 right-3">
                <span
                  className="text-[9px] font-medium px-2 py-1 rounded-full"
                  style={{
                    background: "rgba(137,233,0,0.2)",
                    color: "#89E900",
                    border: "1px solid rgba(137,233,0,0.3)",
                  }}
                >
                  {item.category}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground leading-snug">{item.title}</h3>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
