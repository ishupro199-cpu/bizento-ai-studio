import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import OpenAI from "openai";
import { generateImages, removeBackground, analyzeProduct, buildCatalogShotPrompts } from "../services/pipeline.js";
import { verifyFirebaseToken, checkCreditAndSuspend, refundCredits } from "../middleware/auth.js";
import { getAdminDb } from "../config/firebase.js";
import { generateChatReply, augmentPromptWithGemini } from "../services/gemini.js";
import { runBrain, getToolVariantPrompts } from "../services/brain.js";
import { generateSEO, generateCatalogSEO, detectMissingAttributeInfo, mapAttributesToPlatforms } from "../services/seoGenerator.js";
import {
  analyzeProductForPhotography,
  suggestPhotographyStyles,
  buildPhotographyPrompt,
  detectRefinementIntent,
  PHOTOGRAPHY_STYLES,
  STYLE_BACKGROUNDS,
  LIGHTING_MOODS,
} from "../services/photographyPipeline.js";

const router = Router();

let _openai = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "placeholder",
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return _openai;
}

const TOOL_SYSTEM_PROMPTS = {
  "Generate Catalog": `You are an expert e-commerce product photography prompt engineer for PixaLera AI.
Your job: given a user's product description, build a single powerful image generation prompt optimized for catalog/marketplace images.
Rules:
- Output ONLY the final image generation prompt string, nothing else
- Focus on clean white/neutral backgrounds, sharp product details, ecommerce standards (Amazon, Flipkart, Meesho)
- Add appropriate lighting, shadow, and composition keywords
- Keep it under 200 words`,

  "Product Photography": `You are an expert product photography prompt engineer for PixaLera AI.
Your job: given a user's product description and style, build a single powerful image generation prompt.
Rules:
- Output ONLY the final image generation prompt string, nothing else
- Focus on studio-quality, editorial, lifestyle photography with dramatic lighting and composition
- Add splash effects, reflections, bokeh, luxury environments
- Keep it under 200 words`,

  "Cinematic Ads": `You are an expert CGI cinematic advertisement prompt engineer for PixaLera AI.
Your job: given a user's product description, build a single powerful cinematic image generation prompt.
Rules:
- Output ONLY the final image generation prompt string, nothing else
- Focus on dramatic lighting, volumetric fog, cinematic color grading, blockbuster production quality
- Include camera angle, lens specification, 3D environment, particles (smoke/water/glow)
- Keep it under 200 words`,

  "Ad Creatives": `You are an expert social media ad creative prompt engineer for PixaLera AI.
Your job: given a user's product description, build a single powerful advertising image generation prompt.
Rules:
- Output ONLY the final image generation prompt string, nothing else
- Focus on bold visuals, marketing impact, scroll-stopping composition
- Include brand feel, typography space, headline area, platform optimization
- Keep it under 200 words`,
};

const QUALITY_PROMPT_SUFFIX = {
  "720p": "standard quality, sharp product",
  "1K":   "high quality, crisp detail, professional",
  "2K":   "ultra high quality, fine detail, 2K resolution, crystal clear",
  "4K":   "4K ultra HD, masterpiece quality, hyper-detailed, maximum resolution",
};

const MODEL_PROMPT_SUFFIX = {
  flash: "good quality, realistic, professional commercial photography",
  pro:   "ultra realistic, photorealistic masterpiece, hyper-detailed, award-winning photography",
};

const STYLE_SCENE_PROMPTS = {
  luxury:  "luxury marble studio, gold reflections, premium product placement, elegant shadows, white marble surface, soft golden rim lighting",
  marble:  "white and grey marble surface, subtle veining, clean reflections, minimalist product environment, professional studio backdrop",
  floral:  "fresh flowers surrounding product, soft petals, botanical garden setting, pastel tones, spring aesthetic, natural light filtering",
  minimal: "pure white seamless background, clean product isolation, minimalist styling, crisp soft shadows, ecommerce standard, professional",
  neon:    "neon-lit futuristic environment, cyberpunk aesthetic, vibrant pink and cyan glow, dark background, light trails, tech-inspired",
  beach:   "sunny beach environment, golden sand, ocean waves in background, warm tropical light, summer atmosphere",
};

const ASPECT_RATIO_MAP = {
  "1:1":  "square format, perfect for marketplace listings",
  "4:5":  "portrait format, optimized for Instagram",
  "16:9": "widescreen landscape, perfect for banners and ads",
  "9:16": "vertical portrait, optimized for Stories and Reels",
  "3:2":  "standard landscape, professional photography format",
};

async function buildSmartPrompt({ prompt, tool, style, model, quality, aspectRatio }) {
  const hasAI = !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL);
  const scenePrompt = STYLE_SCENE_PROMPTS[style] ?? STYLE_SCENE_PROMPTS.luxury;
  const qualitySuffix = QUALITY_PROMPT_SUFFIX[quality] ?? QUALITY_PROMPT_SUFFIX["1K"];
  const modelSuffix = MODEL_PROMPT_SUFFIX[model] ?? MODEL_PROMPT_SUFFIX.flash;
  const ratioHint = ASPECT_RATIO_MAP[aspectRatio] ?? "";

  if (!hasAI) {
    const toolBase = {
      "Generate Catalog": "ecommerce catalog product photo, clean isolated composition, consistent studio lighting, sharp detail",
      "Product Photography": "studio-quality product photography, professional composition, editorial quality",
      "Cinematic Ads": "cinematic CGI advertisement, dramatic angle, volumetric lighting, 4K ultra render",
      "Ad Creatives": "social media advertisement, eye-catching composition, bold visual, marketing material",
    }[tool] ?? "professional product photography";

    return [prompt, scenePrompt, toolBase, qualitySuffix, modelSuffix, ratioHint, "photorealistic, commercial photography"]
      .filter(Boolean).join(", ");
  }

  try {
    const systemPrompt = TOOL_SYSTEM_PROMPTS[tool] ?? TOOL_SYSTEM_PROMPTS["Generate Catalog"];
    const userMsg = `Product description: "${prompt}"
Style: ${style}
Scene: ${scenePrompt}
Quality: ${quality} (${qualitySuffix})
Model: ${model} (${modelSuffix})
Aspect Ratio: ${aspectRatio} (${ratioHint})

Build the perfect image generation prompt for this product.`;

    const resp = await getOpenAI().chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMsg },
      ],
      max_completion_tokens: 512,
    });
    return resp.choices[0]?.message?.content?.trim() || `${prompt}, ${scenePrompt}, ${qualitySuffix}, ${modelSuffix}, photorealistic`;
  } catch (err) {
    console.error("AI prompt build failed, using fallback:", err.message);
    return [prompt, scenePrompt, qualitySuffix, modelSuffix, "photorealistic, commercial photography"].filter(Boolean).join(", ");
  }
}

async function generateAIReply(prompt, replyLanguage = "english") {
  const hasAI = !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL);

  const systemContent = `You are PixaLera AI assistant — a helpful, friendly AI for professional product photography and marketing visual generation.
You help users generate stunning product catalog images, professional product photography, cinematic ads, and social media ad creatives.
When users ask questions, give concise, helpful answers.
When they describe a product, suggest the best tool and style for them.
Keep replies short (2-4 sentences max). Be warm and professional.
If the user writes in Hindi or Hinglish, reply in the same language naturally.`;

  try {
    const { reply } = await generateChatReply(prompt, [], null);
    if (reply && reply !== "I'm here to help you create stunning product visuals! Tell me what product you'd like to photograph.") {
      return reply;
    }
  } catch {}

  if (hasAI) {
    try {
      const resp = await getOpenAI().chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 256,
      });
      return resp.choices[0]?.message?.content?.trim() || null;
    } catch (err) {
      console.error("AI reply failed:", err.message);
    }
  }

  return null;
}

router.post(
  "/",
  verifyFirebaseToken,
  checkCreditAndSuspend,
  async (req, res) => {
    const {
      imageUrl,
      prompt,
      tool: requestedTool,
      style,
      model,
      quality = "1K",
      aspectRatio = "1:1",
      numOutputs = 3,
      autoDetect = false,
    } = req.body;
    const uid = req.uid;

    if (!prompt) {
      return res.status(400).json({ error: "prompt required" });
    }

    const hasToken = !!process.env.REPLICATE_API_TOKEN;
    const startTime = Date.now();

    try {
      let productInfo = { type: "product", category: "General Product" };
      let bgRemovedUrl = imageUrl || null;
      let imageAnalysis = null;

      if (hasToken && imageUrl) {
        const [analysisResult, bgResult] = await Promise.all([
          analyzeProduct(imageUrl).catch(() => ({ category: "product", description: "" })),
          removeBackground(imageUrl).catch(() => imageUrl),
        ]);
        imageAnalysis = analysisResult;
        bgRemovedUrl = bgResult;
        if (analysisResult?.category) {
          productInfo = { type: analysisResult.category, category: analysisResult.category, description: analysisResult.description };
        }
      }

      const brainResult = await runBrain({
        prompt,
        hasImage: !!imageUrl,
        imageAnalysis,
        openaiClient: getOpenAI(),
      });

      // ── ATTRIBUTE UPDATE: user is providing missing product info after output ─────
      if (brainResult.intentType === "attribute_update") {
        const attrDetect = detectMissingAttributeInfo(prompt);
        if (attrDetect.isAttributeUpdate) {
          const updates = mapAttributesToPlatforms(prompt);
          const lang = brainResult.replyLanguage || "hinglish";
          const fieldNames = Object.keys(updates).join(", ");
          const confirmMsg = lang === "english"
            ? `Updated! I've applied ${fieldNames} across all platform attributes.`
            : `Update kar diya! ${fieldNames} — yeh sab platforms pe reflect ho gaya hai. Neechey attributes panel mein dekho.`;
          return res.json({
            success: true,
            intent: "attribute_update",
            aiReply: confirmMsg,
            attributeUpdates: updates,
            images: [],
            hasRealImages: false,
            creditsConsumed: 0,
            creditsRemaining: req.balanceAfter,
            brainInsights: brainResult,
          });
        }
      }

      // ── CHAT ONLY (greeting / question / unclear) ─────────────────────────────
      if (brainResult.intent === "chat" && !imageUrl && !autoDetect && !requestedTool) {
        const reply = await generateAIReply(prompt, brainResult.replyLanguage);
        return res.json({
          success: true,
          intent: "chat",
          aiReply: reply || "I'm here to help you create stunning product images! Describe your product and I'll generate professional photos for you.",
          images: [],
          hasRealImages: false,
          creditsConsumed: 0,
          creditsRemaining: req.balanceAfter,
          brainInsights: brainResult,
        });
      }

      const effectiveTool = requestedTool || brainResult.toolName;
      const effectiveStyle = style || brainResult.styleRecommendation || "luxury";

      // ── CATALOG GENERATION: 6 shot types ─────────────────────────────────────
      if (effectiveTool === "Generate Catalog" && imageUrl && imageAnalysis) {
        const shotPrompts = buildCatalogShotPrompts(imageAnalysis);

        let catalogShots = [];
        if (hasToken) {
          const shotResults = await Promise.allSettled(
            shotPrompts.map(shot =>
              generateImages(shot.prompt, "", 1).catch(() => null)
            )
          );
          catalogShots = shotPrompts.map((shot, i) => {
            const result = shotResults[i];
            const urls = result.status === "fulfilled" ? result.value : null;
            return {
              type: shot.type,
              label: shot.label,
              description: shot.description,
              prompt: shot.prompt,
              imageUrl: urls?.[0] || null,
            };
          });
        } else {
          catalogShots = shotPrompts.map(shot => ({
            type: shot.type,
            label: shot.label,
            description: shot.description,
            prompt: shot.prompt,
            imageUrl: null,
          }));
        }

        const catalogSEO = await generateCatalogSEO(imageAnalysis);
        const generationTime = Math.round((Date.now() - startTime) / 1000);
        const allUrls = catalogShots.map(s => s.imageUrl).filter(Boolean);
        const hasRealImages = allUrls.length > 0;

        const adminDb = getAdminDb();
        if (adminDb) {
          await adminDb.collection("admin").doc("stats").set(
            { totalGenerations: FieldValue.increment(1), totalCreditsUsed: FieldValue.increment(req.creditCost || 6) },
            { merge: true }
          ).catch(() => {});
        }

        return res.json({
          success: true,
          intent: "generate",
          images: allUrls,
          catalogShots,
          bgRemovedUrl: bgRemovedUrl || imageUrl || null,
          productInfo: imageAnalysis,
          augmentedPrompt: shotPrompts[0]?.prompt || prompt,
          hasRealImages,
          requiresApiKey: !hasToken,
          creditsConsumed: req.creditCost || 6,
          creditsRemaining: req.balanceAfter,
          seoData: catalogSEO,
          catalogSEO,
          brainInsights: brainResult,
          generationTime,
        });
      }

      // ── STANDARD GENERATION (Photo / Ad Creatives / Cinematic) ───────────────
      const variantPrompts = getToolVariantPrompts(prompt, brainResult.tool, effectiveStyle);
      const finalPrompt = await buildSmartPrompt({
        prompt,
        tool: effectiveTool,
        style: effectiveStyle,
        model,
        quality,
        aspectRatio,
      });

      let generatedUrls = null;

      if (hasToken) {
        const outputs = Math.max(1, Math.min(3, numOutputs || 3));
        generatedUrls = await generateImages(finalPrompt, "", outputs);

        if (generatedUrls && generatedUrls.length > 0 && outputs > 1) {
          const extraNeeded = outputs - generatedUrls.length;
          if (extraNeeded > 0 && variantPrompts.length > 1) {
            const extras = await Promise.all(
              variantPrompts.slice(1, 1 + extraNeeded).map(vp =>
                generateImages(vp, "", 1).catch(() => null)
              )
            );
            for (const extra of extras) {
              if (extra && extra[0]) generatedUrls.push(extra[0]);
            }
          }
        }
      }

      const [seoData] = await Promise.all([
        generateSEO({
          prompt,
          productInfo,
          tool: effectiveTool,
          openaiClient: getOpenAI(),
        }),
      ]);

      const generationTime = Math.round((Date.now() - startTime) / 1000);
      const hasRealImages = !!(generatedUrls && generatedUrls.length > 0);

      const adminDb = getAdminDb();
      if (adminDb) {
        await adminDb.collection("admin").doc("stats").set(
          {
            totalGenerations: FieldValue.increment(1),
            totalCreditsUsed: FieldValue.increment(req.creditCost || 3),
          },
          { merge: true }
        ).catch(() => {});
      }

      return res.json({
        success: true,
        intent: "generate",
        images: generatedUrls || [],
        bgRemovedUrl: bgRemovedUrl || imageUrl || null,
        productInfo,
        augmentedPrompt: finalPrompt,
        hasRealImages,
        requiresApiKey: !hasToken,
        creditsConsumed: req.creditCost || 3,
        creditsRemaining: req.balanceAfter,
        seoData,
        brainInsights: brainResult,
        variantPrompts,
        generationTime,
      });
    } catch (err) {
      console.error("Generation error:", err.message);

      if (req.creditDeducted && uid) {
        await refundCredits(
          uid,
          req.creditCost || 0,
          requestedTool || "Generate Catalog",
          model || "flash",
          `Generation failed: ${err.message}`,
          getAdminDb()
        );
      }

      return res.status(500).json({
        error: err.message,
        success: false,
        images: [],
        hasRealImages: false,
        refunded: req.creditDeducted || false,
      });
    }
  }
);

router.post("/chat", async (req, res) => {
  const { prompt, history = [] } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });
  const { reply, model } = await generateChatReply(prompt, history, getOpenAI);
  res.json({ reply, model });
});

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    hasReplicateToken: !!process.env.REPLICATE_API_TOKEN,
    hasReplitAI: !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL),
    hasGemini: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

export { router as generateRouter };
