import { useState } from "react";
import { Check, Loader2, Sparkles, Copy, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PLATFORMS = [
  { id: "amazon", name: "Amazon", color: "#FF9900", textColor: "#000" },
  { id: "flipkart", name: "Flipkart", color: "#2874F0", textColor: "#fff" },
  { id: "meesho", name: "Meesho", color: "#F43397", textColor: "#fff" },
  { id: "myntra", name: "Myntra", color: "#FF3F6C", textColor: "#fff" },
  { id: "others", name: "Others", color: "#89E900", textColor: "#000" },
];

type PlatformContent = {
  title: string;
  bulletPoints: string[];
  description: string;
  keywords: string[];
  attributes: Record<string, string>;
  usps: string[];
  emotionalHook: string;
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
      description: `Introducing our ${productName} — where premium craftsmanship meets everyday functionality. Designed for discerning customers who refuse to compromise on quality, this product represents the perfect blend of aesthetics and performance.\n\nWhether you're purchasing for yourself or as a thoughtful gift, you'll appreciate the attention to detail in every aspect of this product. The superior materials used in construction ensure this isn't just a purchase — it's an investment that pays dividends every day.\n\nJoin thousands of satisfied Amazon customers who have already elevated their lifestyle. Order now and experience the difference that quality makes.`,
      keywords: ["premium quality", "fast delivery", "best seller", "top rated", "value for money"],
      attributes: {
        "Brand": "Pixalera Premium",
        "Material": "Premium Grade",
        "Color": "As Shown",
        "Dimensions": "Standard Size",
        "Weight": "Lightweight",
        "Package Contents": "1 Unit + Accessories",
      },
      usps: [
        "Amazon's Choice in its category",
        "10,000+ verified reviews",
        "30-day easy returns",
        "Fast Prime delivery",
      ],
      emotionalHook: "Stop settling for less. You deserve premium quality that matches your lifestyle. Every great day starts with the right products — and this is yours.",
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
      description: `Get the best deal on ${productName} exclusively on Flipkart! This Flipkart Smart Buy certified product has been rigorously tested to meet the highest quality standards.\n\nWith easy EMI options starting from ₹0 interest, there's no reason to wait. This product is Flipkart Assured — which means it has been quality-checked, properly packaged, and comes with a hassle-free 7-day replacement policy.\n\nThousands of happy customers have rated this product 4.5★ and above. Add to cart now and use SuperCoins for additional discounts!`,
      keywords: ["flipkart assured", "best deal india", "emi available", "top rated", "supercoin eligible"],
      attributes: {
        "Warranty": "1 Year Manufacturer",
        "Return Policy": "7 Days Easy Return",
        "Delivery": "Flipkart Assured",
        "Payment": "EMI Available",
        "Brand": "Pixalera",
        "Rating": "4.5★ & Above",
      },
      usps: [
        "Flipkart Assured quality",
        "7-day replacement",
        "EMI from ₹0 interest",
        "SuperCoin rewards",
      ],
      emotionalHook: "Smart buyers choose Flipkart. Get the best price, fastest delivery, and a 7-day replacement guarantee. Add to cart before it's sold out!",
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
      description: `Shop the trendiest ${productName} at the most affordable price on Meesho! We believe quality fashion and lifestyle shouldn't burn a hole in your pocket.\n\nThis product is loved by our community of 10 crore+ happy shoppers. With free delivery across India and Cash on Delivery available, shopping has never been easier or more accessible.\n\nShare with your friends and family — because everyone deserves great products at great prices. Order now and join the Meesho family!`,
      keywords: ["affordable", "free delivery", "cod available", "trending", "best price"],
      attributes: {
        "Delivery": "Free Shipping",
        "Payment": "COD Available",
        "Return": "7 Days",
        "Style": "Trending",
        "Target": "All Ages",
        "Value": "Best Price",
      },
      usps: [
        "Free delivery PAN India",
        "Cash on delivery",
        "Unbeatable prices",
        "Trending designs",
      ],
      emotionalHook: "Why pay more when Meesho has it for less? Free delivery, COD, easy returns — the complete package at an unbeatable price. Your community is loving it!",
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
      description: `Make a statement with our ${productName} — the season's most-wanted style piece. Curated for the fashion-conscious Indian consumer who understands that style is a form of self-expression.\n\nCrafted with premium materials and attention to detail, this piece effortlessly elevates any outfit. Whether you're styling for a casual brunch, a work day, or a special evening, this product delivers.\n\nFeatured in Myntra's Most Loved collection. Style it your way — share your look and inspire the community. Limited stock available.`,
      keywords: ["fashion forward", "trending style", "premium fabric", "myntra assured", "new season"],
      attributes: {
        "Season": "New Arrival",
        "Style": "Contemporary",
        "Fit": "Regular",
        "Care": "Easy Wash",
        "Occasion": "Versatile",
        "Brand Trust": "Myntra Assured",
      },
      usps: [
        "Trending style pick",
        "Myntra Assured quality",
        "Easy exchange",
        "Style community loved",
      ],
      emotionalHook: "Your style speaks before you do. This isn't just a product — it's a statement. Fashion-forward, quality-assured, and completely you. Limited pieces available.",
    },
    others: {
      title: `${productName} - Universal Listing | Multi-Platform Ready | SEO Optimized`,
      bulletPoints: [
        "🌟 UNIVERSAL QUALITY: Meets and exceeds quality standards across all major ecommerce platforms",
        "🌟 COMPLETE PACKAGE: Everything included — no hidden costs, no additional accessories needed",
        "🌟 CUSTOMER FIRST: 24/7 customer support with dedicated resolution team for any queries",
        "🌟 SECURE PACKAGING: Bubble-wrapped and double-boxed to ensure perfect delivery condition",
        "🌟 AUTHENTIC PRODUCT: 100% genuine product with manufacturer warranty and authenticity certificate",
      ],
      description: `Our ${productName} is designed to exceed expectations regardless of where you're shopping. We believe every customer deserves the best — premium quality, fair pricing, and outstanding service.\n\nThis product comes with complete documentation, genuine warranty, and our personal quality guarantee. We're committed to delivering not just a product, but a complete experience.\n\nThank you for choosing quality. Your satisfaction is our mission.`,
      keywords: ["genuine product", "warranty included", "premium quality", "secure delivery", "customer first"],
      attributes: {
        "Warranty": "Manufacturer Included",
        "Support": "24/7 Customer Care",
        "Packaging": "Secure & Premium",
        "Authenticity": "100% Genuine",
        "After Sales": "Full Support",
        "Certification": "Quality Tested",
      },
      usps: [
        "Universal platform ready",
        "Manufacturer warranty",
        "24/7 support",
        "Secure delivery",
      ],
      emotionalHook: "You deserve quality without compromise. This is more than a product — it's our commitment to your complete satisfaction. Order with confidence.",
    },
  };

  return baseContent[platform] ?? baseContent.others;
}

interface PlatformOptimizationProps {
  prompt: string;
  isPro: boolean;
  onClose: () => void;
}

export function PlatformOptimization({ prompt, isPro, onClose }: PlatformOptimizationProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["amazon"]);
  const [activePlatform, setActivePlatform] = useState("amazon");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    bullets: true,
    description: false,
    keywords: false,
    attributes: false,
    usps: false,
    hook: false,
  });

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
    await new Promise((r) => setTimeout(r, 2200));
    setGenerating(false);
    setGenerated(true);
  };

  const content = generatePlatformContent(prompt, activePlatform);

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

        {/* Platform Selection */}
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
            {PLATFORMS.map((platform) => {
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
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: platform.color }}
                  />
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

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">Platform Listings Ready</h3>
          <p className="text-xs text-muted-foreground mt-0.5">AI-optimized for high conversion on each platform</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-7 rounded-lg">
          Done
        </Button>
      </div>

      {/* Platform Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {selectedPlatforms.map((pid) => {
          const platform = PLATFORMS.find((p) => p.id === pid)!;
          return (
            <button
              key={pid}
              onClick={() => setActivePlatform(pid)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border ${
                activePlatform === pid
                  ? "border-white/30 bg-white/10"
                  : "border-white/8 bg-white/3 hover:bg-white/6"
              }`}
            >
              <div className="h-2 w-2 rounded-full" style={{ background: platform.color }} />
              {platform.name}
            </button>
          );
        })}
      </div>

      {/* Content Sections */}
      <div className="space-y-2">
        {/* SEO Title */}
        <div className="bg-white/4 border border-white/8 rounded-xl p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1.5">SEO Title</p>
              <p className="text-sm text-foreground leading-snug">{content.title}</p>
            </div>
            <button
              onClick={() => copyText(content.title, "Title")}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Bullet Points */}
        <CollapsibleSection
          title="Bullet Points"
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

        {/* Description */}
        <CollapsibleSection
          title="Product Description"
          expanded={expandedSections.description}
          onToggle={() => toggleSection("description")}
          onCopy={() => copyText(content.description, "Description")}
        >
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{content.description}</p>
        </CollapsibleSection>

        {/* Keywords */}
        <CollapsibleSection
          title="5 Keywords"
          expanded={expandedSections.keywords}
          onToggle={() => toggleSection("keywords")}
          onCopy={() => copyText(content.keywords.join(", "), "Keywords")}
        >
          <div className="flex flex-wrap gap-1.5">
            {content.keywords.map((k, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                {k}
              </span>
            ))}
          </div>
        </CollapsibleSection>

        {/* Attributes */}
        <CollapsibleSection
          title="Product Attributes"
          expanded={expandedSections.attributes}
          onToggle={() => toggleSection("attributes")}
          onCopy={() => copyText(Object.entries(content.attributes).map(([k, v]) => `${k}: ${v}`).join("\n"), "Attributes")}
        >
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(content.attributes).map(([key, val]) => (
              <div key={key} className="flex flex-col rounded-lg bg-white/3 px-2.5 py-2">
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wide">{key}</span>
                <span className="text-xs text-foreground font-medium mt-0.5">{val}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* USPs */}
        <CollapsibleSection
          title="Key Selling Points (USP)"
          expanded={expandedSections.usps}
          onToggle={() => toggleSection("usps")}
          onCopy={() => copyText(content.usps.join("\n"), "USPs")}
        >
          <div className="grid grid-cols-2 gap-1.5">
            {content.usps.map((usp, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-white/3 px-2.5 py-2">
                <Check className="h-3 w-3 text-primary shrink-0" />
                <span className="text-xs text-foreground">{usp}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Emotional Hook */}
        <CollapsibleSection
          title="Emotional Hook (Conversion)"
          expanded={expandedSections.hook}
          onToggle={() => toggleSection("hook")}
          onCopy={() => copyText(content.emotionalHook, "Emotional Hook")}
        >
          <p className="text-xs text-foreground/90 leading-relaxed italic border-l-2 border-primary/40 pl-3">{content.emotionalHook}</p>
        </CollapsibleSection>
      </div>
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
        <button
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 text-left"
        >
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
