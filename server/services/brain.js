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

function detectIntentTypeFromKeywords(prompt) {
  const lower = prompt.toLowerCase().trim();
  const words = lower.split(/\s+/);

  // GREETING detection
  const greetingWords = ["hi", "hello", "hey", "namaste", "hii", "helo", "sup", "yo", "greetings", "haan", "okay", "theek hai", "acha", "ok"];
  const greetingPhrases = ["kya kar sakte", "what can you", "tell me about", "help chahiye", "what is pixalera", "what are you", "kya ho tum", "pixalera kya hai", "kya karta hai"];
  if (words.length <= 3 && greetingWords.some(g => lower === g || lower.startsWith(g + " ") || lower.endsWith(" " + g))) {
    return "greeting";
  }
  if (greetingPhrases.some(p => lower.includes(p))) return "greeting";

  // QUESTION detection
  const questionStarters = ["kya", "kaise", "kyun", "what", "how", "why", "when", "where", "which", "explain", "samjhao", "batao", "difference", "tell me", "bata"];
  if (lower.endsWith("?")) return "question";
  for (const q of questionStarters) {
    if (lower.startsWith(q + " ") || lower.startsWith(q + " ")) return "question";
  }

  // ATTRIBUTE UPDATE detection (user is providing missing product info after results shown)
  const attributeSignals = [
    /\b\d+\.?\d*\s*(ml|l|liter|litre|oz|fl\s?oz)\b/i,
    /\b\d+\.?\d*\s*(kg|g|gram|grams|pound|lb|lbs)\b/i,
    /\bsize\s*\d+\b/i,
    /\b(xs|sm|xl|xxl|xxxl)\b/i,
    /\b\d+%\s*\w+/i,
    /\bpure\s+\w+\b/i,
    /\b100%\s*\w+/i,
    /\b(made in|manufactured in|imported from)\s+\w+/i,
    /\b(hand wash|machine wash|dry clean|tumble dry|air dry)\b/i,
    /\bbpa[\s-]?free\b/i,
    /\b(model|sku|ref)\s*[:#]?\s*[a-z0-9\-]+/i,
    /\b\d+\s*(x|×)\s*\d+(\s*(x|×)\s*\d+)?\s*(cm|mm|inch|inches)?\b/i,
  ];
  if (attributeSignals.some(r => r.test(lower))) return "attribute_update";

  // REFINE detection
  const refineWords = ["change karo", "thoda alag", "dobara", "regenerate", "aur bright", "nahi yaar", "ek aur banao", "phir se", "same but", "background white", "background change", "color change", "alag background"];
  if (refineWords.some(r => lower.includes(r))) return "refine";

  // UNCLEAR detection
  const unclearPhrases = ["kuch banao", "image chahiye", "help karo", "kuch bhi", "jo bhi", "koi bhi", "koi image"];
  if (unclearPhrases.some(u => lower.includes(u))) return "unclear";

  // Very short with no generation keywords — unclear
  const allGenerateKws = Object.values(TOOL_RULES).flatMap(r => [...r.keywords, ...r.hinglish]);
  const hasGenerateKw = allGenerateKws.some(kw => lower.includes(kw));
  const generateActionWords = ["banao","create","generate","bana do","chahiye","make","bana","bnao","taiyaar","design","render","produce"];
  const hasActionWord = generateActionWords.some(a => lower.includes(a));
  if (words.length <= 2 && !hasGenerateKw && !hasActionWord) return "unclear";

  return "generate";
}

async function classifyWithGemini(prompt, hasImage, productInfo, conversationState) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const instruction = `You are the AI Brain of Pixalera — a smart ecommerce creative platform.

BEFORE DOING ANYTHING, classify the user's message into EXACTLY ONE of these 6 intent types:
- greeting: casual chat, hi/hello, asking what Pixalera does, small talk
- question: asking for information, how-to, pricing, features, explanations
- generate: wants to create/generate a product image (check image presence)
- refine: wants to change/edit an existing output (only if conversationState is OUTPUT_SHOWN)
- attribute_update: user is providing missing product info — numbers+units (350ml, 1.2kg), material%, size, dimensions, model number, care instructions, country of origin
- unclear: not enough info to determine what they want

Available tools (only relevant for generate intent):
- catalog: marketplace listings, white background, Amazon/Flipkart
- photo: studio/lifestyle photography, scenes, environments
- creative: social media ads, Instagram, Facebook, posters
- cinematic: CGI ads, dramatic, volumetric, blockbuster

User request: "${prompt}"
Has product image: ${hasImage}
Detected product: ${productInfo.type} (${productInfo.category})
Conversation state: ${conversationState || "FRESH"}

Return ONLY this JSON (no markdown, no explanation):
{
  "intentType": "greeting" | "question" | "generate" | "refine" | "unclear",
  "intent": "generate" | "chat",
  "tool": "catalog" | "photo" | "creative" | "cinematic",
  "confidence": 0.0-1.0,
  "reasoning": "one sentence why you picked this intent and tool",
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

async function classifyWithOpenAI(prompt, hasImage, productInfo, openaiClient, conversationState) {
  if (!openaiClient) return null;
  try {
    const resp = await openaiClient.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `You are the AI Brain of Pixalera. Classify user intent into one of 5 types: greeting, question, generate, refine, unclear.
Tools (for generate): catalog (marketplace/white bg), photo (studio/lifestyle), creative (ads/social), cinematic (CGI/dramatic).
Return ONLY JSON: {"intentType":"greeting|question|generate|refine|unclear","intent":"generate|chat","tool":"catalog|photo|creative|cinematic","confidence":0.0-1.0,"reasoning":"one sentence","suggestion":"Best result: X — reason","productType":"string","styleRecommendation":"luxury|minimal|neon|floral|beach","hinglishDetected":true|false,"replyLanguage":"english|hindi|hinglish"}`,
        },
        {
          role: "user",
          content: `User request: "${prompt}"\nHas image: ${hasImage}\nProduct: ${productInfo.type} (${productInfo.category})\nConversation state: ${conversationState || "FRESH"}`,
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

export async function runBrain({ prompt, hasImage, imageAnalysis = null, openaiClient = null, conversationState = "FRESH" }) {
  const productInfo = detectProductInfo(prompt);
  const keywordResult = detectToolFromKeywords(prompt);
  const keywordIntentType = detectIntentTypeFromKeywords(prompt);

  let aiResult = null;
  const hasAI = !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL);

  aiResult = await classifyWithGemini(prompt, hasImage, productInfo, conversationState);
  if (!aiResult && hasAI && openaiClient) {
    aiResult = await classifyWithOpenAI(prompt, hasImage, productInfo, openaiClient, conversationState);
  }

  // Determine intentType: AI result takes priority, then keyword detection
  let intentType = aiResult?.intentType || keywordIntentType;

  // Override: if OUTPUT_SHOWN and no clear generate action, lean towards refine
  if (conversationState === "OUTPUT_SHOWN" && intentType === "generate") {
    const refineSignals = ["change", "alag", "different", "thoda", "again", "phir", "dobara", "nahi", "update", "modify"];
    if (refineSignals.some(r => prompt.toLowerCase().includes(r))) {
      intentType = "refine";
    }
  }

  // Determine legacy intent field (chat vs generate) from intentType
  const chatIntents = ["greeting", "question", "unclear", "attribute_update"];
  const legacyIntent = (chatIntents.includes(intentType) && !hasImage) ? "chat" : "generate";

  const finalIntentType = intentType;
  const finalTool = aiResult?.tool || keywordResult.tool;

  let finalResult;

  if (aiResult) {
    finalResult = {
      intentType: finalIntentType,
      intent: legacyIntent,
      tool: finalTool,
      toolName: TOOL_RULES[finalTool]?.name || "Generate Catalog",
      confidence: aiResult.confidence || keywordResult.confidence,
      reasoning: aiResult.reasoning || "Based on your request",
      suggestion: aiResult.suggestion || `Best result: ${TOOL_RULES[finalTool]?.name}`,
      productType: aiResult.productType || productInfo.type,
      productCategory: productInfo.category,
      styleRecommendation: aiResult.styleRecommendation || "luxury",
      hinglishDetected: aiResult.hinglishDetected || false,
      replyLanguage: aiResult.replyLanguage || "english",
      source: "ai",
    };
  } else {
    finalResult = {
      intentType: finalIntentType,
      intent: legacyIntent,
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

  console.log(`[Brain] IntentType: ${finalResult.intentType} | Tool: ${finalResult.toolName} | Confidence: ${(finalResult.confidence * 100).toFixed(0)}% | Source: ${finalResult.source}`);
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
