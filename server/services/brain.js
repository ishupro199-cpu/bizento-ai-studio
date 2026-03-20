import { GoogleGenerativeAI } from "@google/generative-ai";

const TOOL_RULES = {
  catalog: {
    name: "Generate Catalog",
    keywords: ["catalog","listing","amazon","flipkart","meesho","marketplace","white background","clean background","main image","product shot","ecommerce","product listing","white bg"],
    hinglish: ["listing","catalog","amazon pe","flipkart pe","white bg","clean shot"],
  },
  photo: {
    name: "Product Photography",
    keywords: ["photo","photography","studio","lifestyle","scene","environment","outdoor","indoor","marble","luxury","splash","reflection","bokeh","depth","editorial","magazine"],
    hinglish: ["photo","studio","scene","lifestyle","photography"],
  },
  creative: {
    name: "Ad Creatives",
    keywords: ["ad","creative","social media","instagram","facebook","poster","banner","promotion","sale","offer","discount","marketing","brand","advertisement","reel","story"],
    hinglish: ["ad","creative","instagram","facebook","poster","offer","sale","marketing","promotion"],
  },
  cinematic: {
    name: "Cinematic Ads",
    keywords: ["cinematic","cgi","3d","film","movie","dramatic","volumetric","fog","smoke","particles","blockbuster","premium ad","luxury ad","video ad","cinematic ad","slow motion"],
    hinglish: ["cinematic","cgi","dramatic","premium ad","luxury ad","filmi"],
  },
};

const PRODUCT_PATTERNS = [
  { pattern: /perfume|fragrance|attar|scent|cologne/i, type: "fragrance", category: "Beauty & Personal Care" },
  { pattern: /watch|ghadi|timepiece/i, type: "watch", category: "Accessories" },
  { pattern: /shoe|sneaker|boot|sandal|footwear|chappal/i, type: "footwear", category: "Footwear" },
  { pattern: /bag|purse|handbag|backpack|clutch|wallet/i, type: "bag", category: "Accessories" },
  { pattern: /phone|mobile|smartphone/i, type: "smartphone", category: "Electronics" },
  { pattern: /food|drink|beverage|juice|coffee|tea|snack|sweet|mithai/i, type: "food", category: "Food & Beverage" },
  { pattern: /cosmetic|makeup|lipstick|foundation|blush|mascara|eyeshadow/i, type: "cosmetics", category: "Beauty & Personal Care" },
  { pattern: /jewelry|jewellery|ring|necklace|earring|bracelet|chain|pendant/i, type: "jewelry", category: "Jewelry" },
  { pattern: /cloth|shirt|kurta|dress|t-shirt|top|jeans|fabric|apparel|fashion/i, type: "clothing", category: "Fashion & Apparel" },
  { pattern: /supplement|protein|vitamin|capsule|tablet|health/i, type: "supplement", category: "Health & Wellness" },
  { pattern: /skincare|cream|serum|moisturizer|face wash|lotion|sunscreen/i, type: "skincare", category: "Skincare" },
  { pattern: /bottle|jar|container|packaging/i, type: "packaging", category: "General Product" },
  { pattern: /candle|lamp|decor|home|furniture/i, type: "home_decor", category: "Home & Decor" },
  { pattern: /gadget|tech|device|laptop|tablet|earphone|headphone/i, type: "electronics", category: "Electronics" },
];

function detectProductInfo(prompt) {
  const lower = prompt.toLowerCase();
  for (const { pattern, type, category } of PRODUCT_PATTERNS) {
    if (pattern.test(lower)) return { type, category };
  }
  return { type: "product", category: "General Product" };
}

function detectToolFromKeywords(prompt) {
  const lower = prompt.toLowerCase();
  const scores = {};
  for (const [toolId, config] of Object.entries(TOOL_RULES)) {
    scores[toolId] = 0;
    for (const kw of config.keywords) {
      if (lower.includes(kw)) scores[toolId] += 2;
    }
    for (const kw of config.hinglish) {
      if (lower.includes(kw)) scores[toolId] += 1.5;
    }
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (best[0][1] === 0) return { tool: "catalog", confidence: 0.4, fallback: true };
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  return {
    tool: best[0][0],
    confidence: Math.min(0.95, best[0][1] / total + 0.2),
    fallback: false,
  };
}

async function classifyWithGemini(prompt, hasImage, productInfo) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const instruction = `You are the AI Brain of Pixalera — a smart ecommerce creative platform.
Your job: analyze the user's request and return a JSON object with the classification.

Available tools:
- catalog: Product catalog images for marketplaces (white bg, Amazon/Flipkart listings, clean shots)
- photo: Professional product photography (studio, lifestyle, scene, environment, luxury, artistic)
- creative: Social media ad creatives (Instagram, Facebook, posters, banners, promotions)
- cinematic: Cinematic CGI ads (dramatic, 3D-like, volumetric, blockbuster quality, premium)

User request: "${prompt}"
Has product image: ${hasImage}
Detected product: ${productInfo.type} (${productInfo.category})

Return ONLY this JSON (no markdown, no explanation):
{
  "intent": "generate" | "chat",
  "tool": "catalog" | "photo" | "creative" | "cinematic",
  "confidence": 0.0-1.0,
  "reasoning": "one sentence why you picked this tool",
  "suggestion": "Best result: [Tool Name] — [why]",
  "productType": "detected product type",
  "styleRecommendation": "luxury|minimal|neon|floral|beach",
  "hinglishDetected": true|false,
  "replyLanguage": "english|hindi|hinglish"
}`;

    const result = await model.generateContent(instruction);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn("Brain Gemini classification failed:", err.message);
    return null;
  }
}

async function classifyWithOpenAI(prompt, hasImage, productInfo, openaiClient) {
  if (!openaiClient) return null;
  try {
    const resp = await openaiClient.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `You are the AI Brain of Pixalera. Analyze the user request and return a JSON object.
Tools: catalog (marketplace/white bg), photo (studio/lifestyle), creative (ads/social media), cinematic (CGI/dramatic).
Return ONLY JSON: {"intent":"generate|chat","tool":"catalog|photo|creative|cinematic","confidence":0.0-1.0,"reasoning":"one sentence","suggestion":"Best result: X — reason","productType":"string","styleRecommendation":"luxury|minimal|neon|floral|beach","hinglishDetected":true|false,"replyLanguage":"english|hindi|hinglish"}`,
        },
        {
          role: "user",
          content: `User request: "${prompt}"\nHas image: ${hasImage}\nProduct: ${productInfo.type} (${productInfo.category})`,
        },
      ],
      max_completion_tokens: 512,
    });
    const text = resp.choices[0]?.message?.content?.trim() || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  } catch (err) {
    console.warn("Brain OpenAI classification failed:", err.message);
    return null;
  }
}

export async function runBrain({ prompt, hasImage, imageAnalysis = null, openaiClient = null }) {
  const productInfo = detectProductInfo(prompt);
  const keywordResult = detectToolFromKeywords(prompt);

  let aiResult = null;
  const hasAI = !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL);

  aiResult = await classifyWithGemini(prompt, hasImage, productInfo);
  if (!aiResult && hasAI && openaiClient) {
    aiResult = await classifyWithOpenAI(prompt, hasImage, productInfo, openaiClient);
  }

  const isChatPrompt = !hasImage &&
    prompt.trim().split(/\s+/).length <= 6 &&
    !Object.values(TOOL_RULES).flatMap(r => [...r.keywords, ...r.hinglish]).some(kw => prompt.toLowerCase().includes(kw));

  let finalResult;

  if (aiResult) {
    finalResult = {
      intent: aiResult.intent || (isChatPrompt ? "chat" : "generate"),
      tool: aiResult.tool || keywordResult.tool,
      toolName: TOOL_RULES[aiResult.tool || keywordResult.tool]?.name || "Generate Catalog",
      confidence: aiResult.confidence || keywordResult.confidence,
      reasoning: aiResult.reasoning || "Based on your request",
      suggestion: aiResult.suggestion || `Best result: ${TOOL_RULES[aiResult.tool || keywordResult.tool]?.name}`,
      productType: aiResult.productType || productInfo.type,
      productCategory: productInfo.category,
      styleRecommendation: aiResult.styleRecommendation || "luxury",
      hinglishDetected: aiResult.hinglishDetected || false,
      replyLanguage: aiResult.replyLanguage || "english",
      source: "ai",
    };
  } else {
    finalResult = {
      intent: isChatPrompt ? "chat" : "generate",
      tool: keywordResult.tool,
      toolName: TOOL_RULES[keywordResult.tool]?.name || "Generate Catalog",
      confidence: keywordResult.confidence,
      reasoning: keywordResult.fallback ? "Defaulting to catalog generation" : "Matched keywords in your request",
      suggestion: `Best result: ${TOOL_RULES[keywordResult.tool]?.name}`,
      productType: productInfo.type,
      productCategory: productInfo.category,
      styleRecommendation: "luxury",
      hinglishDetected: /\b(hai|karo|chahiye|banana|karna|accha|tera|mera|wala|pe|ko|ka|ki|se)\b/i.test(prompt),
      replyLanguage: /\b(hai|karo|chahiye|banana|karna|accha|tera|mera|wala)\b/i.test(prompt) ? "hinglish" : "english",
      source: "keywords",
    };
  }

  if (imageAnalysis) {
    finalResult.imageAnalysis = imageAnalysis;
  }

  console.log(`[Brain] Tool: ${finalResult.toolName} | Confidence: ${(finalResult.confidence * 100).toFixed(0)}% | Source: ${finalResult.source}`);
  return finalResult;
}

export function getToolVariantPrompts(basePrompt, tool, style) {
  const styleMap = {
    luxury: "luxury marble studio, gold reflections, premium lighting, white marble surface",
    minimal: "pure white seamless background, clean ecommerce standard, minimalist",
    neon: "neon-lit futuristic environment, cyberpunk, vibrant pink and cyan glow",
    floral: "fresh flowers surrounding product, soft petals, botanical, pastel tones",
    beach: "sunny beach, golden sand, warm tropical light, summer atmosphere",
    marble: "white and grey marble surface, subtle veining, professional studio",
  };
  const sceneBase = styleMap[style] || styleMap.luxury;

  const variants = {
    catalog: [
      `${basePrompt}, ${sceneBase}, pure white seamless background, centered product, centered composition, ecommerce standard, Amazon-ready, sharp detail, soft studio shadows, photorealistic`,
      `${basePrompt}, ${sceneBase}, 45-degree angle shot, slight elevation, product depth visible, clean studio background, soft lighting, professional catalog photography, photorealistic`,
      `${basePrompt}, ${sceneBase}, lifestyle context, elegant environment, product in use scenario, editorial composition, premium brand feel, photorealistic`,
    ],
    photo: [
      `${basePrompt}, ${sceneBase}, studio-quality photography, dramatic single-source lighting, deep shadows, luxury surface reflection, product hero shot, photorealistic`,
      `${basePrompt}, ${sceneBase}, splash effect, liquid droplets frozen in motion, high-speed photography aesthetic, dynamic composition, photorealistic`,
      `${basePrompt}, ${sceneBase}, soft bokeh background, depth of field, lifestyle editorial, warm ambient lighting, magazine quality, photorealistic`,
    ],
    creative: [
      `${basePrompt}, ${sceneBase}, Instagram square ad creative, bold typography space top-third, product centered, high-contrast colors, scroll-stopping composition, marketing visual, photorealistic`,
      `${basePrompt}, ${sceneBase}, Facebook banner ad, product left-aligned, offer text space right side, clean brand layout, conversion-optimized, photorealistic`,
      `${basePrompt}, ${sceneBase}, promotional poster design, product hero, bold visual impact, sale offer layout, brand-ready composition, high energy, photorealistic`,
    ],
    cinematic: [
      `${basePrompt}, ${sceneBase}, cinematic CGI advertisement, dramatic volumetric fog, golden hour rim lighting, blockbuster production quality, 4K ultra HD, anamorphic lens look, photorealistic`,
      `${basePrompt}, ${sceneBase}, cinematic 3D environment, particles floating (smoke/dust/light), moody dark background, product spotlight, film-quality color grading, photorealistic`,
      `${basePrompt}, ${sceneBase}, luxury brand cinema ad, sweeping camera motion blur, product in dramatic surreal environment, high production value, award-winning photography, photorealistic`,
    ],
  };

  return variants[tool] || variants.catalog;
}
