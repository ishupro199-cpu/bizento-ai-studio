import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Spin } from "antd";
import {
  SparklesIcon,
  PlayIcon,
  ArrowRightIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

const CATEGORIES = ["All", "Catalog", "Ads", "CGI", "Fashion", "Lifestyle", "Minimal", "Luxury", "Tech"];

const TIER_ORDER: Record<string, number> = { free: 0, starter: 1, pro: 2 };

const STATIC_FALLBACK = [
  { id: "s1", title: "Amazon Best Seller Look", description: "Clean white background with perfect shadows — optimized for marketplace listings.", category: "Catalog", label: "High Conversion", gradient: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)", accentColor: "#222222", prompt: "Clean white background product photography with soft shadow, ecommerce catalog style, sharp focus, minimal", bgDark: false, tier: "free", published: true },
  { id: "s2", title: "Premium Brand Style", description: "Luxury marble surfaces with golden hour lighting that elevates any product.", category: "Catalog", label: "Premium Brand", gradient: "linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)", accentColor: "#ffffff", prompt: "Luxury marble studio, gold reflections, premium product placement, elegant shadows, editorial photography", bgDark: true, tier: "free", published: true },
  { id: "s3", title: "Cinematic Ad Style", description: "Hollywood-grade CGI visuals that turn your product into a cinematic hero shot.", category: "CGI", label: "Cinematic CGI", gradient: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 40%, #2d1b69 100%)", accentColor: "#89E900", prompt: "Cinematic CGI product advertisement, dramatic volumetric lighting, 4K quality, Hollywood style", bgDark: true, tier: "starter", published: true },
  { id: "s4", title: "Neon Futuristic Drop", description: "Cyberpunk neon aesthetic with electric colors — perfect for tech and youth-oriented brands.", category: "Ads", label: "Viral Ad Style", gradient: "linear-gradient(135deg, #0d0221 0%, #0a1045 30%, #190041 60%, #2d0041 100%)", accentColor: "#ff00ff", prompt: "Neon cyberpunk product shot, purple and cyan glow, dark background, futuristic aesthetic, RGB lighting", bgDark: true, tier: "starter", published: true },
  { id: "s5", title: "Floral Lifestyle", description: "Fresh botanical settings with natural light for wellness, beauty and lifestyle products.", category: "Lifestyle", label: "Lifestyle Feel", gradient: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 40%, #e8f5e9 100%)", accentColor: "#333333", prompt: "Fresh flowers surrounding product, soft petals, botanical garden, pastel tones, natural light, spring", bgDark: false, tier: "free", published: true },
  { id: "s6", title: "Beach Summer Campaign", description: "Sun-drenched golden hour on sandy beaches — perfect for summer product campaigns.", category: "Lifestyle", label: "Summer Campaign", gradient: "linear-gradient(135deg, #0077b6 0%, #00b4d8 40%, #f9c74f 100%)", accentColor: "#ffffff", prompt: "Sunny beach environment, golden sand, ocean waves background, warm tropical light, summer lifestyle", bgDark: true, tier: "free", published: true },
  { id: "s7", title: "Fashion Runway Look", description: "High-fashion editorial styling with dramatic lighting and model-inspired compositions.", category: "Fashion", label: "Editorial Fashion", gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #111111 100%)", accentColor: "#ffffff", prompt: "High fashion editorial photography, dramatic studio lighting, vogue style, black background, luxury brand", bgDark: true, tier: "pro", published: true },
  { id: "s8", title: "Dark Luxury Cosmetics", description: "Moody dark backgrounds with dramatic lighting for premium cosmetics and fragrance brands.", category: "Fashion", label: "Luxury Cosmetics", gradient: "linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 50%, #2a1a2e 100%)", accentColor: "#d4af37", prompt: "Dark luxury background, dramatic spotlight, premium cosmetics styling, moody editorial, high-end brand", bgDark: true, tier: "pro", published: true },
];

interface InspirationPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  label: string;
  gradient: string;
  bgDark: boolean;
  published: boolean;
  tier: string;
  imageUrl?: string;
  accentColor: string;
}

export default function InspirationHubPage() {
  const [prompts, setPrompts] = useState<InspirationPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const userTier = "free";

  useEffect(() => {
    const q = query(
      collection(db, "inspirationPrompts"),
      where("published", "==", true),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as InspirationPrompt));
      setPrompts(items.length > 0 ? items : STATIC_FALLBACK);
      setLoading(false);
    }, () => {
      setPrompts(STATIC_FALLBACK);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const userTierLevel = TIER_ORDER[userTier] ?? 0;

  const accessible = prompts.filter(p => {
    const tierLevel = TIER_ORDER[p.tier] ?? 0;
    return tierLevel <= userTierLevel;
  });

  const locked = prompts.filter(p => {
    const tierLevel = TIER_ORDER[p.tier] ?? 0;
    return tierLevel > userTierLevel;
  });

  const allVisible = [...accessible, ...locked];

  const filtered = activeCategory === "All"
    ? allVisible
    : allVisible.filter(p => p.category === activeCategory);

  const handleUsePrompt = (p: InspirationPrompt) => {
    const tierLevel = TIER_ORDER[p.tier] ?? 0;
    if (tierLevel > userTierLevel) {
      navigate("/app/plan");
      return;
    }
    navigate("/app", { state: { prompt: p.prompt } });
  };

  const isLocked = (p: InspirationPrompt) => (TIER_ORDER[p.tier] ?? 0) > userTierLevel;

  const tierBadgeColor: Record<string, string> = {
    free: "#6b7280",
    starter: "#60a5fa",
    pro: "#a78bfa",
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <LightBulbIcon className="h-5 w-5" style={{ color: "#89E900" }} />
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "#fff" }}>Inspiration Hub</h1>
        </div>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          Discover high-converting visual styles used by top ecommerce brands. Click any style to use it.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: activeCategory === c ? "rgba(137,233,0,0.12)" : "rgba(255,255,255,0.05)",
              color: activeCategory === c ? "#89E900" : "rgba(255,255,255,0.55)",
              border: `1px solid ${activeCategory === c ? "rgba(137,233,0,0.3)" : "rgba(255,255,255,0.10)"}`,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => {
            const locked = isLocked(item);
            return (
              <div
                key={item.id}
                className="group rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  opacity: locked ? 0.65 : 1,
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleUsePrompt(item)}
              >
                <div
                  className="relative overflow-hidden"
                  style={{ height: 160, background: item.gradient }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-14 h-20 rounded-xl opacity-25 transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: item.bgDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.12)",
                          boxShadow: item.bgDark ? "0 8px 32px rgba(255,255,255,0.1)" : "0 8px 32px rgba(0,0,0,0.15)",
                        }}
                      />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
                    style={{
                      background: "rgba(0,0,0,0.55)",
                      opacity: hoveredId === item.id ? 1 : 0,
                    }}
                  >
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: locked ? "#a78bfa" : "#89E900", color: "#000" }}
                    >
                      {locked ? (
                        <>
                          <SparklesIcon className="h-3.5 w-3.5" />
                          Upgrade to Use
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-3.5 w-3.5" />
                          Use This Style
                        </>
                      )}
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

                  {/* Tier badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className="text-[9px] font-semibold px-2 py-1 rounded-full uppercase"
                      style={{
                        background: `${tierBadgeColor[item.tier] || "#6b7280"}25`,
                        color: tierBadgeColor[item.tier] || "#6b7280",
                        border: `1px solid ${tierBadgeColor[item.tier] || "#6b7280"}40`,
                      }}
                    >
                      {item.tier}
                    </span>
                  </div>

                  {/* Lock overlay */}
                  {locked && (
                    <div
                      className="absolute inset-0 flex items-end justify-center pb-3"
                      style={{ pointerEvents: "none" }}
                    >
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)", backdropFilter: "blur(8px)" }}>
                        🔒 {item.tier.charAt(0).toUpperCase() + item.tier.slice(1)} Plan
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-snug" style={{ color: "#fff" }}>{item.title}</h3>
                    <ArrowRightIcon
                      className="h-3.5 w-3.5 shrink-0 mt-0.5 transition-colors"
                      style={{ color: hoveredId === item.id ? "#89E900" : "rgba(255,255,255,0.25)" }}
                    />
                  </div>
                  <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <LightBulbIcon className="h-10 w-10" style={{ color: "rgba(255,255,255,0.2)" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No prompts in this category yet</p>
        </div>
      )}
    </div>
  );
}
