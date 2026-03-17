import { Router } from "express";
import { generateImages, removeBackground, analyzeProduct } from "../services/pipeline.js";

const router = Router();

const STYLE_SCENE_PROMPTS = {
  luxury: "luxury marble studio, gold reflections, premium product placement, elegant shadows, white marble surface, soft golden rim lighting, photorealistic",
  marble: "white and grey marble surface, subtle veining, clean reflections, minimalist product environment, professional studio backdrop",
  floral: "fresh flowers surrounding product, soft petals, botanical garden setting, pastel tones, spring aesthetic, natural light filtering",
  minimal: "pure white seamless background, clean product isolation, minimalist styling, crisp soft shadows, ecommerce standard, professional",
  neon: "neon-lit futuristic environment, cyberpunk aesthetic, vibrant pink and cyan glow, dark background, light trails, tech-inspired",
  beach: "sunny beach environment, golden sand, ocean waves in background, warm tropical light, summer atmosphere",
};

const TOOL_PROMPTS = {
  "Generate Catalog": "ecommerce catalog product photo, clean isolated composition, consistent studio lighting, sharp detail, high resolution",
  "Product Photography": "studio-quality product photography, professional composition, editorial quality",
  "Cinematic Ads": "cinematic CGI advertisement, dramatic angle, volumetric lighting, 4K ultra render",
  "Ad Creatives": "social media advertisement, eye-catching composition, bold visual, marketing material",
};

router.post("/", async (req, res) => {
  const { imageUrl, prompt, tool, style, model, userId } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  const hasToken = !!process.env.REPLICATE_API_TOKEN;
  const scenePrompt = STYLE_SCENE_PROMPTS[style] ?? STYLE_SCENE_PROMPTS.luxury;
  const toolPrompt = TOOL_PROMPTS[tool] ?? TOOL_PROMPTS["Generate Catalog"];
  const fullPrompt = [prompt, scenePrompt, toolPrompt, "photorealistic, 8K, commercial photography"].join(", ");
  const modelQuality = model === "pro" ? "high quality, ultra realistic, detailed, masterpiece" : "good quality, realistic";
  const finalPrompt = `${fullPrompt}, ${modelQuality}`;

  try {
    let productInfo = { category: "product" };
    let bgRemovedUrl = imageUrl || null;
    let generatedUrls = null;

    if (hasToken) {
      if (imageUrl) {
        [productInfo, bgRemovedUrl] = await Promise.all([
          analyzeProduct(imageUrl).catch(() => ({ category: "product" })),
          removeBackground(imageUrl).catch(() => imageUrl),
        ]);
      }
      const productDesc = productInfo.description
        ? `${productInfo.description}, ` : "";
      generatedUrls = await generateImages(
        `${productDesc}${prompt}`,
        scenePrompt,
        3
      );
    }

    if (generatedUrls && generatedUrls.length > 0) {
      return res.json({
        success: true,
        images: generatedUrls,
        bgRemovedUrl,
        productInfo,
        augmentedPrompt: finalPrompt,
        hasRealImages: true,
      });
    }

    return res.json({
      success: true,
      images: [],
      bgRemovedUrl: bgRemovedUrl || imageUrl || null,
      productInfo,
      augmentedPrompt: finalPrompt,
      hasRealImages: false,
      requiresApiKey: !hasToken,
    });
  } catch (err) {
    console.error("Generation error:", err.message);
    return res.status(500).json({
      error: err.message,
      success: false,
      images: [],
      hasRealImages: false,
    });
  }
});

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    hasReplicateToken: !!process.env.REPLICATE_API_TOKEN,
    timestamp: new Date().toISOString(),
  });
});

export { router as generateRouter };
