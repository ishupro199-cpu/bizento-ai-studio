import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Quality Suffix ────────────────────────────────────────────────────────────
export const ADS_QUALITY_SUFFIX =
  "photorealistic commercial advertisement quality, " +
  "scroll-stopping visual, platform-ready creative, " +
  "professional marketing standard, sharp product, " +
  "no text overlays in image, no watermarks, no AI artifacts, " +
  "Mamaearth boAt Sugar Cosmetics Nykaa ad quality";

export const ADS_NEGATIVE_PROMPT =
  "text, words, letters, captions, watermarks, logos overlaid, " +
  "illustration, cartoon, 3D render look, cheap stock photo, " +
  "cluttered composition, amateur lighting, blurry, distorted, " +
  "generic canva template look, fake unrealistic product, " +
  "overexposed, underexposed, wrong colors, extra objects";

// ── Platforms ─────────────────────────────────────────────────────────────────
export const AD_PLATFORMS = [
  {
    id: "instagram",
    label: "Instagram",
    icon: "📸",
    gradient: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
    formats: [
      { id: "feed_square", label: "Feed (1:1)", aspectRatio: "1:1" },
      { id: "feed_portrait", label: "Feed (4:5)", aspectRatio: "4:5" },
      { id: "story", label: "Story / Reel Cover", aspectRatio: "9:16" },
    ],
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: "👥",
    gradient: "linear-gradient(135deg, #1877f2 0%, #0c5fc7 100%)",
    formats: [
      { id: "feed", label: "Feed Post (1:1)", aspectRatio: "1:1" },
      { id: "ad", label: "Ad Creative (1.91:1)", aspectRatio: "16:9" },
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: "▶️",
    gradient: "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
    formats: [
      { id: "thumbnail", label: "Thumbnail (16:9)", aspectRatio: "16:9" },
      { id: "community", label: "Community Post (1:1)", aspectRatio: "1:1" },
    ],
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: "💬",
    gradient: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
    formats: [
      { id: "catalog", label: "Catalog Image (1:1)", aspectRatio: "1:1" },
      { id: "status", label: "Status (9:16)", aspectRatio: "9:16" },
    ],
  },
  {
    id: "twitter",
    label: "Twitter / X",
    icon: "✖️",
    gradient: "linear-gradient(135deg, #1da1f2 0%, #0c85d0 100%)",
    formats: [
      { id: "post", label: "Post Image (16:9)", aspectRatio: "16:9" },
    ],
  },
  {
    id: "pinterest",
    label: "Pinterest",
    icon: "📌",
    gradient: "linear-gradient(135deg, #e60023 0%, #ad081b 100%)",
    formats: [
      { id: "pin", label: "Pin (2:3)", aspectRatio: "4:5" },
    ],
  },
];

// ── Campaign Goals ─────────────────────────────────────────────────────────────
export const CAMPAIGN_GOALS = [
  {
    id: "awareness",
    label: "Awareness",
    icon: "👁️",
    desc: "Make people know this product exists",
    defaultCTA: "Discover Now",
  },
  {
    id: "engagement",
    label: "Engagement",
    icon: "❤️",
    desc: "Likes, comments, shares, saves",
    defaultCTA: "Tag someone who needs this",
  },
  {
    id: "sales",
    label: "Sales / Conversion",
    icon: "🛒",
    desc: "Direct purchase clicks",
    defaultCTA: "Shop Now",
  },
  {
    id: "festival",
    label: "Festival / Offer",
    icon: "🎉",
    desc: "Time-limited promotion",
    defaultCTA: "Order Today — Offer Ends Tonight",
  },
];

// ── Ad Tones ──────────────────────────────────────────────────────────────────
export const AD_TONES = [
  { id: "emotional", label: "Emotional", icon: "💝", desc: "Story-driven, connects to feelings" },
  { id: "informational", label: "Informational", icon: "📊", desc: "Feature-focused, educates audience" },
  { id: "humorous", label: "Humorous", icon: "😄", desc: "Witty, relatable, Indian humor" },
  { id: "urgent", label: "Urgent", icon: "⚡", desc: "FOMO-driven, scarcity signals" },
  { id: "premium", label: "Premium", icon: "💎", desc: "Aspirational, luxury language" },
  { id: "relatable", label: "Relatable", icon: "🤝", desc: "Everyday Indian life, slice-of-life" },
];

// ── Gemini helper ─────────────────────────────────────────────────────────────
function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

async function geminiText(systemPrompt, userPrompt) {
  const ai = getGemini();
  if (!ai) throw new Error("GEMINI_API_KEY not configured");
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
  return result.response.text().trim();
}

// ── Analyze Product for Marketing Intelligence ────────────────────────────────
export async function analyzeProductForAdsCreation(imageUrl, prompt) {
  const systemPrompt = `You are Pixalera's Marketing Intelligence AI. You analyze products and extract marketing signals.
Analyze the product and output ONLY valid JSON with this exact schema:
{
  "product_name": "specific product name",
  "product_category": "detailed subcategory",
  "primary_color": "main color",
  "material": "material description",
  "price_segment": "Budget / Mid / Premium / Luxury",
  "primary_usp": "the ONE thing that makes this product special",
  "secondary_usps": ["usp1", "usp2", "usp3"],
  "target_audience": "specific audience description (e.g. working women 25-35 who value aesthetics)",
  "pain_point_solved": "what problem does this product solve",
  "desire_triggered": "what aspiration does it tap into",
  "gifting_potential": "High / Medium / Low",
  "impulse_buy_score": "High / Medium / Low",
  "best_hook_style": "Problem-solution / Aspirational / Social proof / Offer-led / Curiosity",
  "platform_fit": ["instagram", "facebook", "youtube", "whatsapp"],
  "seasonal_relevance": "any festival/season relevance or null",
  "brand_feel": "Luxury / Premium / Mass Market / Youth / Professional"
}
Only output valid JSON. No markdown, no explanation.`;

  const userMsg = imageUrl
    ? `Product image URL: ${imageUrl}\nProduct description: ${prompt || "analyze from image"}`
    : `Product description: ${prompt}`;

  try {
    let raw = await geminiText(systemPrompt, userMsg);
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(raw);
  } catch {
    return {
      product_name: prompt || "Product",
      product_category: "General Product",
      primary_color: "neutral",
      material: "standard",
      price_segment: "Mid",
      primary_usp: "Quality product at great value",
      secondary_usps: ["Durable", "Stylish", "Practical"],
      target_audience: "Indians 18-35",
      pain_point_solved: "Everyday needs",
      desire_triggered: "Better lifestyle",
      gifting_potential: "Medium",
      impulse_buy_score: "Medium",
      best_hook_style: "Aspirational",
      platform_fit: ["instagram", "facebook"],
      seasonal_relevance: null,
      brand_feel: "Mass Market",
    };
  }
}

// ── Suggest Platforms ─────────────────────────────────────────────────────────
export function suggestPlatformsForProduct(analysis) {
  const fit = analysis.platform_fit || ["instagram", "facebook"];
  return AD_PLATFORMS.map(p => ({
    ...p,
    recommended: fit.includes(p.id),
    recommendedRank: fit.indexOf(p.id),
  })).sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return a.recommendedRank - b.recommendedRank;
  });
}

// ── Build Image Prompt ────────────────────────────────────────────────────────
export function buildAdsCreationImagePrompt({ product, color, material, platform, format, goal, tone, analysis }) {
  const productDesc = `${color} ${material} ${product}`.trim();
  const category = analysis?.product_category || "";
  const brandFeel = analysis?.brand_feel || "Mass Market";

  const bgByGoal = {
    sales: "clean white background or bold brand color",
    awareness: "lifestyle scene, soft natural tones",
    engagement: "vibrant colorful energetic background",
    festival: "warm gold orange festive colors with bokeh lights",
  };

  const bgByTone = {
    premium: "dark dramatic luxury background, deep blacks",
    emotional: "warm soft lifestyle scene",
    urgent: "bold high-contrast background with energy",
    humorous: "bright fun vibrant colorful background",
    informational: "clean minimal white background",
    relatable: "everyday Indian home or lifestyle setting",
  };

  const background = bgByTone[tone] || bgByGoal[goal] || "clean professional background";
  const lighting = (tone === "premium" || brandFeel === "Luxury")
    ? "dramatic directional studio lighting with strong highlights"
    : (tone === "emotional")
    ? "warm golden hour soft lighting"
    : "bright professional studio lighting";

  if (format?.aspectRatio === "9:16") {
    return `Vertical 9:16 professional social media advertisement image for ${productDesc}, ` +
      `${productDesc} positioned in center of frame as hero, ` +
      `background: ${background}, ` +
      `lighting: ${lighting}, ` +
      `top 25% area: atmospheric visual extension of background, ` +
      `bottom 20%: clean minimal zone for text overlay (keep simple), ` +
      `product sharply in focus, perfectly lit, correctly colored, ` +
      `vertical composition designed for mobile-first story/reel viewing, ` +
      `${ADS_QUALITY_SUFFIX}`;
  }

  if (format?.aspectRatio === "16:9") {
    if (platform === "youtube") {
      return `YouTube thumbnail advertisement image for ${productDesc}, ` +
        `16:9 widescreen composition, product on left side as hero, dramatic and eye-catching, ` +
        `background: bold high-contrast ${background}, ` +
        `lighting: very dramatic, high contrast, strong highlights, ` +
        `right side 35-40% has clean simple area for text overlay, ` +
        `product must stand out even at small thumbnail size, ` +
        `bold punchy energetic composition, ` +
        `${ADS_QUALITY_SUFFIX}`;
    }
    return `Horizontal Facebook/Twitter advertisement image for ${productDesc}, ` +
      `widescreen 1.91:1 composition, ` +
      `${productDesc} prominently visible as hero on left half, ` +
      `background: ${background}, ` +
      `lighting: ${lighting}, ` +
      `right half: clean simple zone for copy text overlay, ` +
      `eye-catching at small thumbnail size, ` +
      `${ADS_QUALITY_SUFFIX}`;
  }

  return `Professional square social media advertisement image for ${productDesc}, ` +
    `${productDesc} as undisputed hero centered slightly above middle, ` +
    `background: ${background}, ` +
    `lighting: ${lighting}, ` +
    `lower 25% clean area for CTA text overlay, ` +
    `top-left area available for brand logo placement, ` +
    `visual hierarchy: product first, everything else supports it, ` +
    `color palette: ${tone === "premium" ? "dark luxury gold-black" : tone === "emotional" ? "warm natural" : "brand appropriate"}, ` +
    `${ADS_QUALITY_SUFFIX}`;
}

// ── Generate Ad Copy (3 versions + hashtags) ──────────────────────────────────
export async function generateAdCopy({ analysis, platform, goal, tone, language = "hinglish" }) {
  const productName = analysis?.product_name || "Product";
  const targetAudience = analysis?.target_audience || "Indian consumers";
  const primaryUSP = analysis?.primary_usp || "Quality product";
  const secondaryUSPs = (analysis?.secondary_usps || []).join(", ");
  const painPoint = analysis?.pain_point_solved || "everyday needs";
  const desire = analysis?.desire_triggered || "better lifestyle";
  const category = analysis?.product_category || "General";
  const priceSegment = analysis?.price_segment || "Mid";
  const seasonal = analysis?.seasonal_relevance;

  const langInstruction = language === "hindi"
    ? "Write ALL copy in Hindi (Devanagari script)."
    : language === "english"
    ? "Write ALL copy in English."
    : "Write in Hinglish (mix of Hindi and English, using Roman script for Hindi words) — this is best for Indian social media.";

  const systemPrompt = `You are Pixalera's Ads Creation AI — an experienced Indian performance marketing expert.
Generate 3 distinctly different ad copy versions for the given product.
${langInstruction}
Output ONLY valid JSON with this exact structure:
{
  "version1": {
    "style": "Emotional / Story-Driven",
    "hook": "first attention-grabbing line",
    "body": "2-3 lines of story/emotional build",
    "product_line": "product introduction line",
    "cta": "call to action",
    "hashtags": ["15-20 relevant hashtags without #"]
  },
  "version2": {
    "style": "Feature / Benefit-Led",
    "hook": "bold benefit statement",
    "features": ["Feature 1 → benefit", "Feature 2 → benefit", "Feature 3 → benefit"],
    "social_proof": "credibility line",
    "cta": "action-oriented CTA",
    "hashtags": ["15-20 relevant hashtags without #"]
  },
  "version3": {
    "style": "Urgency / Offer-Led",
    "urgency_hook": "time-limited or scarcity signal",
    "offer": "clear specific offer statement",
    "value": "why act NOW",
    "cta": "strong immediate action command",
    "deadline": "Offer valid till [time] only",
    "hashtags": ["15-20 relevant hashtags without #"]
  },
  "story_text": "2-line punchy story version max 60 chars per line",
  "platform_extras": {
    "headline_25": "Facebook ad headline max 25 chars",
    "tweet": "Twitter/X post max 280 chars with 2-3 hashtags",
    "whatsapp_broadcast": "WhatsApp broadcast message template",
    "youtube_titles": ["Title option 1", "Title option 2", "Title option 3"]
  }
}`;

  const userMsg = `Product: ${productName}
Category: ${category}
Price Segment: ${priceSegment}
Target Audience: ${targetAudience}
Primary USP: ${primaryUSP}
Secondary USPs: ${secondaryUSPs}
Pain Point Solved: ${painPoint}
Desire Triggered: ${desire}
Platform: ${platform}
Campaign Goal: ${goal}
Tone: ${tone}
${seasonal ? `Seasonal/Festival Context: ${seasonal}` : ""}

Generate 3 distinctly different ad copy versions. Make each version feel COMPLETELY different — emotional, feature-led, urgency must each have their own distinct voice.`;

  try {
    let raw = await geminiText(systemPrompt, userMsg);
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(raw);
  } catch {
    return {
      version1: {
        style: "Emotional / Story-Driven",
        hook: `Har subah ek naya confidence... ✨`,
        body: `Chhoti cheezein hote hain jo zindagi ko khas banati hain.\n${productName} unhi mein se ek hai.`,
        product_line: `${productName} — ${primaryUSP}`,
        cta: "Abhi try karo. Link in bio 🔗",
        hashtags: ["lifestyle", "india", "shopindia", productName.toLowerCase().replace(/\s/g, ""), "indianbrand"],
      },
      version2: {
        style: "Feature / Benefit-Led",
        hook: `${primaryUSP} ✨`,
        features: secondaryUSPs.split(", ").map(u => `${u} → real difference you'll feel`),
        social_proof: "Loved by thousands of Indian customers",
        cta: "Shop now → link in bio",
        hashtags: [productName.toLowerCase().replace(/\s/g, ""), category.toLowerCase().replace(/\s/g, ""), "shopnow", "india", "quality"],
      },
      version3: {
        style: "Urgency / Offer-Led",
        urgency_hook: "⚡ Limited time — don't miss this!",
        offer: `${productName} at special price — today only`,
        value: "Our bestseller. Stock running out fast.",
        cta: "Order NOW: Link in bio 👆",
        deadline: "Offer valid today only.",
        hashtags: ["sale", "offer", "limitedtime", "shopnow", productName.toLowerCase().replace(/\s/g, "")],
      },
      story_text: `${productName}\n${primaryUSP}`,
      platform_extras: {
        headline_25: productName.slice(0, 25),
        tweet: `${primaryUSP} — ${productName} is here! ${desire}. Check it out now 👇 #${productName.replace(/\s/g, "")} #India`,
        whatsapp_broadcast: `Hey! Check out ${productName} — ${primaryUSP}. ${desire}. Order now: [link]`,
        youtube_titles: [`${productName} Review — ${primaryUSP}`, `Why Everyone Loves ${productName}`, `${productName} — Worth It?`],
      },
    };
  }
}

// ── Detect Refinement Intent ──────────────────────────────────────────────────
export function detectAdsRefinementIntent(text) {
  const t = text.toLowerCase();
  return {
    regenerateCopyOnly: /copy|caption|write|text|version|emotional|benefit|urgency|hindi|english|hinglish|shorter|longer/.test(t),
    regenerateVisualOnly: /background|visual|creative|image|dark|light|festive|white|color|bg/.test(t),
    switchToEmotional: /emotional|story|feeling|relatable/.test(t),
    switchToBenefit: /benefit|feature|informational|rational/.test(t),
    switchToUrgency: /urgency|offer|sale|fomo|urgent/.test(t),
    switchToHindi: /hindi/.test(t),
    switchToEnglish: /english/.test(t),
    switchToHinglish: /hinglish/.test(t),
    wantFestive: /diwali|holi|eid|festival|rakhi|christmas|navratri/.test(t),
    wantPremium: /premium|luxury|professional|high end/.test(t),
    wantFunny: /funny|humor|witty|comedy/.test(t),
    wantShorter: /shorter|short|brief|concise/.test(t),
  };
}
