import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── PLATFORM TITLE FORMULAS ─────────────────────────────────────────────────

function buildAmazonTitle(a) {
  const brand = a.brand_name && a.brand_name !== "unbranded" ? a.brand_name : "Unbranded";
  const type = a.product_subcategory || a.product_name || "Product";
  const feature1 = a.key_features?.[0] || "";
  const feature2 = a.key_features?.[1] || "";
  const material = a.material && a.material !== "[INFER]" ? a.material : "";
  const color = a.primary_color && a.primary_color !== "neutral" ? a.primary_color : "";
  const size = a.size_visible && a.size_visible !== "[INFER]" ? ` | ${a.size_visible}` : "";

  const parts = [brand, type];
  if (feature1) parts.push(`with ${feature1}`);
  if (feature2) parts.push(`and ${feature2}`);
  const attrs = [material, color].filter(Boolean);
  let title = parts.join(" ");
  if (attrs.length) title += ` | ${attrs.join(" | ")}`;
  title += size;
  return title.substring(0, 200);
}

function buildFlipkartTitle(a) {
  const brand = a.brand_name && a.brand_name !== "unbranded" ? a.brand_name : "";
  const type = a.product_subcategory || a.product_name || "Product";
  const feature1 = a.key_features?.[0] ? `with ${a.key_features[0]}` : "";
  const color = a.primary_color && a.primary_color !== "neutral" ? a.primary_color : "";
  const size = a.size_visible && a.size_visible !== "[INFER]" ? a.size_visible : "";

  const parts = [brand, type, feature1, color, size].filter(Boolean);
  let title = parts.join(" ");
  title += " (Pack of 1)";
  return title.substring(0, 255);
}

function buildMeeshoTitle(a) {
  const type = a.product_subcategory || a.product_name || "Product";
  const feature1 = a.key_features?.[0] || "";
  const color = a.primary_color && a.primary_color !== "neutral" ? a.primary_color : "";
  const material = a.material && a.material !== "[INFER]" ? a.material : "";

  const parts = [type, feature1, color, material].filter(Boolean);
  let title = parts.join(" ");
  if (a.target_use) title += ` for ${a.target_use}`;
  title += " - Gift Ready";
  return title.substring(0, 150);
}

function buildMyntraTitle(a) {
  const brand = a.brand_name && a.brand_name !== "unbranded" ? a.brand_name : "";
  const type = a.product_subcategory || a.product_name || "Product";
  const material = a.material && a.material !== "[INFER]" ? a.material : "";
  const color = a.primary_color && a.primary_color !== "neutral" ? a.primary_color : "";
  const gender = a.target_gender || "Unisex";

  const parts = [brand, type, material, color, `for ${gender}`].filter(Boolean);
  return parts.join(" ").substring(0, 120);
}

// ─── KEYWORD GENERATION ──────────────────────────────────────────────────────

function buildKeywords(a) {
  const type = (a.product_subcategory || a.product_name || "product").toLowerCase();
  const color = a.primary_color && a.primary_color !== "neutral" ? a.primary_color.toLowerCase() : "";
  const material = a.material && a.material !== "[INFER]" ? a.material.toLowerCase() : "";
  const use = (a.target_use || "daily use").toLowerCase();
  const feature1 = (a.key_features?.[0] || "").toLowerCase();

  return [
    type,
    [color, material, type].filter(Boolean).join(" "),
    [use, type].filter(Boolean).join(" "),
    [feature1, type].filter(Boolean).join(" ") || type + " online",
    type + " gift",
  ].filter(Boolean).slice(0, 5);
}

// ─── PLATFORM ATTRIBUTE BUILDERS ─────────────────────────────────────────────

function buildAmazonAttributes(a) {
  const brand = a.brand_name && a.brand_name !== "unbranded" ? a.brand_name : "Generic";
  const attrs = {
    Brand: brand,
    Manufacturer: brand,
    "Model Name": a.product_subcategory || a.product_name || "Standard",
    "Part Number": "NA",
    "Item Form": "Solid",
    "Item Weight": a.weight || "[Ask user \u26A0]",
    "Product Dimensions": a.dimensions || "[Ask user \u26A0]",
    Color: a.primary_color || "Neutral",
    Style: a.finish && a.finish !== "[INFER]" ? a.finish : "Modern",
    Material: a.material && a.material !== "[INFER]" ? a.material : "[Ask user \u26A0]",
    "Finish Type": a.finish && a.finish !== "[INFER]" ? a.finish : "Matte",
    "Special Feature": a.key_features?.slice(0, 3).join(", ") || "Premium Quality",
    "About This Item": buildBulletPoints(a),
    "Included Components": "1 " + (a.product_name || "unit"),
    "Number of Items": "1",
    "Country of Origin": "India",
  };

  const cat = (a.product_category || "").toLowerCase();
  if (cat.includes("home") || cat.includes("kitchen") || cat.includes("food")) {
    attrs["Capacity"] = a.size_visible && a.size_visible !== "[INFER]" ? a.size_visible : "[Ask user \u26A0]";
    attrs["Is Dishwasher Safe"] = "Yes";
    attrs["Is Microwave Safe"] = "Yes";
    attrs["Is Oven Safe"] = "No";
    attrs["Occasion"] = "Everyday Use / Gifting";
  }
  if (cat.includes("apparel") || cat.includes("clothing")) {
    attrs["Department"] = a.target_gender || "Unisex";
    attrs["Size"] = a.size_visible && a.size_visible !== "[INFER]" ? a.size_visible : "[Ask user \u26A0]";
    attrs["Fabric"] = a.material && a.material !== "[INFER]" ? a.material : "[Ask user \u26A0]";
    attrs["Care Instructions"] = "Machine Wash";
    attrs["Fit Type"] = "Regular";
    attrs["Pattern"] = a.pattern || "Solid";
  }
  if (cat.includes("electronics")) {
    attrs["Connectivity Technology"] = "NA";
    attrs["Compatible Devices"] = "Universal";
    attrs["Batteries Required"] = "No";
  }
  if (cat.includes("beauty") || cat.includes("skincare")) {
    attrs["Skin Type"] = "All";
    attrs["Item Volume"] = a.size_visible && a.size_visible !== "[INFER]" ? a.size_visible : "[Ask user \u26A0]";
    attrs["Age Range"] = "Adult";
  }
  return attrs;
}

function buildFlipkartAttributes(a) {
  const brand = a.brand_name && a.brand_name !== "unbranded" ? a.brand_name : "Generic";
  const attrs = {
    Brand: brand,
    Type: a.product_subcategory || a.product_name || "Product",
    Color: a.primary_color || "Neutral",
    Material: a.material && a.material !== "[INFER]" ? a.material : "[Ask user \u26A0]",
    "Sales Package": "1 " + (a.product_name || "Unit"),
    "Model Name": a.product_subcategory || "Standard",
    Capacity: a.size_visible && a.size_visible !== "[INFER]" ? a.size_visible : "[Ask user \u26A0]",
    "Set Of": "1",
    Design: "Plain",
    Shape: "Standard",
    Pattern: a.pattern || "Solid",
    "Primary Material": a.material && a.material !== "[INFER]" ? a.material : "[Ask user \u26A0]",
    Features: a.key_features?.slice(0, 4).join(", ") || "Premium Quality",
    "Ideal For": a.target_gender || "Unisex",
    "In The Box": "1 " + (a.product_name || "Unit"),
    "Net Quantity": "1 Unit",
    "Country of Origin": "India",
    "Warranty Summary": "Seller warranty 7 days",
  };

  const cat = (a.product_category || "").toLowerCase();
  if (cat.includes("home") || cat.includes("kitchen")) {
    attrs["Microwave Safe"] = "Yes";
    attrs["Dishwasher Safe"] = "Yes";
    attrs["BPA Free"] = "Yes";
    attrs["Occasion"] = "Daily Use / Gifting";
  }
  if (cat.includes("apparel")) {
    attrs["Fabric"] = a.material && a.material !== "[INFER]" ? a.material : "[Ask user \u26A0]";
    attrs["Fit"] = "Regular Fit";
    attrs["Sleeve Length"] = "Half";
    attrs["Neck"] = "Round";
  }
  if (cat.includes("footwear")) {
    attrs["Sole Material"] = "Rubber";
    attrs["Outer Material"] = a.material && a.material !== "[INFER]" ? a.material : "Synthetic";
    attrs["Closure"] = "Lace-Up";
    attrs["Occasion"] = "Casual";
  }
  return attrs;
}

function buildMeeshoAttributes(a) {
  return {
    "Product Type": a.product_subcategory || a.product_name || "Product",
    Color: a.primary_color || "Neutral",
    Material: a.material && a.material !== "[INFER]" ? a.material : "[Ask user \u26A0]",
    Size: a.size_visible && a.size_visible !== "[INFER]" ? a.size_visible : "[Ask user \u26A0]",
    "Pack Of": "1",
    Brand: a.brand_name && a.brand_name !== "unbranded" ? a.brand_name : "No Brand",
    Style: a.finish && a.finish !== "[INFER]" ? a.finish : "Casual",
    Pattern: a.pattern || "Solid",
    Occasion: "Casual / Daily",
    "Ideal For": a.target_gender || "Unisex",
    "Country of Origin": "India",
    "Product Description": `${a.primary_color || ""} ${a.product_name || "product"} — great quality, perfect for daily use and gifting. Affordable and stylish.`.trim().substring(0, 300),
  };
}

function buildMyntraAttributes(a) {
  const brand = a.brand_name && a.brand_name !== "unbranded" ? a.brand_name : "Generic";
  return {
    Brand: brand,
    "Product Type": a.product_subcategory || a.product_name || "Product",
    Gender: a.target_gender || "Unisex",
    Color: a.primary_color || "Neutral",
    Fabric: a.material && a.material !== "[INFER]" ? a.material : "[Ask user \u26A0]",
    Care: "Machine wash cold, do not bleach",
    Pattern: a.pattern || "Solid",
    Fit: "Regular",
    "Sleeve Length": "Half",
    Neck: "Round Neck",
    Occasion: "Casual",
    Sustainable: "No",
    Hemline: "Regular",
    "Number of Pockets": "0",
    Reversible: "No",
    "Country of Origin": "India",
    "Size Note": "Refer to size guide for best fit",
  };
}

function buildInstagramAttributes(a) {
  const productName = a.product_name || "product";
  const color = a.primary_color && a.primary_color !== "neutral" ? a.primary_color.toLowerCase() : "";
  return {
    "Caption (full)": buildInstagramCaption(a),
    Hashtags: buildInstagramHashtags(a),
    "Story Text": `${productName} — stylish & quality you'll love. Tap to explore.`.substring(0, 60),
    "Product Tag Text": `${color ? color + " " : ""}${productName} | Premium Quality | Link in bio`.substring(0, 100),
    "Alt Text": `${color ? color + " " : ""}${productName} on white background, professional product photo`,
  };
}

function buildInstagramCaption(a) {
  const productName = a.product_name || "product";
  const color = a.primary_color && a.primary_color !== "neutral" ? a.primary_color.toLowerCase() + " " : "";
  const material = a.material && a.material !== "[INFER]" ? a.material.toLowerCase() + " " : "";
  const feature1 = a.key_features?.[0] ? `, ${a.key_features[0]}` : "";

  return `You deserve better quality. ✨
Meet the ${color}${material}${productName} — crafted for everyday use${feature1}.
Tap the link in bio to get yours.

${buildInstagramHashtags(a)}`;
}

function buildInstagramHashtags(a) {
  const type = (a.product_name || "product").toLowerCase().replace(/\s+/g, "");
  const category = (a.product_category || "product").toLowerCase().replace(/\s+/g, "");
  const material = a.material && a.material !== "[INFER]" ? a.material.toLowerCase().replace(/\s+/g, "") : null;
  const color = a.primary_color && a.primary_color !== "neutral" ? a.primary_color.toLowerCase().replace(/\s+/g, "") : null;

  const tags = [
    `#${type}`,
    `#premium${type}`,
    `#${category}`,
    `#${category}lover`,
    color ? `#${color}aesthetic` : "#minimaliststyle",
    material ? `#${material}` : "#qualityproduct",
    "#shopnow",
    "#homedecor",
    "#gifting",
    "#aesthetic",
    "#trending",
    "#musthave",
    "#instashop",
    "#productphotography",
    "#newcollection",
    "#lifestyle",
    "#premium",
    "#qualityover",
    "#giftsforhim",
    "#giftsforher",
  ].filter(Boolean).slice(0, 20);

  return tags.join(" ");
}

function buildBulletPoints(a) {
  const name = a.product_name || "product";
  const material = a.material && a.material !== "[INFER]" ? a.material : "quality material";
  const color = a.primary_color && a.primary_color !== "neutral" ? a.primary_color : "";
  const features = a.key_features || [];

  const bullets = [
    `Premium ${material} construction ensures long-lasting durability for everyday use`,
    features[0] ? `Features ${features[0]} for enhanced convenience and usability` : `Thoughtfully designed for maximum comfort and daily use`,
    features[1] ? `${features[1]} adds extra functionality to suit your lifestyle needs` : `${color ? color + " finish" : "Elegant finish"} adds a stylish touch to any setting`,
    `Makes a perfect gift for any occasion — beautifully packaged and ready to present`,
    `Backed by seller quality assurance — easy returns within 7 days`,
  ];
  return bullets;
}

// ─── DESCRIPTION BUILDER ─────────────────────────────────────────────────────

function buildDescription(a) {
  const name = a.product_name || "product";
  const material = a.material && a.material !== "[INFER]" ? a.material.toLowerCase() : "quality";
  const color = a.primary_color && a.primary_color !== "neutral" ? a.primary_color.toLowerCase() + " " : "";
  const feature1 = a.key_features?.[0] || "";
  const feature2 = a.key_features?.[1] || "";
  const use = a.target_use || "daily use";
  const cat = (a.product_category || "").toLowerCase();

  let desc = `The ${color}${name} is designed for those who value quality and style in their ${use}. `;
  if (cat.includes("home") || cat.includes("kitchen") || cat.includes("food")) {
    desc += `Crafted from ${material}, it brings both function and elegance to your kitchen or dining space. `;
  } else if (cat.includes("apparel")) {
    desc += `Made from ${material} fabric, it offers all-day comfort without compromising on style. `;
  } else if (cat.includes("beauty") || cat.includes("skincare")) {
    desc += `Formulated for everyday skincare, it works gently yet effectively on all skin types. `;
  } else {
    desc += `Built with ${material}, this product is made to last and perform. `;
  }

  if (feature1) desc += `The ${feature1}${feature2 ? ` and ${feature2}` : ""} make it stand out from ordinary alternatives. `;
  desc += `Premium ${material} quality that you can see and feel. `;
  desc += `Whether for personal use or as a gift, this ${name} is a thoughtful choice for any occasion.`;

  return desc.substring(0, 1000);
}

// ─── MISSING ATTRIBUTE DETECTION ─────────────────────────────────────────────

export function detectMissingAttributeInfo(message) {
  const m = message.toLowerCase().trim();
  const signals = {
    capacity: m.match(/\b(\d+\s*(ml|l|liter|litre|oz|fl oz|cup|cups))\b/i),
    weight: m.match(/\b(\d+\.?\d*\s*(kg|g|gram|grams|pound|lb|lbs|oz))\b/i),
    size: m.match(/\b(size\s*\d+|xs|sm|s|m|l|xl|xxl|xxxl|\d+\s*(eu|uk|us|cm|inch|inches|\"|\'))\b/i),
    dimensions: m.match(/\b(\d+\s*(x|×|by)\s*\d+(\s*(x|×)\s*\d+)?)\s*(cm|mm|inch|inches|m)?\b/i),
    material: m.match(/\b(\d+%\s*\w+|pure\s+\w+|100%\s*\w+|\w+\s+grade\s+\w+|stainless steel|pure cotton|genuine leather)\b/i),
    model: m.match(/\b(model|sku|ref|part)\s*[:#]?\s*[a-z0-9\-]+\b/i),
    origin: m.match(/\b(made in|manufactured in|imported from)\s+\w+\b/i),
    care: m.match(/\b(hand wash|machine wash|dry clean|do not wash|tumble dry|air dry)\b/i),
    bpa: m.match(/\bbpa[\s-]?free\b/i),
  };

  const detectedFields = Object.entries(signals)
    .filter(([, match]) => !!match)
    .map(([key]) => key);

  return { isAttributeUpdate: detectedFields.length > 0, detectedFields, raw: message };
}

export function mapAttributesToPlatforms(message, currentAnalysis = {}) {
  const m = message.toLowerCase();
  const updates = {};

  // Capacity
  const capMatch = m.match(/(\d+\.?\d*)\s*(ml|l|liter|litre|oz|fl oz)/i);
  if (capMatch) {
    const val = `${capMatch[1]}${capMatch[2].toUpperCase()}`;
    updates.capacity = val;
    updates.size_visible = val;
  }

  // Weight
  const weightMatch = m.match(/(\d+\.?\d*)\s*(kg|g|gram|grams|pound|lb)/i);
  if (weightMatch) {
    let grams = parseFloat(weightMatch[1]);
    if (weightMatch[2].toLowerCase() === "kg") grams *= 1000;
    updates.weight = `${Math.round(grams)} g`;
  }

  // Dimensions
  const dimMatch = m.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*(cm|mm|inch|inches)?/i);
  if (dimMatch) {
    const unit = dimMatch[4] || "cm";
    updates.dimensions = `${dimMatch[1]} x ${dimMatch[2]}${dimMatch[3] ? " x " + dimMatch[3] : ""} ${unit}`;
  }

  // Size / clothing
  const sizeMatch = m.match(/\b(size\s*(\d+|xs|sm|s|m|l|xl|xxl|xxxl))\b/i);
  if (sizeMatch) updates.size_visible = sizeMatch[2] || sizeMatch[1];

  // Material %
  const matMatch = m.match(/(\d+%\s*\w+(?:\s+\d+%\s*\w+)*|pure\s+\w+|100%\s*\w+)/i);
  if (matMatch) {
    updates.material = matMatch[0].trim().replace(/\b\w/g, c => c.toUpperCase());
  }

  // Country of origin
  const originMatch = m.match(/(?:made in|manufactured in|imported from)\s+(\w+(?:\s+\w+)?)/i);
  if (originMatch) updates.country_of_origin = originMatch[1].trim();

  // Care instructions
  const careMap = [
    ["hand wash", "Hand Wash Only"],
    ["machine wash", "Machine Wash Cold"],
    ["dry clean", "Dry Clean Only"],
    ["tumble dry", "Tumble Dry Low"],
    ["air dry", "Air Dry"],
  ];
  for (const [keyword, label] of careMap) {
    if (m.includes(keyword)) { updates.care = label; break; }
  }

  // BPA free
  if (/bpa[\s-]?free/i.test(m)) updates.bpa_free = true;

  return updates;
}

// ─── AI-POWERED SEO GENERATION ───────────────────────────────────────────────

async function generateCatalogSEOWithGemini(analysis) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert ecommerce SEO specialist for Indian marketplaces.

Product Details:
- Name: ${analysis.product_name}
- Category: ${analysis.product_category}
- Subcategory: ${analysis.product_subcategory}
- Brand: ${analysis.brand_name}
- Primary Color: ${analysis.primary_color}
- Material: ${analysis.material}
- Key Features: ${(analysis.key_features || []).join(", ")}
- Target Use: ${analysis.target_use}

Generate platform-specific SEO content. Return ONLY this JSON:
{
  "amazon": {
    "title": "Amazon title max 200 chars: Brand ProductType Feature1 Feature2 | Material | Color | Size",
    "description": "Product description 3-4 paragraphs, primary keyword in first 20 words, max 1000 chars",
    "keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5"],
    "bulletPoints": ["15-25 word bullet 1","15-25 word bullet 2","15-25 word bullet 3","15-25 word bullet 4","15-25 word bullet 5"]
  },
  "flipkart": {
    "title": "Flipkart title max 255 chars: Brand ProductType Feature Color Size (Pack of 1)",
    "description": "Flipkart description, conversational, benefit-focused",
    "keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5"]
  },
  "meesho": {
    "title": "Meesho title max 150 chars: ProductType Design Color Material - for TargetAudience",
    "description": "Short casual description max 300 chars, value/affordability angle",
    "keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5"]
  },
  "myntra": {
    "title": "Myntra title max 120 chars: Brand ProductType Material Color for Men/Women",
    "description": "Fashion-forward description, style language",
    "keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5"]
  },
  "instagram": {
    "caption": "Hook line.\\nProduct benefit 2 sentences.\\nCall to action.\\n\\n#hashtag1 #hashtag2 (15-20 hashtags)",
    "storyText": "2-line max 60 chars for stories",
    "productTag": "15 words max product tag text"
  }
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  } catch (err) {
    console.warn("Catalog SEO Gemini generation failed:", err.message);
    return null;
  }
}

// ─── MAIN SEO ENTRY POINTS ───────────────────────────────────────────────────

export async function generateCatalogSEO(analysis) {
  let aiContent = null;
  try {
    aiContent = await generateCatalogSEOWithGemini(analysis);
  } catch (e) {
    console.warn("AI catalog SEO skipped:", e.message);
  }

  const keywords = buildKeywords(analysis);
  const description = buildDescription(analysis);
  const bulletPoints = buildBulletPoints(analysis);

  const platforms = {
    amazon: {
      title: aiContent?.amazon?.title || buildAmazonTitle(analysis),
      description: aiContent?.amazon?.description || description,
      keywords: aiContent?.amazon?.keywords || keywords,
      bulletPoints: aiContent?.amazon?.bulletPoints || bulletPoints,
      attributes: buildAmazonAttributes(analysis),
    },
    flipkart: {
      title: aiContent?.flipkart?.title || buildFlipkartTitle(analysis),
      description: aiContent?.flipkart?.description || description,
      keywords: aiContent?.flipkart?.keywords || keywords,
      attributes: buildFlipkartAttributes(analysis),
    },
    meesho: {
      title: aiContent?.meesho?.title || buildMeeshoTitle(analysis),
      description: aiContent?.meesho?.description || description,
      keywords: aiContent?.meesho?.keywords || keywords,
      attributes: buildMeeshoAttributes(analysis),
    },
    myntra: {
      title: aiContent?.myntra?.title || buildMyntraTitle(analysis),
      description: aiContent?.myntra?.description || description,
      keywords: aiContent?.myntra?.keywords || keywords,
      attributes: buildMyntraAttributes(analysis),
    },
    instagram: {
      caption: aiContent?.instagram?.caption || buildInstagramCaption(analysis),
      storyText: aiContent?.instagram?.storyText || `${analysis.product_name} — quality you can feel. Tap to explore.`,
      productTag: aiContent?.instagram?.productTag || `${analysis.primary_color || ""} ${analysis.product_name} | Premium | Link in bio`.trim(),
      attributes: buildInstagramAttributes(analysis),
    },
  };

  return {
    platforms,
    // default seoTitle for legacy components
    seoTitle: platforms.amazon.title,
    description: platforms.amazon.description,
    keywords,
    bulletPoints,
    attributes: platforms.amazon.attributes,
    category: analysis.product_category,
  };
}

// ─── EXISTING NON-CATALOG SEO (unchanged for Ad Creatives etc.) ──────────────

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
    keywords: [prompt.toLowerCase(), (productInfo?.category || "product").toLowerCase(), "premium", "quality", "buy online", "best price", "fast delivery", "top rated"],
    metaDescription: `Buy ${prompt} online. Premium quality, fast delivery. Shop now for the best deals.`,
    category: productInfo?.category || "General",
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
