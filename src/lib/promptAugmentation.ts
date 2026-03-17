const STYLE_KEYWORDS: Record<string, string> = {
  luxury: "luxury studio lighting, marble surface, elegant shadows, premium product photography",
  minimal: "clean white background, minimalist composition, soft natural light, modern aesthetic",
  lifestyle: "lifestyle setting, warm tones, natural environment, candid product placement",
  dramatic: "dramatic cinematic lighting, dark moody background, high contrast, professional studio",
  outdoor: "outdoor natural setting, golden hour light, organic textures, environmental product shot",
  neon: "neon accent lighting, futuristic dark background, vibrant glow effects, cyberpunk aesthetic",
};

const TOOL_KEYWORDS: Record<string, string> = {
  "Generate Catalog": "ecommerce catalog product photo, clean isolated shot, consistent lighting",
  "Product Photography": "studio-quality product photography, professional composition, sharp detail",
  "Cinematic Ads": "cinematic CGI advertisement, dramatic camera angle, volumetric lighting, 4K render",
  "Ad Creatives": "social media ad creative, eye-catching composition, bold visual, marketing material",
};

export function augmentPrompt(
  userPrompt: string,
  style: string = "luxury",
  tool: string = "Generate Catalog"
): string {
  const styleStr = STYLE_KEYWORDS[style] || STYLE_KEYWORDS.luxury;
  const toolStr = TOOL_KEYWORDS[tool] || TOOL_KEYWORDS["Generate Catalog"];
  return `${userPrompt}, ${styleStr}, ${toolStr}`;
}
