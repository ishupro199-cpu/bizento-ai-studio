import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Universal Quality Suffix ──────────────────────────────────────────────────
export const CINEMATIC_QUALITY_SUFFIX =
  "cinematic commercial photography quality, " +
  "photorealistic not illustrated, hyperrealistic, " +
  "professional advertising campaign standard, " +
  "physically accurate materials, lighting, and shadows, " +
  "8K resolution, anamorphic lens bokeh, " +
  "no AI artifacts, no distortion, no watermarks, " +
  "color-graded like a premium brand advertisement, " +
  "award-winning commercial photography";

// ── Universal Negative Prompt ─────────────────────────────────────────────────
export const CINEMATIC_NEGATIVE_PROMPT =
  "illustration, cartoon, 3D render look, animated, CGI-obvious look, " +
  "stock photo feel, amateur lighting, flat lighting, " +
  "cheap or generic look, watermarks, text overlays, " +
  "blurry product, wrong product shape or color, " +
  "distorted human anatomy, extra fingers, plastic skin, " +
  "uncanny valley faces, AI-obvious faces, " +
  "cluttered composition, confusing visual hierarchy, " +
  "overexposed, underexposed, blown highlights, " +
  "amateur composition, obvious green screen look";

// ── Color Grade Presets ───────────────────────────────────────────────────────
export const COLOR_GRADES = [
  {
    id: "warm_cinematic",
    label: "Warm Cinematic",
    desc: "Boosted oranges/yellows, filmic warmth — Bollywood brand commercial feel",
    prompt: "color grade: warm cinematic tones — boosted oranges and yellows, slightly desaturated blues, filmic warmth, 3200-3400K feel",
    preview: "linear-gradient(135deg, #f97316 0%, #b45309 100%)",
  },
  {
    id: "cool_luxury",
    label: "Cool Luxury",
    desc: "Teal shadows, bright highlights — Apple, Samsung, Rolex aesthetic",
    prompt: "color grade: cool luxury tone — teal shadows, bright highlights, desaturated mid-tones, high contrast, silver and white emphasis",
    preview: "linear-gradient(135deg, #0ea5e9 0%, #1e3a5f 100%)",
  },
  {
    id: "dark_dramatic",
    label: "Dark Dramatic",
    desc: "Deep blacks, hot whites — Chanel No.5, Tom Ford aesthetic",
    prompt: "color grade: dark dramatic — deep blacks, hot whites, strong color contrast, shadows dense and rich",
    preview: "linear-gradient(135deg, #1a1a1a 0%, #4a0e0e 100%)",
  },
  {
    id: "vibrant_pop",
    label: "Vibrant Pop",
    desc: "Punchy saturated colors — Mountain Dew, Pepsi, FMCG energy",
    prompt: "color grade: vibrant and saturated — punchy colors, high saturation, clean whites, energetic palette",
    preview: "linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)",
  },
  {
    id: "earthy_organic",
    label: "Earthy Organic",
    desc: "Natural muted tones — Forest Essentials, Khadi, organic brand",
    prompt: "color grade: warm earthy — desaturated natural tones, warm browns, muted greens, soft cream and terracotta",
    preview: "linear-gradient(135deg, #92400e 0%, #78716c 100%)",
  },
  {
    id: "pastel_fresh",
    label: "Pastel Fresh",
    desc: "Light airy pastels — Dove, Cetaphil, feminine skincare",
    prompt: "color grade: soft pastel — light airy tones, gentle pinks and lavenders, clean whites, delicate feel",
    preview: "linear-gradient(135deg, #f9a8d4 0%, #c4b5fd 100%)",
  },
];

// ── Aspect Ratio Config ───────────────────────────────────────────────────────
export const ASPECT_RATIOS = [
  {
    id: "9:16",
    label: "9:16",
    desc: "Stories / Reels",
    prompt: "vertical 9:16 composition, product positioned in center-lower third, dramatic sky/ceiling/space in upper portion, bottom third clean for text overlay",
  },
  {
    id: "1:1",
    label: "1:1",
    desc: "Instagram / Facebook",
    prompt: "square 1:1 composition, product centered, equal breathing space on all sides, balanced composition, no important elements cut at edges",
  },
  {
    id: "4:5",
    label: "4:5",
    desc: "Feed (optimal)",
    prompt: "portrait 4:5 composition, product in upper-center, lower portion available for text overlay, most visual real estate in Instagram feed",
  },
  {
    id: "16:9",
    label: "16:9",
    desc: "YouTube / Banner",
    prompt: "widescreen 16:9 composition, product as left-side or center hero, right side available for text, cinematic horizontal feeling",
  },
  {
    id: "3:4",
    label: "3:4",
    desc: "Pinterest / Print",
    prompt: "tall portrait 3:4 composition, product at visual center, top and bottom space for title and details",
  },
];

// ── Ad Formats ────────────────────────────────────────────────────────────────
export const AD_FORMATS = [
  {
    id: "model",
    label: "Model / Influencer",
    desc: "Real-looking AI person naturally using the product",
    icon: "👤",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
    subOptions: [
      { id: "female_beauty", label: "Female — Beauty/Skincare", icon: "💄" },
      { id: "male_sports", label: "Male — Sports/Tech/Grooming", icon: "🏋️" },
      { id: "hands_only", label: "Hands Only (Safest)", icon: "🤲" },
      { id: "lifestyle_partial", label: "Lifestyle / Silhouette", icon: "🌅" },
    ],
  },
  {
    id: "cgi",
    label: "CGI / Cinematic",
    desc: "Product as hero in dramatic atmospheric scene",
    icon: "✨",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
    subOptions: [
      { id: "splash_liquid", label: "Liquid Splash / Emergence", icon: "💧" },
      { id: "particle_dust", label: "Particle / Powder / Dust", icon: "✨" },
      { id: "light_rays", label: "Dramatic Light Rays", icon: "☀️" },
      { id: "space_float", label: "Space / Float / Dark Void", icon: "🌌" },
      { id: "nature_macro", label: "Nature Macro / Organic", icon: "🌸" },
    ],
  },
  {
    id: "scene",
    label: "Scene Builder",
    desc: "Product in a fully styled aspirational lifestyle scene",
    icon: "🏠",
    gradient: "linear-gradient(135deg, #78350f 0%, #92400e 100%)",
    subOptions: [
      { id: "morning_luxury", label: "Morning Luxury", icon: "☀️" },
      { id: "urban_professional", label: "Urban Professional", icon: "🏙️" },
      { id: "evening_glow", label: "Evening Glow", icon: "🕯️" },
      { id: "outdoor_adventure", label: "Outdoor Adventure", icon: "🏔️" },
      { id: "luxury_hotel", label: "Luxury Hotel", icon: "🏨" },
    ],
  },
  {
    id: "brand_story",
    label: "Brand Story",
    desc: "Emotion-driven concept image — product as symbol",
    icon: "❤️",
    gradient: "linear-gradient(135deg, #991b1b 0%, #c2410c 100%)",
    subOptions: [
      { id: "confidence", label: "Confidence / Empowerment", icon: "⚡" },
      { id: "elegance", label: "Elegance / Luxury", icon: "💎" },
      { id: "joy_celebration", label: "Joy / Celebration", icon: "🎊" },
      { id: "freshness_energy", label: "Freshness / Energy", icon: "💚" },
    ],
  },
];

// ── Auto-Suggestion Logic ─────────────────────────────────────────────────────
const CATEGORY_FORMAT_MAP = {
  "Beauty / Perfume / Jewelry":    ["model", "cgi"],
  "Sports / Fitness":              ["model", "scene"],
  "Food / Beverage":               ["scene", "brand_story"],
  "Electronics / Gadgets":         ["cgi", "scene"],
  "Fashion / Apparel":             ["model", "scene"],
  "Home Decor / Lifestyle":        ["scene", "brand_story"],
  "Kids products":                 ["model", "scene"],
  "Beauty / Skincare / Perfume":   ["model", "cgi"],
  "Jewelry / Watches":             ["cgi", "model"],
  "Apparel / Shoes / Bags":        ["model", "scene"],
  "Electronics":                   ["cgi", "scene"],
  "Home Decor / Candles":          ["scene", "brand_story"],
  "Sports / Fitness gear":         ["model", "scene"],
  "Food & Beverage":               ["scene", "brand_story"],
};

const FORMAT_SUGGESTION_REASONS = {
  model:       "Model/Influencer — products with human usage convert best showing real-looking usage on a person.",
  cgi:         "CGI Hero recommended — this product category performs best with dramatic liquid/particle/light effects.",
  scene:       "Scene Builder recommended — placing this product in an aspirational lifestyle scene drives purchase intent.",
  brand_story: "Brand Story recommended — this product category benefits most from emotional concept-driven imagery.",
};

export function suggestAdFormats(analysis) {
  const category = analysis.product_category || "Other";
  const isPremium = analysis.brand_feel === "Luxury" || analysis.premium_budget_signal === "Luxury";

  // Find the best match in the category map
  let suggestedIds = null;
  for (const [key, ids] of Object.entries(CATEGORY_FORMAT_MAP)) {
    if (category.toLowerCase().includes(key.toLowerCase().split(" / ")[0].toLowerCase())) {
      suggestedIds = ids;
      break;
    }
  }

  // Premium always gets CGI as top
  if (isPremium && suggestedIds) {
    if (!suggestedIds.includes("cgi")) {
      suggestedIds = ["cgi", ...suggestedIds.slice(0, 1)];
    } else {
      suggestedIds = ["cgi", ...suggestedIds.filter(id => id !== "cgi").slice(0, 1)];
    }
  }

  if (!suggestedIds) suggestedIds = ["model", "scene"];

  return suggestedIds.slice(0, 2).map(id => ({
    formatId: id,
    format: AD_FORMATS.find(f => f.id === id),
    reason: FORMAT_SUGGESTION_REASONS[id] || "",
  }));
}

// ── Prompt Builders ───────────────────────────────────────────────────────────

function buildModelPrompt({ product, color, material, subFormat, colorGrade, aspectRatio, analysis }) {
  const productDesc = `${color} ${material} ${product}`.trim();
  const grade = colorGrade?.prompt || "";
  const ratio = aspectRatio?.prompt || "";
  const category = analysis?.product_category || "";
  const isBeauty = /beauty|skincare|perfume|makeup|cosmetic|jewelry/i.test(category);

  switch (subFormat) {
    case "female_beauty":
      return `Cinematic beauty advertisement photograph featuring an Indian woman model (25-30 years), ` +
        `medium complexion, natural beauty, ` +
        `model shown applying or holding ${productDesc} naturally, ` +
        `scene: morning bathroom routine or vanity table, ` +
        `lighting: soft window light, warm golden studio glow, ` +
        `model wearing minimal elegant simple clothing, ` +
        `camera: eye level or slightly elevated, 85mm portrait lens feel, ` +
        `background: soft blurred interior or marble surface, ` +
        `expression: confident, genuine, aspirational — not overly posed, ` +
        `product clearly visible and identifiable in frame, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "male_sports":
      return `Cinematic advertising photograph featuring an Indian man (24-32 years), ` +
        `medium athletic build appearance, ` +
        `model shown using or holding ${productDesc} confidently, ` +
        `scene: modern office or gym or outdoor urban setting, ` +
        `lighting: directional dramatic studio light, natural outdoor light, ` +
        `model wearing casual streetwear or athletic clothing, ` +
        `camera: slight low angle for power feel, 50-85mm lens quality, ` +
        `background: blurred urban or gym environment, ` +
        `expression: focused, confident, aspirational, ` +
        `product prominently visible and correctly scaled, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "hands_only":
      return `Cinematic close-up advertisement photograph showing elegant human hands ` +
        `${isBeauty ? "feminine with manicured nails" : "well-groomed masculine or feminine"} ` +
        `naturally holding or presenting or applying ${productDesc}, ` +
        `product clearly visible and sharply in focus, ` +
        `background: soft blurred ${isBeauty ? "marble or pastel surface" : "lifestyle context"}, ` +
        `lighting: warm or cool tone matching product brand feel, ` +
        `shallow depth of field f/1.8 equivalent, background beautifully blurred, ` +
        `skin texture real and natural — not plastic, ` +
        `product proportions perfectly accurate, ` +
        `premium hand-model quality like watch advertisement or jewelry commercial, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "lifestyle_partial":
    default:
      return `Cinematic lifestyle advertisement photograph, ` +
        `${productDesc} as hero product, person shown partially — back view or side silhouette, ` +
        `person walking with or sitting with ${productDesc}, ` +
        `setting: urban rooftop at golden hour or beach sunrise or luxury hotel room, ` +
        `lighting: golden hour or dramatic window light or atmospheric, ` +
        `camera: 35mm wide feel with foreground-background depth, ` +
        `person in frame as lifestyle context, product clearly identifiable, ` +
        `aspirational, editorial, cinematic, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;
  }
}

function buildCGIPrompt({ product, color, material, subFormat, colorGrade, aspectRatio }) {
  const productDesc = `${color} ${material} ${product}`.trim();
  const grade = colorGrade?.prompt || "";
  const ratio = aspectRatio?.prompt || "";

  switch (subFormat) {
    case "splash_liquid":
      return `Ultra premium CGI-style cinematic advertisement image of ${productDesc}, ` +
        `${productDesc} dramatically emerging from crystal clear water or liquid matching brand palette, ` +
        `liquid splash frozen in motion around product — physically accurate fluid dynamics, ` +
        `background: pure black or deep brand color background, ` +
        `product perfectly sharp and centered, liquid elements radiating outward, ` +
        `dramatic studio spotlight from above hitting product, ` +
        `light refracting through liquid, caustics visible on surface, ` +
        `product proportions and color 100% accurate, ` +
        `premium fragrance or beverage commercial quality, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "particle_dust":
      return `Cinematic advertising photograph of ${productDesc}, ` +
        `product surrounded by floating gold dust or color powder explosion or crystalline particles, ` +
        `particles frozen in motion, backlit by dramatic warm gold or cool blue-white light, ` +
        `deep black or dark navy background, ` +
        `product as absolute center of visual attention, ` +
        `particles create a halo effect around the product, ` +
        `atmosphere: premium, magical, aspirational, ` +
        `physically accurate particle behavior — not flat, has depth and volume, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "light_rays":
      return `Cinematic dramatic product advertisement photograph of ${productDesc}, ` +
        `product placed on dark glass or black marble surface, ` +
        `single powerful god-ray or spotlight from directly above cutting through dark atmosphere, ` +
        `product perfectly lit by this beam, everything else in deep shadow, ` +
        `surface reflection of product visible below, ` +
        `subtle atmospheric mist or haze catching the light beam, ` +
        `color grade: high contrast teal-orange or deep blue-white, ` +
        `premium luxury brand aesthetic — Tom Ford, Chanel, Rolex advertisement, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "space_float":
      return `Futuristic cinematic advertisement image of ${productDesc}, ` +
        `product floating in dark space environment, ` +
        `dramatic directional lighting from upper-left highlighting product's key surfaces, ` +
        `subtle star field or atmospheric depth in background out of focus, ` +
        `product casting realistic shadow and light interaction on surrounding space, ` +
        `subtle energy field or glow emanating from product, ` +
        `camera: slightly below product looking up for power perspective, ` +
        `think: Apple product reveal or Samsung commercial or premium tech ad, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "nature_macro":
    default:
      return `Ultra close-up macro cinematic advertisement photograph, ` +
        `${productDesc} surrounded by extreme macro water droplets on petals or morning dew or green leaves or flower petals, ` +
        `product placed among roses or tropical leaves or herbs or dried flowers, ` +
        `soft natural diffused light or golden hour light from one side, ` +
        `extreme shallow depth of field — product sharp, nature elements softly blurred, ` +
        `nature elements touching or framing the product organically, ` +
        `premium beauty or natural brand aesthetic, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;
  }
}

function buildScenePrompt({ product, color, material, subFormat, colorGrade, aspectRatio }) {
  const productDesc = `${color} ${material} ${product}`.trim();
  const grade = colorGrade?.prompt || "";
  const ratio = aspectRatio?.prompt || "";

  switch (subFormat) {
    case "morning_luxury":
      return `Cinematic interior lifestyle advertisement photograph, ` +
        `${productDesc} placed prominently on marble bedside table or premium wooden surface or linen bed, ` +
        `morning golden hour sunlight streaming through sheer curtains from left, ` +
        `scene elements: steaming coffee cup, fresh flowers, open book, white linen, ` +
        `warm 3000-3400K color temperature, golden morning light, ` +
        `shallow depth of field — product sharp, room beautifully blurred background, ` +
        `room aesthetic: minimalist Scandinavian or warm Bohemian or modern luxury, ` +
        `no human present, product as star of aspirational morning, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "urban_professional":
      return `Cinematic modern office lifestyle advertisement photograph, ` +
        `${productDesc} on clean minimal desk or marble conference table, ` +
        `scene: premium modern office, city view visible through window background, ` +
        `lighting: cool clean daylight from large windows, slight blue-white tone, ` +
        `minimal props: notebook or coffee cup — not cluttered, ` +
        `camera: slightly elevated, product in foreground, city blurred in background, ` +
        `color grade: cool professional, clean, aspirational, ` +
        `product clearly dominant in frame, professional context supporting, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "evening_glow":
      return `Cinematic evening lifestyle advertisement photograph, ` +
        `${productDesc} in warm evening setting — candlelit dinner table or luxury bar or rooftop terrace at night, ` +
        `lighting: warm amber candlelight or city lights bokeh in background, ` +
        `props: candle, wine glass, flowers, city lights in distance, ` +
        `deep warm golden-orange color grade, ` +
        `atmospheric, romantic, premium evening aesthetic, ` +
        `background city lights as beautiful bokeh orbs, ` +
        `product perfectly lit by warm foreground light, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "outdoor_adventure":
      return `Cinematic outdoor advertisement photograph, ` +
        `${productDesc} placed on smooth rock or wooden surface or grass or sand, ` +
        `dramatic outdoor landscape visible in background: mountain range or ocean or forest, ` +
        `lighting: golden hour sun from behind and to the side — dramatic backlighting, ` +
        `long warm shadow from product on surface, ` +
        `product feels at home in this aspirational outdoor world, ` +
        `no clutter, breathing space, nature and product coexisting beautifully, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "luxury_hotel":
    default:
      return `Cinematic luxury hotel lifestyle advertisement photograph, ` +
        `${productDesc} placed on marble surfaces or glass table in premium hotel suite setting, ` +
        `expensive furniture, floor-to-ceiling windows with city or ocean view softly blurred, ` +
        `lighting: soft diffused natural light from one side, elegant and serene, ` +
        `minimal premium props: crisp white linen, single stem flower, champagne or coffee, ` +
        `atmosphere: exclusive, aspirational, effortlessly luxurious, ` +
        `product as design object in this environment, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;
  }
}

function buildBrandStoryPrompt({ product, color, material, subFormat, colorGrade, aspectRatio }) {
  const productDesc = `${color} ${material} ${product}`.trim();
  const grade = colorGrade?.prompt || "";
  const ratio = aspectRatio?.prompt || "";

  switch (subFormat) {
    case "confidence":
      return `Cinematic brand story advertisement image for ${productDesc}, ` +
        `central concept: confidence, empowerment, self-expression, ` +
        `${productDesc} as the hero object in a powerful visual narrative, ` +
        `lighting: dramatic directional light, strong shadow, high contrast, ` +
        `composition: product with intentional empty space on one side for headline text, ` +
        `background: dark dramatic or bold color or atmospheric, ` +
        `overall feeling: this product is transformative, not just functional, ` +
        `think: Nike Just Do It energy or Tanishq jewelry campaign, ` +
        `no text in image — clean negative space zone, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "elegance":
      return `Cinematic luxury brand story image for ${productDesc}, ` +
        `concept: effortless elegance, quiet luxury, understated excellence, ` +
        `${productDesc} positioned as a jewel in a minimal, dark, sophisticated environment, ` +
        `lighting: narrow precision spotlight on product from above, ` +
        `everything else in deep shadow — product emerges from darkness, ` +
        `color palette: black-gold or navy-silver or charcoal-white, ` +
        `composition: product centered with massive negative space around, ` +
        `mood: exclusive, rare, desirable, ` +
        `think: Chanel or Hermès or Cartier campaign quality, ` +
        `empty space for short luxury headline text, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "joy_celebration":
      return `Cinematic celebratory brand story image for ${productDesc}, ` +
        `concept: happiness, celebration, sharing, togetherness, ` +
        `${productDesc} in a joyful vibrant scene with warm celebratory energy, ` +
        `lighting: bright, warm, high-key — all surfaces glowing with warmth, ` +
        `elements: confetti fragments or fairy lights bokeh or flowers or colorful backgrounds, ` +
        `composition: dynamic, energetic — slight diagonal, not static, ` +
        `mood: this product belongs at every good moment in life, ` +
        `think: Cadbury Dairy Milk emotional ads or Asian Paints celebration campaigns, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;

    case "freshness_energy":
    default:
      return `Cinematic fresh energy brand story image for ${productDesc}, ` +
        `concept: vitality, freshness, new beginning, clean energy, ` +
        `${productDesc} with dynamic composition suggesting movement and energy, ` +
        `lighting: bright clean cool-white or fresh morning light, ` +
        `elements: water splashes or morning light rays or green nature or crisp white space, ` +
        `composition: product placed dynamically, not static, ` +
        `mood: this product makes you feel alive, refreshed, ready, ` +
        `think: Maaza or Mountain Dew or Clinic Plus fresh energy, ` +
        `${grade}, ${ratio}, ${CINEMATIC_QUALITY_SUFFIX}`;
  }
}

// ── Main Prompt Builder ───────────────────────────────────────────────────────
export function buildCinematicAdPrompt({ product, color, material, format, subFormat, colorGrade, aspectRatio, analysis }) {
  const prod = product || "product";
  const col = color || "premium";
  const mat = material || "material";

  const colorGradeObj = typeof colorGrade === "string"
    ? COLOR_GRADES.find(g => g.id === colorGrade) || COLOR_GRADES[0]
    : colorGrade || COLOR_GRADES[0];

  const aspectRatioObj = typeof aspectRatio === "string"
    ? ASPECT_RATIOS.find(r => r.id === aspectRatio) || ASPECT_RATIOS[1]
    : aspectRatio || ASPECT_RATIOS[1];

  let prompt;
  switch (format) {
    case "model":
      prompt = buildModelPrompt({ product: prod, color: col, material: mat, subFormat, colorGrade: colorGradeObj, aspectRatio: aspectRatioObj, analysis });
      break;
    case "cgi":
      prompt = buildCGIPrompt({ product: prod, color: col, material: mat, subFormat, colorGrade: colorGradeObj, aspectRatio: aspectRatioObj });
      break;
    case "scene":
      prompt = buildScenePrompt({ product: prod, color: col, material: mat, subFormat, colorGrade: colorGradeObj, aspectRatio: aspectRatioObj });
      break;
    case "brand_story":
      prompt = buildBrandStoryPrompt({ product: prod, color: col, material: mat, subFormat, colorGrade: colorGradeObj, aspectRatio: aspectRatioObj });
      break;
    default:
      prompt = buildCGIPrompt({ product: prod, color: col, material: mat, subFormat: "splash_liquid", colorGrade: colorGradeObj, aspectRatio: aspectRatioObj });
  }

  return { prompt, negativePrompt: CINEMATIC_NEGATIVE_PROMPT };
}

// ── Product Analysis for Cinematic Ads ───────────────────────────────────────
export async function analyzeProductForCinematicAds(imageUrl, userPrompt = "") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return getDefaultAdAnalysis(userPrompt);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const analysisPrompt = `Analyze this product image for creating a cinematic advertisement. Return ONLY a JSON object with these exact fields:
{
  "product_name": "specific product name",
  "product_category": "one of: Beauty / Skincare / Perfume | Food & Beverage | Jewelry / Watches | Apparel / Shoes / Bags | Electronics / Gadgets | Home Decor / Candles | Sports / Fitness | Other",
  "brand_feel": "one of: Luxury | Aspirational | Everyday | Youth | Professional",
  "target_gender": "one of: Women | Men | Unisex | Kids",
  "target_age_group": "one of: 13-18 | 18-25 | 25-35 | 35-50 | 50+",
  "primary_emotion": "one of: Desire | Confidence | Comfort | Energy | Elegance | Joy | Achievement | Freshness | Power",
  "best_model_type": "one of: Female model | Male model | No model | Hand only | Couple | Friends group | Child",
  "lifestyle_context": "one of: Urban | Outdoor | Home | Gym | Office | Party | Travel | Morning routine | Evening glam",
  "color_mood": "one of: Warm | Cool | Dark luxury | Vibrant | Pastel | Earthy",
  "primary_color": "exact color name",
  "material_feel": "one of: Soft | Hard | Smooth | Rough | Glossy | Matte | Natural",
  "premium_budget_signal": "one of: Luxury | Mid-range | Budget"
}

User also described: "${userPrompt}"
Return ONLY the JSON, no other text.`;

    let imagePart = null;
    if (imageUrl && imageUrl.startsWith("http")) {
      const { default: fetch } = await import("node-fetch").catch(() => ({ default: global.fetch }));
      const resp = await fetch(imageUrl);
      const buf = await resp.arrayBuffer();
      imagePart = {
        inlineData: {
          data: Buffer.from(buf).toString("base64"),
          mimeType: resp.headers.get("content-type") || "image/jpeg",
        },
      };
    }

    const parts = imagePart
      ? [imagePart, { text: analysisPrompt }]
      : [{ text: analysisPrompt }];

    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const text = result.response.text().trim();
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn("Cinematic ads analysis failed:", err.message);
    return getDefaultAdAnalysis(userPrompt);
  }
}

function getDefaultAdAnalysis(userPrompt = "") {
  const lower = userPrompt.toLowerCase();
  let category = "Other";
  let brandFeel = "Aspirational";
  let emotion = "Desire";

  if (/perfume|serum|cream|skincare|beauty|fragrance|lipstick|makeup/.test(lower)) {
    category = "Beauty / Skincare / Perfume"; brandFeel = "Luxury"; emotion = "Elegance";
  } else if (/jewelry|watch|ring|necklace|bracelet|gold/.test(lower)) {
    category = "Jewelry / Watches"; brandFeel = "Luxury"; emotion = "Desire";
  } else if (/shoe|sneaker|bag|purse|apparel|shirt|dress|fashion/.test(lower)) {
    category = "Apparel / Shoes / Bags"; brandFeel = "Aspirational"; emotion = "Confidence";
  } else if (/phone|laptop|gadget|electronics|headphone|earphone/.test(lower)) {
    category = "Electronics / Gadgets"; brandFeel = "Professional"; emotion = "Achievement";
  } else if (/food|drink|coffee|tea|beverage|snack|chocolate/.test(lower)) {
    category = "Food & Beverage"; brandFeel = "Everyday"; emotion = "Joy";
  } else if (/candle|decor|vase|lamp|home|furniture/.test(lower)) {
    category = "Home Decor / Candles"; brandFeel = "Aspirational"; emotion = "Comfort";
  } else if (/gym|fitness|sport|protein|supplement|yoga/.test(lower)) {
    category = "Sports / Fitness"; brandFeel = "Youth"; emotion = "Energy";
  }

  return {
    product_name: userPrompt.split(" ").slice(0, 4).join(" ") || "product",
    product_category: category,
    brand_feel: brandFeel,
    target_gender: "Unisex",
    target_age_group: "25-35",
    primary_emotion: emotion,
    best_model_type: "No model",
    lifestyle_context: "Urban",
    color_mood: "Warm",
    primary_color: "neutral",
    material_feel: "Smooth",
    premium_budget_signal: "Mid-range",
  };
}

// ── Refinement Intent Detection ───────────────────────────────────────────────
export function detectCinematicRefinementIntent(text) {
  const lower = text.toLowerCase();
  const refinements = {};

  // Format switches
  if (/female|woman|girl|lady/.test(lower)) refinements.switchSubFormat = "female_beauty";
  if (/male|man|boy|guy/.test(lower)) refinements.switchSubFormat = "male_sports";
  if (/hands? only|just hands?/.test(lower)) refinements.switchSubFormat = "hands_only";
  if (/cgi|particles|splash|liquid/.test(lower)) refinements.switchFormat = "cgi";
  if (/scene|lifestyle|morning|office|evening/.test(lower)) refinements.switchFormat = "scene";
  if (/brand story|emotion|concept/.test(lower)) refinements.switchFormat = "brand_story";
  if (/model|influencer|person/.test(lower)) refinements.switchFormat = "model";

  // Color grade switches
  if (/warm|golden|garam/.test(lower)) refinements.switchColorGrade = "warm_cinematic";
  if (/cool|cold|crisp|silver/.test(lower)) refinements.switchColorGrade = "cool_luxury";
  if (/dark|moody|dramatic/.test(lower)) refinements.switchColorGrade = "dark_dramatic";
  if (/vibrant|colorful|bright|pop/.test(lower)) refinements.switchColorGrade = "vibrant_pop";
  if (/earthy|organic|natural/.test(lower)) refinements.switchColorGrade = "earthy_organic";
  if (/pastel|soft|gentle/.test(lower)) refinements.switchColorGrade = "pastel_fresh";

  // Aspect ratio switches
  if (/vertical|9:16|story|reel|stories/.test(lower)) refinements.switchAspectRatio = "9:16";
  if (/square|1:1/.test(lower)) refinements.switchAspectRatio = "1:1";
  if (/widescreen|16:9|banner|youtube/.test(lower)) refinements.switchAspectRatio = "16:9";

  return refinements;
}
