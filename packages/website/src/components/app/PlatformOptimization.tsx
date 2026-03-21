import { useState } from "react";
import { Check, Loader2, Sparkles, Copy, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CatalogSEO } from "@/lib/generationApi";

const PLATFORMS = [
  { id: "amazon",    name: "Amazon",    color: "#FF9900", textColor: "#000" },
  { id: "flipkart",  name: "Flipkart",  color: "#2874F0", textColor: "#fff" },
  { id: "meesho",    name: "Meesho",    color: "#F43397", textColor: "#fff" },
  { id: "myntra",    name: "Myntra",    color: "#FF3F6C", textColor: "#fff" },
  { id: "instagram", name: "Instagram", color: "#E1306C", textColor: "#fff" },
];

type PlatformContent = {
  title: string;
  bulletPoints: string[];
  description: string;
  keywords: string[];
  attributes: Record<string, string>;
};

function generatePlatformContent(prompt: string, platform: string): PlatformContent {
  const productName = prompt.split(" ").slice(0, 3).join(" ");

  const baseContent: Record<string, PlatformContent> = {
    amazon: {
      title: `${productName} - Premium Quality | Fast Delivery | Best Price Guaranteed`,
      bulletPoints: [
        "✅ PREMIUM QUALITY MATERIALS: Crafted with superior grade materials ensuring exceptional durability and long-lasting performance",
        "✅ PERFECT FOR GIFTING: Elegant packaging makes this an ideal gift for all occasions — birthdays, anniversaries, and festive celebrations",
        "✅ VERSATILE USE: Suitable for everyday use, professional settings, and special occasions with a design that complements any environment",
        "✅ HASSLE-FREE RETURNS: Shop with confidence — 30-day easy returns and replacement policy backed by Amazon A-to-Z guarantee",
        "✅ TRUSTED SELLER: Fulfilled by Amazon with 10,000+ verified 5-star reviews from satisfied customers across India",
      ],
      description: `Introducing our ${productName} — where premium craftsmanship meets everyday functionality. Designed for discerning customers who refuse to compromise on quality.`,
      keywords: ["premium quality", "fast delivery", "best seller", "top rated", "value for money"],
      attributes: {
        "Brand": "Pixalera Premium",
        "Material": "Premium Grade",
        "Color": "As Shown",
        "Dimensions": "Standard Size",
        "Weight": "Lightweight",
        "Package Contents": "1 Unit + Accessories",
      },
    },
    flipkart: {
      title: `${productName} | SuperCoin Eligible | Flipkart Smart Buy | EMI Available`,
      bulletPoints: [
        "⚡ BEST IN SEGMENT: Top-rated product in its category with lakhs of satisfied customers across India",
        "⚡ EMI AVAILABLE: Easy 0% EMI options on all major banks and credit cards — own it today, pay later",
        "⚡ FLIPKART ASSURED: Thoroughly quality-checked product with 7-day replacement guarantee",
        "⚡ INSTANT DELIVERY: Available for same-day delivery in select cities — get it when you need it",
        "⚡ SUPERCOIN REWARDS: Earn SuperCoins on this purchase and redeem for future discounts",
      ],
      description: `Get the best deal on ${productName} exclusively on Flipkart! This Flipkart Smart Buy certified product has been rigorously tested to meet the highest quality standards.`,
      keywords: ["flipkart assured", "best deal india", "emi available", "top rated", "supercoin eligible"],
      attributes: {
        "Warranty": "1 Year Manufacturer",
        "Return Policy": "7 Days Easy Return",
        "Delivery": "Flipkart Assured",
        "Payment": "EMI Available",
        "Brand": "Pixalera",
        "Rating": "4.5★ & Above",
      },
    },
    meesho: {
      title: `${productName} - Trendy | Affordable | Free Delivery | COD Available`,
      bulletPoints: [
        "🛍️ SUPER AFFORDABLE: Best price you'll find anywhere — quality products at prices that make sense",
        "🛍️ FREE DELIVERY: Completely free shipping on all orders — no minimum order value required",
        "🛍️ CASH ON DELIVERY: Pay when you receive — shop with zero risk and complete peace of mind",
        "🛍️ TRENDY DESIGN: Latest styles and designs that are trending on social media right now",
        "🛍️ EASY RETURNS: Simple 7-day returns process — your satisfaction is our top priority",
      ],
      description: `Shop the trendiest ${productName} at the most affordable price on Meesho! With free delivery across India and Cash on Delivery available, shopping has never been easier.`,
      keywords: ["affordable", "free delivery", "cod available", "trending", "best price"],
      attributes: {
        "Delivery": "Free Shipping",
        "Payment": "COD Available",
        "Return": "7 Days",
        "Style": "Trending",
        "Target": "All Ages",
        "Value": "Best Price",
      },
    },
    myntra: {
      title: `${productName} | New Season | Style Statement | Fashion Forward`,
      bulletPoints: [
        "👗 FASHION FORWARD: On-trend design that aligns with the latest runway and street style movements",
        "👗 PREMIUM FABRIC: Carefully selected materials that offer superior comfort and a luxurious feel all day",
        "👗 VERSATILE STYLING: Effortlessly transitions from casual day looks to elevated evening ensembles",
        "👗 MYNTRA ASSURED: Quality-verified with authentic product guarantee and easy exchange policy",
        "👗 STYLE INSPIRATION: Worn by top fashion influencers — be part of the style conversation",
      ],
      description: `Make a statement with our ${productName} — the season's most-wanted style piece. Curated for the fashion-conscious Indian consumer who understands that style is a form of self-expression.`,
      keywords: ["fashion forward", "trending style", "premium fabric", "myntra assured", "new season"],
      attributes: {
        "Season": "New Arrival",
        "Style": "Contemporary",
        "Fit": "Regular",
        "Care": "Easy Wash",
        "Occasion": "Versatile",
        "Brand Trust": "Myntra Assured",
      },
    },
    instagram: {
      title: `${productName} — Trending Now ✨ #ProductPhotography`,
      bulletPoints: [
        "📸 Scroll-stopping visuals designed for Instagram feed & Reels",
        "✨ Premium lifestyle aesthetic that drives saves and shares",
        "🛒 Link in bio — shop now via Instagram Shopping",
        "💬 DM for custom orders and bulk pricing",
        "🏷️ Use our hashtag and get featured on our page!",
      ],
      description: `${productName} is making waves on Instagram. Premium quality meets scroll-worthy aesthetics. Shop via the link in bio!`,
      keywords: ["#productphotography", "#instashop", "#trending", "#aesthetic", "#shopnow"],
      attributes: {
        "Format": "Feed Post + Story + Reel",
        "CTA": "Link in Bio",
        "Hashtags": "30 niche tags",
        "Caption Style": "Conversational",
        "Engagement": "Poll + Question sticker",
        "Collab": "Influencer ready",
      },
    },
  };

  return baseContent[platform] ?? baseContent.amazon;
}

function getRealPlatformContent(catalogSEO: CatalogSEO, platform: string): PlatformContent | null {
  const plat = (catalogSEO.platforms as any)[platform];
  if (!plat) return null;

  const bulletPoints: string[] = Array.isArray(plat.bulletPoints) ? plat.bulletPoints : [];
  const description = plat.caption || plat.description || "";
  const keywords: string[] = Array.isArray(plat.keywords) ? plat.keywords : [];

  return {
    title: plat.title || "",
    bulletPoints,
    description,
    keywords,
    attributes: plat.attributes || {},
  };
}

interface PlatformOptimizationProps {
  prompt: string;
  isPro: boolean;
  onClose: () => void;
  catalogSEO?: CatalogSEO | null;
}

export function PlatformOptimization({ prompt, isPro, onClose, catalogSEO }: PlatformOptimizationProps) {
  const hasRealData = !!catalogSEO;

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["amazon"]);
  const [activePlatform, setActivePlatform] = useState("amazon");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(hasRealData);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    bullets: true,
    description: false,
    keywords: false,
    attributes: false,
  });

  const availablePlatforms = hasRealData
    ? PLATFORMS
    : PLATFORMS;

  const togglePlatform = (id: string) => {
    if (!isPro) {
      setSelectedPlatforms([id]);
      setActivePlatform(id);
      return;
    }
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((p) => p !== id) : prev) : [...prev, id]
    );
    setActivePlatform(id);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setGenerating(false);
    setGenerated(true);
  };

  const getContent = (platform: string): PlatformContent => {
    if (hasRealData) {
      const real = getRealPlatformContent(catalogSEO!, platform);
      if (real && real.title) return real;
    }
    return generatePlatformContent(prompt, platform);
  };

  const content = getContent(activePlatform);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (!generated) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div>
          <h3 className="text-base font-bold text-foreground">Platform Optimization</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate platform-ready listings with SEO titles, bullet points, and conversion copy.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Platforms</p>
            {!isPro && (
              <span className="flex items-center gap-1 text-[10px] text-amber-400/80">
                <Lock className="h-2.5 w-2.5" />
                Free: 1 platform only
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availablePlatforms.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              const isLocked = !isPro && !isSelected && selectedPlatforms.length >= 1;
              return (
                <button
                  key={platform.id}
                  onClick={() => !isLocked && togglePlatform(platform.id)}
                  disabled={isLocked}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                    isSelected
                      ? "border-white/30 bg-white/8"
                      : isLocked
                      ? "border-white/5 bg-white/2 opacity-40 cursor-not-allowed"
                      : "border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/6"
                  }`}
                >
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: platform.color }} />
                  {platform.name}
                  {isSelected && <Check className="h-3 w-3 text-primary" />}
                </button>
              );
            })}
          </div>
          {!isPro && (
            <p className="text-[11px] text-muted-foreground/60">
              Upgrade to Pro to generate listings for all platforms simultaneously.
            </p>
          )}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || selectedPlatforms.length === 0}
          className="w-full gap-2 rounded-xl h-11"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating listing content...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Platform Listings
            </>
          )}
        </Button>
      </div>
    );
  }

  const shownPlatforms = hasRealData ? PLATFORMS : PLATFORMS.filter(p => selectedPlatforms.includes(p.id));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">
            {hasRealData ? "Platform SEO Listings" : "Platform Listings Ready"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {hasRealData ? "AI-generated SEO copy from product analysis" : "AI-optimized for high conversion on each platform"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-7 rounded-lg">
          Done
        </Button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {shownPlatforms.map((platform) => {
          const isLocked = !isPro && platform.id !== "amazon";
          return (
            <button
              key={platform.id}
              onClick={() => !isLocked && setActivePlatform(platform.id)}
              disabled={isLocked}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border ${
                activePlatform === platform.id
                  ? "border-white/30 bg-white/10"
                  : isLocked
                  ? "border-white/5 bg-white/2 opacity-35 cursor-not-allowed"
                  : "border-white/8 bg-white/3 hover:bg-white/6"
              }`}
            >
              <div className="h-2 w-2 rounded-full" style={{ background: platform.color }} />
              {platform.name}
              {isLocked && <Lock className="h-2.5 w-2.5 text-amber-500/70" />}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="bg-white/4 border border-white/8 rounded-xl p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1.5">SEO Title</p>
              <p className="text-sm text-foreground leading-snug">{content.title}</p>
              <p className="text-[9px] text-muted-foreground/40 mt-1">{content.title.length} chars</p>
            </div>
            <button
              onClick={() => copyText(content.title, "Title")}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {content.bulletPoints.length > 0 && (
          <CollapsibleSection
            title={`Bullet Points (${content.bulletPoints.length})`}
            expanded={expandedSections.bullets}
            onToggle={() => toggleSection("bullets")}
            onCopy={() => copyText(content.bulletPoints.join("\n"), "Bullet Points")}
          >
            <ul className="space-y-2">
              {content.bulletPoints.map((b, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed">{b}</li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {content.description && (
          <CollapsibleSection
            title="Product Description"
            expanded={expandedSections.description}
            onToggle={() => toggleSection("description")}
            onCopy={() => copyText(content.description, "Description")}
          >
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{content.description}</p>
          </CollapsibleSection>
        )}

        {content.keywords.length > 0 && (
          <CollapsibleSection
            title={`Keywords (${content.keywords.length})`}
            expanded={expandedSections.keywords}
            onToggle={() => toggleSection("keywords")}
            onCopy={() => copyText(content.keywords.join(", "), "Keywords")}
          >
            <div className="flex flex-wrap gap-1.5">
              {content.keywords.map((k: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  {k}
                </span>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {Object.keys(content.attributes).length > 0 && (
          <CollapsibleSection
            title="Product Attributes"
            expanded={expandedSections.attributes}
            onToggle={() => toggleSection("attributes")}
            onCopy={() => copyText(Object.entries(content.attributes).map(([k, v]) => `${k}: ${v}`).join("\n"), "Attributes")}
          >
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(content.attributes).map(([key, val]) => {
                const isAskUser = String(val).includes("Ask user");
                return (
                  <div key={key} className={`flex flex-col rounded-lg px-2.5 py-2 ${isAskUser ? "bg-amber-400/5 border border-amber-400/20" : "bg-white/3"}`}>
                    <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wide">{key}</span>
                    <span className={`text-xs font-medium mt-0.5 ${isAskUser ? "text-amber-400/80" : "text-foreground"}`}>
                      {isAskUser ? "⚠ Provide info" : String(val)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        )}
      </div>

      {hasRealData && (
        <p className="text-[9px] text-primary/50 text-center">
          AI-generated from product analysis · Copy each section to use in your listing
        </p>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  onCopy,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  onCopy: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5">
        <button onClick={onToggle} className="flex items-center gap-2 flex-1 text-left">
          <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">{title}</p>
          {expanded ? (
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
        <button
          onClick={onCopy}
          className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>
      {expanded && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}
