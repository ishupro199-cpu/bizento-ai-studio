import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Universal Quality Suffix (append to EVERY prompt) ────────────────────────
const QUALITY_SUFFIX =
  "hyperrealistic commercial product photography, " +
  "photorealistic not illustrated, " +
  "physically accurate materials and lighting, " +
  "ultra sharp focus on product, " +
  "8K resolution, DSLR quality lens rendering, " +
  "no AI artifacts, no distortion, " +
  "accurate color matching to original product, " +
  "professional retouching quality output";

// ── Universal Negative Prompt ─────────────────────────────────────────────────
const NEGATIVE_PROMPT =
  "illustration, cartoon, painting, 3D render look, toy-like, " +
  "blurry product, wrong product, duplicate product, " +
  "floating without surface, no shadows, " +
  "text overlay, watermarks, logos not on original product, " +
  "distorted proportions, extra limbs, extra objects, " +
  "cluttered background unless lifestyle, " +
  "cheap look, amateur lighting, flat lighting, " +
  "overexposed, underexposed, blown-out whites";

// ── Style → Background Options Map ───────────────────────────────────────────
export const STYLE_BACKGROUNDS = {
  studio: [
    "Pure White",
    "Warm White",
    "Soft Grey",
    "Gradient Grey",
  ],
  lifestyle: [
    "Kitchen Counter",
    "Wooden Table",
    "Marble Surface",
    "Bedroom / Soft Linen",
    "Office Desk",
    "Bathroom Shelf",
    "Outdoor Patio",
    "Rustic Wood",
    "Concrete Floor",
  ],
  flatlay: [
    "White Linen",
    "Natural Wood Grain",
    "Marble",
    "Kraft Paper",
    "Black Velvet",
    "Pastel Fabric",
    "Rattan / Wicker Mat",
  ],
  dark: [
    "Pure Black",
    "Deep Navy",
    "Dark Charcoal",
    "Deep Burgundy",
    "Dark Forest Green",
    "Textured Black Leather",
  ],
  outdoor: [
    "Natural Grass",
    "Sandy Beach",
    "Rocky Surface",
    "Forest Floor",
    "Urban Concrete",
    "Rooftop Terrace",
  ],
  minimalist: [
    "Pure White",
    "Off-white Texture",
    "Soft Sage",
    "Dusty Pink",
    "Light Beige",
    "Pale Grey",
  ],
};

// ── Lighting Moods ────────────────────────────────────────────────────────────
export const LIGHTING_MOODS = [
  { id: "bright",    label: "Bright & Airy",     desc: "Soft diffused daylight, high key, clean whites" },
  { id: "warm",      label: "Warm Golden",        desc: "Warm amber/golden tones, 3200K feel, cozy, organic" },
  { id: "cool",      label: "Cool & Clean",       desc: "Neutral-cool light, 5500K, crisp, modern" },
  { id: "moody",     label: "Moody & Dramatic",   desc: "High contrast, strong shadows, mysterious" },
  { id: "cinematic", label: "Dark & Cinematic",   desc: "Deep blacks, accent highlights, luxury feel" },
  { id: "natural",   label: "Natural Soft",       desc: "Window light simulation, gentle shadows, realistic" },
];

// ── Photography Styles ────────────────────────────────────────────────────────
export const PHOTOGRAPHY_STYLES = [
  { id: "studio",    label: "Studio Clean",       desc: "Pure/soft white BG. Default safe choice for all products.", thumbnail: "studio" },
  { id: "lifestyle", label: "Lifestyle / Editorial", desc: "Product in a real scene with props. Tells a story.", thumbnail: "lifestyle" },
  { id: "flatlay",   label: "Flat Lay / Overhead", desc: "Camera directly above. Great for Instagram & Pinterest.", thumbnail: "flatlay" },
  { id: "dark",      label: "Dark Luxury",        desc: "Dark bg, rim lighting. Screams premium.", thumbnail: "dark" },
  { id: "outdoor",   label: "Outdoor / Natural",  desc: "Real outdoor environment. Authentic textures.", thumbnail: "outdoor" },
  { id: "minimalist", label: "Minimalist",        desc: "Massive negative space. Product's design talks.", thumbnail: "minimalist" },
];

// ── Style → Category Suggestion Logic ────────────────────────────────────────
const CATEGORY_STYLE_SUGGESTIONS = {
  "Beauty / Skincare / Perfume": ["dark", "minimalist", "studio"],
  "Food & Beverage":             ["lifestyle", "flatlay", "studio"],
  "Jewelry / Watches":           ["dark", "minimalist", "outdoor"],
  "Apparel / Shoes / Bags":      ["lifestyle", "flatlay", "outdoor"],
  "Electronics / Gadgets":       ["dark", "studio", "minimalist"],
  "Home Decor / Candles":        ["lifestyle", "flatlay", "minimalist"],
  "Sports / Fitness":            ["outdoor", "lifestyle", "studio"],
  "Stationery / Books":          ["flatlay", "lifestyle", "minimalist"],
  "Toys / Kids":                 ["lifestyle", "flatlay", "studio"],
};

const STYLE_SUGGEST_REASON = {
  dark:       "Dark backgrounds make premium products look most luxurious with rim lighting.",
  minimalist: "Minimalist style lets the product's design and form do the talking.",
  studio:     "Studio Clean is the safest, most versatile choice for any product.",
  lifestyle:  "Lifestyle shots make customers imagine using the product — highest conversion.",
  flatlay:    "Flat lay is hugely popular on Instagram and Pinterest for this category.",
  outdoor:    "Outdoor shots show the product in its natural element — authentic and compelling.",
};

// ── Category-Specific Prompt Enhancements ────────────────────────────────────
const CATEGORY_ENHANCEMENTS = {
  "Beauty / Skincare / Perfume":
    "glass or translucent elements rendered with internal refraction and caustics, " +
    "liquid product visible through transparent packaging if applicable, " +
    "product surface catching light beautifully, " +
    "premium cosmetic photography — think Glossier, Tatcha, Charlotte Tilbury",
  "Jewelry / Watches":
    "metallic surfaces with accurate specular highlights, " +
    "gemstones or crystals with internal sparkle and light dispersion, " +
    "fine detail of engraving, texture, and craftsmanship visible, " +
    "luxury jewelry photography — think Tiffany, Cartier campaign quality",
  "Electronics / Gadgets":
    "screen reflections handled naturally, " +
    "metal/aluminum surfaces with accurate brushed metal texture, " +
    "precise edge highlights on device corners, " +
    "tech product photography — think Apple, Sony, Samsung marketing quality",
  "Food & Beverage":
    "food-safe styling: fresh, appetizing, accurate colors, " +
    "steam or condensation if appropriate, " +
    "ingredients styled naturally, no artificial-looking food, " +
    "appetizing food photography — think Bon Appétit, premium restaurant quality",
  "Apparel / Shoes / Bags":
    "fabric texture accurately rendered — weave, stitching, material weight visible, " +
    "product shown without wrinkles unless intentional, " +
    "color accurate to real garment, " +
    "fashion product photography — think ZARA, H&M campaign quality",
};

// ── Complete Prompt Templates ─────────────────────────────────────────────────

function buildStudioPrompt(product, color, material, background, lighting) {
  const bgMap = {
    "Pure White":    "pure white background (#FFFFFF), soft-box lighting from upper-left at 45 degrees, even diffused fill light from right eliminating harsh shadows, subtle natural drop shadow directly below product",
    "Warm White":    "warm ivory white background (#FAFAF5), warm soft-box lighting at 3400K color temperature, gentle directional light creating soft shadows on one side, product on warm white matte surface with subtle reflection",
    "Soft Grey":     "soft neutral grey background (#E8E8E8), even studio lighting, silver reflector fill, defined soft shadow showing product solidity",
    "Gradient Grey": "light to mid grey gradient background (#E8E8E8 to #D0D0D0), directional studio lighting from upper-left, clean professional aesthetic",
  };
  const bgDesc = bgMap[background] || bgMap["Pure White"];
  return `Professional studio product photography of ${product}, ${color} ${material}, ` +
    `${bgDesc}, ` +
    `product occupying 80% of frame, perfectly sharp focus throughout, ` +
    `commercial catalog quality, no props, no background elements, ${QUALITY_SUFFIX}`;
}

function buildLifestylePrompt(product, color, material, background, lighting, category) {
  const contextMap = {
    "Kitchen Counter":    "warm wooden kitchen counter, morning window light coming from the left, coffee cup and fresh herbs as props",
    "Wooden Table":       "warm wooden breakfast table, soft morning window light, 2 complementary lifestyle props arranged naturally",
    "Marble Surface":     "white marble surface with subtle grey veining, soft natural window light from upper-left diffused through sheer curtain, small green plant or dried botanicals as prop",
    "Bedroom / Soft Linen": "soft linen bedding surface, warm ambient morning light, minimal props: candle and single flower",
    "Office Desk":        "clean modern desk surface, soft ambient office light, notebook and pen as minimal props",
    "Bathroom Shelf":     "clean bathroom shelf, soft natural light, green plant leaf and white towel as props",
    "Outdoor Patio":      "outdoor patio wooden surface, natural warm daylight, organic props from environment",
    "Rustic Wood":        "rustic weathered wood surface, warm natural side light, organic props: dried herbs or stone",
    "Concrete Floor":     "clean concrete floor, overcast natural daylight, minimal urban props",
  };
  const ctx = contextMap[background] || contextMap["Wooden Table"];
  const lightingDesc = {
    warm:      "warm 3200–3500K ambient tone, golden morning light",
    bright:    "bright soft diffused daylight, high key, airy feel",
    natural:   "natural window light, soft gentle shadows, realistic",
    cool:      "cool neutral light 5500K, crisp and modern",
    moody:     "moody directional light, strong shadow side",
    cinematic: "cinematic accent lighting, deep contrast",
  }[lighting] || "warm 3200–3500K ambient tone, golden morning light";
  return `Lifestyle editorial product photography of ${product}, ${color} ${material}, ` +
    `placed on ${ctx}, ` +
    `${lightingDesc}, ` +
    `shallow depth of field (f/2.8 equivalent), background softly blurred, ` +
    `product as hero subject, props supporting not competing, ` +
    `horizontal composition, editorial magazine quality, ` +
    `natural, authentic, aspirational lifestyle aesthetic, ${QUALITY_SUFFIX}`;
}

function buildFlatlayPrompt(product, color, material, background, lighting) {
  const bgMap = {
    "White Linen":          "white/off-white linen fabric surface",
    "Natural Wood Grain":   "natural wood grain surface",
    "Marble":               "white marble surface with subtle grey veining",
    "Kraft Paper":          "kraft paper surface, warm earthy tones",
    "Black Velvet":         "deep black velvet surface",
    "Pastel Fabric":        "soft pastel fabric surface",
    "Rattan / Wicker Mat":  "natural rattan/wicker mat surface",
  };
  const bgDesc = bgMap[background] || bgMap["White Linen"];
  const isDark = background === "Black Velvet";
  return `Flat lay overhead product photography of ${product}, ${color} ${material}, ` +
    `camera directly above at 90 degrees, perfectly parallel to surface, ` +
    `product centered on ${bgDesc}, ` +
    `minimal complementary props: 2–3 small props arranged naturally around product, ` +
    `${isDark ? "directional side lighting creating subtle texture in velvet surface, deep blacks, rich tones, product color contrasting against dark background" : "even soft diffused overhead lighting, no harsh shadows, crisp sharp focus across entire frame"}, ` +
    `clean minimal Instagram-style composition, breathing room around edges, ${QUALITY_SUFFIX}`;
}

function buildDarkLuxuryPrompt(product, color, material, background, lighting) {
  const bgMap = {
    "Pure Black":               "deep black background (#080808 to #111111)",
    "Deep Navy":                "deep navy blue background",
    "Dark Charcoal":            "dark charcoal grey background",
    "Deep Burgundy":            "deep burgundy/wine-red background",
    "Dark Forest Green":        "dark forest green background",
    "Textured Black Leather":   "dark textured black leather background",
  };
  const bgDesc = bgMap[background] || bgMap["Pure Black"];
  return `Luxury dark product photography of ${product}, ${color} ${material}, ` +
    `${bgDesc}, ` +
    `precision rim lighting from behind-left and behind-right creating highlight edges on product, ` +
    `subtle fill light from front preventing total darkness on product face, ` +
    `product on dark reflective surface with clean reflection below, ` +
    `deep dramatic shadows, rich deep tones, ` +
    `premium luxury brand aesthetic (think: Chanel, Dior, Apple), ` +
    `cinematic composition, product perfectly sharp, ` +
    `highlights catching the product's best material qualities, ${QUALITY_SUFFIX}`;
}

function buildOutdoorPrompt(product, color, material, background, lighting) {
  const bgMap = {
    "Natural Grass":    "natural grass surface, golden hour sunlight from one side, real nature elements softly visible in background",
    "Sandy Beach":      "sandy beach surface, warm coastal sunlight, ocean blur in background",
    "Rocky Surface":    "rocky natural surface, dramatic natural lighting, rugged authentic feel",
    "Forest Floor":     "forest floor with natural organic texture, dappled sunlight through trees",
    "Urban Concrete":   "clean concrete surface, natural overcast daylight, slight real-world environmental context in blurred background",
    "Rooftop Terrace":  "rooftop terrace surface, golden hour city skyline softly blurred in background",
  };
  const bgDesc = bgMap[background] || bgMap["Urban Concrete"];
  const lightingDesc = {
    warm:      "warm golden hour sunlight from low angle, long warm shadows",
    bright:    "bright natural overcast daylight, even soft illumination",
    natural:   "natural daylight, authentic shadows",
    cool:      "cool overcast natural light, crisp and clean",
    moody:     "dramatic directional sunlight, strong contrast",
    cinematic: "cinematic golden hour, warm amber light",
  }[lighting] || "natural daylight";
  return `Outdoor ${lighting === "warm" ? "golden hour " : ""}product photography of ${product}, ${color} ${material}, ` +
    `placed on ${bgDesc}, ` +
    `${lightingDesc}, ` +
    `product casting natural shadow, ` +
    `editorial outdoor style, authentic not staged, ` +
    `depth in image: sharp product, soft blurred background, ` +
    `clean contemporary lifestyle-forward aesthetic, ${QUALITY_SUFFIX}`;
}

function buildMinimalistPrompt(product, color, material, background, lighting) {
  const bgMap = {
    "Pure White":       "pure white surface and background",
    "Off-white Texture": "off-white textured surface, subtle material texture visible",
    "Soft Sage":        "soft sage green matte surface and matching background",
    "Dusty Pink":       "dusty rose/pink matte surface and matching background",
    "Light Beige":      "warm light beige surface and background",
    "Pale Grey":        "pale grey surface with seamless background",
  };
  const bgDesc = bgMap[background] || bgMap["Pure White"];
  return `Minimalist product photography of ${product}, ${color} ${material}, ` +
    `product placed on ${bgDesc}, ` +
    `massive negative space around product (product occupies 30–40% of frame), ` +
    `extremely soft diffused overhead light, almost shadowless, ` +
    `if shadow: single precise soft shadow on one side only, ` +
    `no props, no distractions, absolute minimal aesthetic, ` +
    `product's form and design as the only visual element, ` +
    `luxury minimalist brand quality (think: Apple, Aesop, Muji), ` +
    `product perfectly sharp, background seamlessly clean, ${QUALITY_SUFFIX}`;
}

// ── Main Prompt Builder ───────────────────────────────────────────────────────

export function buildPhotographyPrompt({ product, color, material, category, style, background, lighting }) {
  const prod = product || "product";
  const col = color || "neutral";
  const mat = material || "material";
  const bg = background || "";
  const light = lighting || "natural";

  let basePrompt;
  switch (style) {
    case "studio":     basePrompt = buildStudioPrompt(prod, col, mat, bg, light); break;
    case "lifestyle":  basePrompt = buildLifestylePrompt(prod, col, mat, bg, light, category); break;
    case "flatlay":    basePrompt = buildFlatlayPrompt(prod, col, mat, bg, light); break;
    case "dark":       basePrompt = buildDarkLuxuryPrompt(prod, col, mat, bg, light); break;
    case "outdoor":    basePrompt = buildOutdoorPrompt(prod, col, mat, bg, light); break;
    case "minimalist": basePrompt = buildMinimalistPrompt(prod, col, mat, bg, light); break;
    default:           basePrompt = buildStudioPrompt(prod, col, mat, bg || "Pure White", light);
  }

  // Add category-specific enhancements
  const enhancement = CATEGORY_ENHANCEMENTS[category] || "";
  const fullPrompt = enhancement
    ? `${basePrompt}, ${enhancement}`
    : basePrompt;

  return { prompt: fullPrompt, negativePrompt: NEGATIVE_PROMPT };
}

// ── Product Analysis with Gemini ──────────────────────────────────────────────

export async function analyzeProductForPhotography(imageUrl, userPrompt = "") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return getDefaultAnalysis(userPrompt);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const analysisPrompt = `Analyze this product image and return ONLY a JSON object with these exact fields:
{
  "product_name": "specific product name",
  "product_category": "one of: Beauty / Skincare / Perfume | Food & Beverage | Jewelry / Watches | Apparel / Shoes / Bags | Electronics / Gadgets | Home Decor / Candles | Sports / Fitness | Stationery / Books | Toys / Kids | Other",
  "product_subcategory": "specific subcategory e.g. Perfume Bottle, Coffee Mug",
  "primary_color": "exact color name",
  "material_feel": "one of: Soft | Hard | Smooth | Rough | Glossy | Matte | Natural",
  "size_class": "one of: Tiny | Small | Medium | Large",
  "premium_budget_signal": "one of: Luxury | Mid-range | Budget | Cannot tell",
  "target_audience": "one of: Women | Men | Unisex | Kids | Professional | Lifestyle",
  "image_quality": "one of: Good | Poor | Blurry | Badly lit"
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
    console.warn("Photography analysis failed:", err.message);
    return getDefaultAnalysis(userPrompt);
  }
}

function getDefaultAnalysis(userPrompt = "") {
  const lower = userPrompt.toLowerCase();
  let category = "Other";
  if (/perfume|serum|cream|skincare|beauty|fragrance/.test(lower)) category = "Beauty / Skincare / Perfume";
  else if (/jewelry|watch|ring|necklace|bracelet/.test(lower)) category = "Jewelry / Watches";
  else if (/shoe|sneaker|bag|purse|apparel|shirt|dress/.test(lower)) category = "Apparel / Shoes / Bags";
  else if (/phone|laptop|gadget|electronics|headphone/.test(lower)) category = "Electronics / Gadgets";
  else if (/food|drink|coffee|tea|beverage|snack/.test(lower)) category = "Food & Beverage";
  else if (/candle|decor|vase|lamp|home/.test(lower)) category = "Home Decor / Candles";
  return {
    product_name: userPrompt.split(" ").slice(0, 3).join(" ") || "product",
    product_category: category,
    product_subcategory: "product",
    primary_color: "neutral",
    material_feel: "Smooth",
    size_class: "Small",
    premium_budget_signal: "Mid-range",
    target_audience: "Unisex",
    image_quality: "Good",
  };
}

// ── Style Suggestions Based on Analysis ──────────────────────────────────────

export function suggestPhotographyStyles(analysis) {
  const category = analysis.product_category || "Other";
  const isPremium = analysis.premium_budget_signal === "Luxury";
  let suggested = CATEGORY_STYLE_SUGGESTIONS[category] || ["studio", "lifestyle", "minimalist"];
  if (isPremium && !suggested.includes("dark")) suggested = ["dark", ...suggested.slice(0, 2)];
  return suggested.slice(0, 3).map(id => ({
    styleId: id,
    style: PHOTOGRAPHY_STYLES.find(s => s.id === id),
    reason: STYLE_SUGGEST_REASON[id] || "",
  }));
}

// ── Refinement Intent Detection ───────────────────────────────────────────────

export function detectRefinementIntent(text) {
  const lower = text.toLowerCase();
  const refinements = {
    dark:       /dark background|black background|dark kar do|black kar/.test(lower),
    white:      /white kar do|plain background|white background/.test(lower),
    warm:       /\bwarm\b|golden|garam light/.test(lower),
    moody:      /moody|dramatic|contrast zyada|moody kar/.test(lower),
    outdoor:    /outdoor|nature|grass|beach/.test(lower),
    props:      /flower add|plant|props lagao/.test(lower),
    noprops:    /clean karo|props hatao|simple karo/.test(lower),
    reflection: /reflection chahiye/.test(lower),
    noshadow:   /shadow hatao|shadow nahi/.test(lower),
    premium:    /zyada premium|luxury feel/.test(lower),
    brighter:   /aur bright|chehra dikhao/.test(lower),
    marble:     /marble/.test(lower),
    wooden:     /wooden|wood/.test(lower),
  };
  return Object.entries(refinements)
    .filter(([, v]) => v)
    .map(([k]) => k);
}
