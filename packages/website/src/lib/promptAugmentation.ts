import { getStylePreset } from "./stylePresets";

const TOOL_BASE: Record<string, string> = {
  "Generate Catalog": "professional ecommerce product catalog photo, clean isolated composition, consistent studio lighting, sharp detail, high resolution",
  "Product Photography": "studio-quality product photography, professional composition, sharp focus across product, editorial quality",
  "Cinematic Ads": "cinematic CGI advertisement, dramatic camera angle, volumetric lighting, 4K ultra render, blockbuster production quality",
  "Ad Creatives": "social media advertisement creative, eye-catching composition, bold visual impact, marketing material, commercial photography",
};

const PRODUCT_TYPE_HINTS: Record<string, string> = {
  perfume: "fragrance bottle, glass reflection, luxury packaging",
  bottle: "glass bottle, liquid product, transparent reflections",
  watch: "watch photography, metallic detail, leather or metal strap",
  shoes: "sneaker photography, footwear lifestyle, dynamic angle",
  bag: "handbag product photography, leather texture, accessories",
  phone: "smartphone photography, screen reflection, tech product",
  food: "food styling, appetizing presentation, fresh ingredients",
  cosmetic: "cosmetics photography, beauty product, makeup styling",
  jewelry: "jewelry photography, macro detail, sparkle and shine",
  clothing: "apparel product photography, fabric texture, fashion styling",
  supplement: "supplement bottle, health product, clean clinical aesthetic",
  skincare: "skincare product photography, texture close-up, beauty brand",
};

function detectProductHints(prompt: string): string {
  const lower = prompt.toLowerCase();
  const hints: string[] = [];
  for (const [keyword, hint] of Object.entries(PRODUCT_TYPE_HINTS)) {
    if (lower.includes(keyword)) hints.push(hint);
  }
  return hints.slice(0, 2).join(", ");
}

export function augmentPrompt(
  userPrompt: string,
  styleId: string = "luxury",
  tool: string = "Generate Catalog"
): string {
  const preset = getStylePreset(styleId);
  const toolBase = TOOL_BASE[tool] ?? TOOL_BASE["Generate Catalog"];
  const toolModifier = preset.toolModifiers[tool] ?? "";
  const productHints = detectProductHints(userPrompt);

  const parts = [
    userPrompt,
    preset.scenePrompt,
    toolModifier,
    productHints,
    toolBase,
    `lighting: ${preset.lighting}`,
    `camera: ${preset.camera}`,
    "photorealistic, professional commercial photography, 8K",
  ].filter(Boolean);

  return parts.join(", ");
}

export function buildScenePrompt(
  userPrompt: string,
  styleId: string,
  tool: string
): string {
  const preset = getStylePreset(styleId);
  const toolModifier = preset.toolModifiers[tool] ?? "";
  return [
    preset.scenePrompt,
    toolModifier,
    `lighting: ${preset.lighting}`,
    `mood: ${preset.mood}`,
    "photorealistic, 4K, commercial photography",
  ]
    .filter(Boolean)
    .join(", ");
}

export function buildProductPrompt(
  userPrompt: string,
  styleId: string,
  tool: string
): string {
  const preset = getStylePreset(styleId);
  const toolBase = TOOL_BASE[tool] ?? TOOL_BASE["Generate Catalog"];
  const productHints = detectProductHints(userPrompt);
  return [
    userPrompt,
    productHints,
    toolBase,
    `style: ${preset.mood}`,
    `camera: ${preset.camera}`,
    "product composited into scene, professional quality, photorealistic",
  ]
    .filter(Boolean)
    .join(", ");
}
