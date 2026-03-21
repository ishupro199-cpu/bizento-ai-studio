export interface StylePreset {
  id: string;
  name: string;
  description: string;
  scenePrompt: string;
  lighting: string;
  camera: string;
  mood: string;
  gradient: string;
  toolModifiers: Record<string, string>;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "luxury",
    name: "Luxury Studio",
    description: "Premium marble and gold aesthetic",
    scenePrompt: "luxury marble studio, gold reflections, premium product placement, elegant shadows, white marble surface, soft golden rim lighting",
    lighting: "soft golden-hour rim lighting, dramatic fill light",
    camera: "85mm portrait lens, f/2.8, shallow depth of field",
    mood: "premium, aspirational, sophisticated",
    gradient: "linear-gradient(135deg, hsl(45 80% 55% / 0.30), hsl(30 60% 40% / 0.20))",
    toolModifiers: {
      "Generate Catalog": "clean white marble surface, product isolated, consistent studio lighting",
      "Product Photography": "luxury marble pedestal, bokeh background, editorial product photography",
      "Cinematic Ads": "cinematic marble environment, volumetric golden light, 4K CGI quality",
      "Ad Creatives": "luxury brand aesthetic, marble texture, gold typography layout space",
    },
  },
  {
    id: "marble",
    name: "Marble Scene",
    description: "Clean marble surfaces and reflections",
    scenePrompt: "white and grey marble surface, subtle veining, clean reflections, minimalist product environment, professional studio backdrop",
    lighting: "soft overhead diffused light, subtle side fill",
    camera: "50mm lens, f/4, medium depth of field",
    mood: "clean, modern, architectural",
    gradient: "linear-gradient(135deg, hsl(0 0% 80% / 0.25), hsl(200 20% 70% / 0.20))",
    toolModifiers: {
      "Generate Catalog": "marble product base, clean background, ecommerce ready",
      "Product Photography": "marble texture foreground, depth of field, architectural feel",
      "Cinematic Ads": "marble environment full scene, motion blur, cinematic",
      "Ad Creatives": "marble and minimal layout, clean design space",
    },
  },
  {
    id: "floral",
    name: "Floral Background",
    description: "Fresh flowers and botanical elements",
    scenePrompt: "fresh flowers surrounding product, soft petals, botanical garden setting, pastel tones, spring aesthetic, natural light filtering",
    lighting: "natural diffused sunlight, dappled shadow from foliage",
    camera: "100mm macro lens, f/2.0, very shallow depth of field",
    mood: "fresh, organic, romantic, approachable",
    gradient: "linear-gradient(135deg, hsl(330 60% 70% / 0.30), hsl(85 50% 55% / 0.22))",
    toolModifiers: {
      "Generate Catalog": "flowers framing product, clean center focus, editorial catalog",
      "Product Photography": "floral arrangements, close-up botanical detail, lifestyle photography",
      "Cinematic Ads": "slow motion falling petals, spring wind, cinematic beauty ad",
      "Ad Creatives": "floral pattern, botanical layout, wellness brand aesthetic",
    },
  },
  {
    id: "minimal",
    name: "Minimal Catalog",
    description: "Pure white background, clean lines",
    scenePrompt: "pure white seamless background, clean product isolation, minimalist styling, no distractions, ecommerce standard, crisp shadows",
    lighting: "flat even studio lighting, soft box, no harsh shadows",
    camera: "medium format lens, f/8, sharp across frame",
    mood: "clean, professional, direct, trustworthy",
    gradient: "linear-gradient(135deg, hsl(0 0% 95% / 0.20), hsl(210 15% 90% / 0.15))",
    toolModifiers: {
      "Generate Catalog": "Amazon/Shopify ready white background, product centered",
      "Product Photography": "ghost mannequin or flat lay, clean product detail",
      "Cinematic Ads": "stark minimalist scene, product hero shot, graphic design",
      "Ad Creatives": "minimal layout, negative space, bold typography area",
    },
  },
  {
    id: "neon",
    name: "Neon Futuristic",
    description: "Cyberpunk neon glow atmosphere",
    scenePrompt: "neon-lit futuristic environment, cyberpunk aesthetic, vibrant pink and cyan glow, dark background, light trails, tech-inspired set design",
    lighting: "neon accent lighting, RGB LED glow, rim lighting with color",
    camera: "wide angle 24mm, f/1.8, long exposure glow",
    mood: "bold, futuristic, energetic, cutting-edge",
    gradient: "linear-gradient(135deg, hsl(280 80% 60% / 0.30), hsl(185 90% 50% / 0.25))",
    toolModifiers: {
      "Generate Catalog": "dark studio neon rim lighting, product glowing, tech aesthetic",
      "Product Photography": "neon reflections on product surface, cyberpunk editorial",
      "Cinematic Ads": "full neon city environment, rain reflections, Matrix-style",
      "Ad Creatives": "neon glow effects, dark background, vibrant gradient typography",
    },
  },
  {
    id: "beach",
    name: "Beach Lifestyle",
    description: "Warm sandy beach outdoor setting",
    scenePrompt: "sunny beach environment, golden sand, ocean waves in background, warm tropical light, lifestyle outdoor product placement, summer atmosphere",
    lighting: "warm golden hour sunlight, natural outdoor, sun flare",
    camera: "35mm lens, f/5.6, lifestyle photography",
    mood: "warm, relaxed, aspirational, summery",
    gradient: "linear-gradient(135deg, hsl(195 70% 55% / 0.28), hsl(45 80% 65% / 0.22))",
    toolModifiers: {
      "Generate Catalog": "beach product flat lay, sand texture, summer catalog",
      "Product Photography": "ocean horizon background, lifestyle product photography",
      "Cinematic Ads": "sunset beach cinematic, slow motion waves, tropical ad",
      "Ad Creatives": "beach lifestyle layout, summer vibes, warm color palette",
    },
  },
];

export const STYLE_PRESETS_MAP: Record<string, StylePreset> = Object.fromEntries(
  STYLE_PRESETS.map((s) => [s.id, s])
);

export function getStylePreset(id: string): StylePreset {
  return STYLE_PRESETS_MAP[id] ?? STYLE_PRESETS[0];
}
