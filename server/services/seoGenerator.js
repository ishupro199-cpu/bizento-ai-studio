import { GoogleGenerativeAI } from "@google/generative-ai";

async function generateSEOWithGemini(prompt, productInfo, tool) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const isAd = tool === "Ad Creatives" || tool === "Cinematic Ads";

    const instruction = isAd
      ? `You are an expert ad copywriter for Pixalera AI.
Generate compelling ad copy for this product. Return ONLY a JSON object:
{
  "headline": "Bold 5-8 word headline",
  "subheadline": "Supporting benefit statement",
  "cta": "Call to action text (3-5 words)",
  "offer": "Promotional hook (e.g. '50% OFF Today Only')",
  "bodyText": "2-3 sentence ad body copy",
  "hashtagSuggestions": ["#tag1","#tag2","#tag3","#tag4","#tag5"],
  "platforms": {
    "instagram": "Platform-specific caption",
    "facebook": "Facebook ad headline variant"
  }
}`
      : `You are an expert ecommerce SEO specialist for Pixalera AI.
Generate professional SEO content for this product listing. Return ONLY a JSON object:
{
  "seoTitle": "Optimized product title (60-80 chars, keyword-rich)",
  "description": "Compelling 150-200 word product description with benefits",
  "bulletPoints": ["Feature 1","Feature 2","Feature 3","Feature 4","Feature 5"],
  "keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5","keyword6","keyword7","keyword8"],
  "metaDescription": "155-character meta description for SEO",
  "category": "Product category",
  "attributes": {
    "material": "if applicable or null",
    "color": "if mentioned or null",
    "style": "product style",
    "useCase": "primary use case"
  }
}`;

    const userMsg = `Product description: "${prompt}"
Detected product type: ${productInfo?.type || "product"}
Product category: ${productInfo?.category || "General Product"}
Tool: ${tool}

Generate the content now:`;

    const result = await model.generateContent(`${instruction}\n\n${userMsg}`);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  } catch (err) {
    console.warn("SEO Gemini generation failed:", err.message);
    return null;
  }
}

async function generateSEOWithOpenAI(prompt, productInfo, tool, openaiClient) {
  if (!openaiClient) return null;
  try {
    const isAd = tool === "Ad Creatives" || tool === "Cinematic Ads";
    const resp = await openaiClient.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: isAd
            ? `You are an expert ad copywriter. Return ONLY JSON with: headline, subheadline, cta, offer, bodyText, hashtagSuggestions (array), platforms (object with instagram/facebook).`
            : `You are an expert ecommerce SEO specialist. Return ONLY JSON with: seoTitle, description, bulletPoints (array of 5), keywords (array of 8), metaDescription, category, attributes (object with material/color/style/useCase).`,
        },
        {
          role: "user",
          content: `Product: "${prompt}"\nType: ${productInfo?.type || "product"}\nCategory: ${productInfo?.category || "General"}\nTool: ${tool}`,
        },
      ],
      max_completion_tokens: 1024,
    });
    const text = resp.choices[0]?.message?.content?.trim() || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  } catch (err) {
    console.warn("SEO OpenAI generation failed:", err.message);
    return null;
  }
}

function buildFallbackSEO(prompt, productInfo, tool) {
  const isAd = tool === "Ad Creatives" || tool === "Cinematic Ads";
  const productName = productInfo?.type !== "product" ? productInfo.type : prompt.split(" ").slice(0, 3).join(" ");

  if (isAd) {
    return {
      headline: `Discover Premium ${productName}`,
      subheadline: "Quality you can see, value you can feel",
      cta: "Shop Now",
      offer: "Limited Time Deal",
      bodyText: `Experience the difference with our premium ${prompt}. Crafted for those who demand the best.`,
      hashtagSuggestions: ["#premium", "#quality", "#trending", "#musthave", "#shopnow"],
      platforms: {
        instagram: `✨ ${prompt} — because you deserve the best. Tap to shop! #premium #quality`,
        facebook: `Discover our premium ${prompt}. Shop now and experience the difference.`,
      },
    };
  }

  return {
    seoTitle: `${prompt.substring(0, 60)} | Premium Quality`,
    description: `Discover our premium ${prompt}. Crafted with attention to detail, this product combines quality and style for the modern consumer. Perfect for those who appreciate the finer things in life. Available now with fast delivery and hassle-free returns.`,
    bulletPoints: [
      "Premium quality materials and craftsmanship",
      "Perfect for everyday use and special occasions",
      "Available in multiple styles and variants",
      "Easy to maintain and long-lasting durability",
      "Backed by our satisfaction guarantee",
    ],
    keywords: [prompt.toLowerCase(), productInfo.category.toLowerCase(), "premium", "quality", "buy online", "best price", "fast delivery", "top rated"],
    metaDescription: `Buy ${prompt} online. Premium quality, fast delivery. Shop now for the best deals.`,
    category: productInfo.category,
    attributes: {
      material: null,
      color: null,
      style: "Modern",
      useCase: "General use",
    },
  };
}

export async function generateSEO({ prompt, productInfo, tool, openaiClient = null }) {
  const shouldGenerate = ["Generate Catalog", "Product Photography", "Ad Creatives", "Cinematic Ads"].includes(tool);
  if (!shouldGenerate) return null;

  const hasAI = !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL);

  let result = await generateSEOWithGemini(prompt, productInfo, tool);

  if (!result && hasAI && openaiClient) {
    result = await generateSEOWithOpenAI(prompt, productInfo, tool, openaiClient);
  }

  if (!result) {
    result = buildFallbackSEO(prompt, productInfo, tool);
  }

  return result;
}
