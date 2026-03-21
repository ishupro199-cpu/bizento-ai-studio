import axios from "axios";

const REPLICATE_API = "https://api.replicate.com/v1";
const HF_API = "https://api-inference.huggingface.co/models";
const NVIDIA_API = "https://integrate.api.nvidia.com/v1";

const token = () => process.env.REPLICATE_API_TOKEN;
const hfToken = () => process.env.HUGGINGFACE_API_TOKEN;
const nvidiaToken = () => process.env.NVIDIA_API_KEY;

const ASPECT_RATIO_MAP = {
  "1:1": "1:1",
  "4:5": "4:5",
  "16:9": "16:9",
  "9:16": "9:16",
  "3:2": "3:2",
};

// NVIDIA aspect ratio to dimensions mapping
const NVIDIA_DIMENSIONS = {
  "1:1": { width: 1024, height: 1024 },
  "4:5": { width: 896, height: 1120 },
  "16:9": { width: 1344, height: 768 },
  "9:16": { width: 768, height: 1344 },
  "3:2": { width: 1216, height: 832 },
};

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry(fn, maxRetries = 3, baseDelayMs = 1500) {
  let lastErr;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(1.5, attempt);
        console.warn(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${err.message}`);
        await sleep(delay);
      }
    }
  }
  throw lastErr;
}

async function waitForPrediction(predictionId, maxWaitMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const res = await axios.get(`${REPLICATE_API}/predictions/${predictionId}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    const { status, output, error } = res.data;
    if (status === "succeeded") return output;
    if (status === "failed" || status === "canceled") throw new Error(error || "Prediction failed");
    await sleep(2000);
  }
  throw new Error("Generation timed out");
}

async function generateImagesReplicate(prompt, scenePrompt, count = 3, aspectRatio = "1:1") {
  if (!token()) return null;
  const fullPrompt = scenePrompt ? `${prompt}, ${scenePrompt}` : prompt;
  const mappedRatio = ASPECT_RATIO_MAP[aspectRatio] || "1:1";

  return await withRetry(async () => {
    const res = await axios.post(
      `${REPLICATE_API}/models/black-forest-labs/flux-schnell/predictions`,
      {
        input: {
          prompt: fullPrompt,
          num_outputs: Math.min(count, 4),
          output_format: "webp",
          output_quality: 90,
          aspect_ratio: mappedRatio,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        timeout: 120000,
      }
    );
    if (res.data.status === "succeeded") return res.data.output;
    if (res.data.id) return await waitForPrediction(res.data.id);
    return null;
  }, 2, 2000);
}

async function generateImageHF(prompt, model = "stabilityai/stable-diffusion-xl-base-1.0") {
  const headers = { "Content-Type": "application/json" };
  if (hfToken()) headers["Authorization"] = `Bearer ${hfToken()}`;
  try {
    const res = await axios.post(
      `${HF_API}/${model}`,
      { inputs: prompt, options: { wait_for_model: true } },
      { headers, responseType: "arraybuffer", timeout: 60000 }
    );
    if (res.status === 200) {
      const base64 = Buffer.from(res.data, "binary").toString("base64");
      return `data:image/jpeg;base64,${base64}`;
    }
    return null;
  } catch (err) {
    console.error("HuggingFace generation failed:", err.message);
    return null;
  }
}

// NVIDIA NIM API Image Generation - supports multiple models
async function generateImagesNvidia(prompt, count = 3, aspectRatio = "1:1", model = "stabilityai/stable-diffusion-3-medium") {
  if (!nvidiaToken()) return null;
  
  const dimensions = NVIDIA_DIMENSIONS[aspectRatio] || NVIDIA_DIMENSIONS["1:1"];
  
  // NVIDIA NIM supported image models
  const NVIDIA_MODELS = {
    "sd3": "stabilityai/stable-diffusion-3-medium",
    "sdxl": "stabilityai/sdxl-turbo", 
    "flux": "black-forest-labs/flux-schnell",
    "playground": "playgroundai/playground-v2.5-1024px-aesthetic",
  };
  
  const modelId = NVIDIA_MODELS[model] || model;
  
  return await withRetry(async () => {
    const imagePromises = Array.from({ length: Math.min(count, 4) }, async () => {
      try {
        const res = await axios.post(
          `${NVIDIA_API}/images/generations`,
          {
            model: modelId,
            prompt: prompt,
            n: 1,
            size: `${dimensions.width}x${dimensions.height}`,
            response_format: "b64_json",
          },
          {
            headers: {
              "Authorization": `Bearer ${nvidiaToken()}`,
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            timeout: 120000,
          }
        );
        
        if (res.data?.data?.[0]?.b64_json) {
          return `data:image/png;base64,${res.data.data[0].b64_json}`;
        }
        if (res.data?.data?.[0]?.url) {
          return res.data.data[0].url;
        }
        return null;
      } catch (err) {
        console.error("NVIDIA single image generation failed:", err.message);
        return null;
      }
    });
    
    const results = await Promise.all(imagePromises);
    const validResults = results.filter(Boolean);
    
    if (validResults.length > 0) {
      console.log(`NVIDIA NIM generated ${validResults.length} image(s)`);
      return validResults;
    }
    return null;
  }, 2, 2000);
}

export async function generateImages(prompt, scenePrompt, count = 3, aspectRatio = "1:1", preferredProvider = null) {
  const fullPrompt = `${prompt}${scenePrompt ? `, ${scenePrompt}` : ""}, photorealistic, high quality, commercial photography`;

  // Priority: NVIDIA (if available) -> Replicate -> HuggingFace
  // User can override with preferredProvider
  
  // Try NVIDIA NIM first (if API key exists)
  if (nvidiaToken() && (preferredProvider === "nvidia" || preferredProvider === null)) {
    try {
      console.log("Trying NVIDIA NIM API...");
      const urls = await generateImagesNvidia(fullPrompt, count, aspectRatio);
      if (urls && urls.length > 0) {
        console.log(`NVIDIA NIM generated ${urls.length} image(s)`);
        return urls;
      }
    } catch (err) {
      console.error("NVIDIA NIM pipeline failed:", err.message);
    }
  }

  // Try Replicate
  if (token() && (preferredProvider === "replicate" || preferredProvider === null)) {
    try {
      const urls = await generateImagesReplicate(prompt, scenePrompt, count, aspectRatio);
      if (urls && urls.length > 0) {
        console.log(`Replicate generated ${urls.length} image(s)`);
        return urls;
      }
    } catch (err) {
      console.error("Replicate pipeline failed:", err.message);
    }
  }

  // Fallback to HuggingFace
  try {
    console.log("Trying HuggingFace inference API...");
    const imagePromises = Array.from({ length: Math.min(count, 3) }, (_, i) =>
      generateImageHF(`${fullPrompt}, variant ${i + 1}`, "stabilityai/stable-diffusion-xl-base-1.0")
    );
    const results = await Promise.all(imagePromises);
    const valid = results.filter(Boolean);
    if (valid.length > 0) {
      console.log(`HuggingFace generated ${valid.length} image(s)`);
      return valid;
    }
  } catch (err) {
    console.error("HuggingFace pipeline failed:", err.message);
  }

  return null;
}

// Helper to check which providers are available
export function getAvailableProviders() {
  return {
    nvidia: !!nvidiaToken(),
    replicate: !!token(),
    huggingface: !!hfToken(),
  };
}

export async function removeBackground(imageUrl) {
  if (!token()) return null;
  return await withRetry(async () => {
    const res = await axios.post(
      `${REPLICATE_API}/models/851-labs/background-removal/predictions`,
      { input: { image: imageUrl } },
      {
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        timeout: 60000,
      }
    );
    if (res.data.status === "succeeded") return res.data.output;
    if (res.data.id) return await waitForPrediction(res.data.id);
    return null;
  }, 2, 1500).catch(() => null);
}

// Full Product Analysis Schema per training document Part 1
export async function analyzeProduct(imageUrl) {
  if (!token()) {
    return {
      product_name: "product",
      product_category: "General Product",
      product_subcategory: "product",
      brand_name: "unbranded",
      primary_color: "neutral",
      secondary_colors: [],
      material: "[INFER]",
      finish: "[INFER]",
      size_visible: "[INFER]",
      key_features: [],
      condition: "New",
      target_use: "daily use",
      image_quality: "Good",
      background_in_photo: "unknown",
      multiple_items: false,
      description: "",
      category: "product",
      colors: ["neutral"],
    };
  }

  return await withRetry(async () => {
    const res = await axios.post(
      `${REPLICATE_API}/models/yorickvp/llava-13b/predictions`,
      {
        input: {
          image: imageUrl,
          prompt: `Analyze this ecommerce product image precisely and extract these details:

1. PRODUCT: Specific product name (e.g. "Ceramic Coffee Mug with Lid" not just "mug")
2. CATEGORY: One of: Electronics / Apparel / Home & Kitchen / Beauty / Sports / Books / Toys / Footwear / Bags / Jewelry / Food / Other
3. SUBCATEGORY: Specific type (e.g. "Ceramic Mug", "Running Shoes", "Face Serum")
4. BRAND: Any brand name or logo visible, or "unbranded"
5. PRIMARY_COLOR: Exact color (e.g. "Matte Black", "Ivory White", "Forest Green")
6. SECONDARY_COLORS: Any accent colors, or "none"
7. MATERIAL: Primary material (e.g. Ceramic, Steel, Cotton, Leather, Plastic)
8. FINISH: Matte / Glossy / Textured / Brushed / Natural / other
9. FEATURES: Up to 5 key visible features separated by commas (e.g. handle, lid, logo, spout, zip)
10. BACKGROUND: white / colored / cluttered / outdoor / lifestyle
11. IMAGE_QUALITY: Good / Poor lighting / Blurry / Cluttered background
12. MULTIPLE_ITEMS: yes or no

Reply in EXACTLY this format, one per line:
PRODUCT: [value]
CATEGORY: [value]
SUBCATEGORY: [value]
BRAND: [value]
PRIMARY_COLOR: [value]
SECONDARY_COLORS: [value]
MATERIAL: [value]
FINISH: [value]
FEATURES: [value]
BACKGROUND: [value]
IMAGE_QUALITY: [value]
MULTIPLE_ITEMS: [value]`,
          max_tokens: 400,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        timeout: 90000,
      }
    );

    const output = res.data.status === "succeeded"
      ? res.data.output
      : res.data.id ? await waitForPrediction(res.data.id) : null;
    const text = Array.isArray(output) ? output.join("") : output || "";

    const extract = (key) => {
      const match = text.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'im'));
      return match ? match[1].trim() : null;
    };

    const primaryColor = extract("PRIMARY_COLOR") || "neutral";
    const colorMatch = text.match(/\b(red|blue|green|black|white|gold|silver|brown|pink|purple|yellow|orange|grey|gray|navy|cream|beige)\b/gi);
    const colors = colorMatch ? [...new Set(colorMatch.map(c => c.toLowerCase()))] : ["neutral"];

    const featuresStr = extract("FEATURES") || "";
    const key_features = featuresStr && featuresStr.toLowerCase() !== "none"
      ? featuresStr.split(",").map(f => f.trim()).filter(Boolean)
      : [];

    const multipleStr = (extract("MULTIPLE_ITEMS") || "no").toLowerCase();

    return {
      product_name: extract("PRODUCT") || "product",
      product_category: extract("CATEGORY") || "General Product",
      product_subcategory: extract("SUBCATEGORY") || extract("PRODUCT") || "product",
      brand_name: extract("BRAND") || "unbranded",
      primary_color: primaryColor,
      secondary_colors: (extract("SECONDARY_COLORS") || "none").toLowerCase() === "none" ? [] : (extract("SECONDARY_COLORS") || "").split(",").map(c => c.trim()),
      material: extract("MATERIAL") || "[INFER]",
      finish: extract("FINISH") || "[INFER]",
      size_visible: "[INFER]",
      key_features,
      condition: "New",
      target_use: "daily use",
      image_quality: extract("IMAGE_QUALITY") || "Good",
      background_in_photo: extract("BACKGROUND") || "unknown",
      multiple_items: multipleStr === "yes",
      description: text,
      // Legacy compat
      category: extract("CATEGORY") || "product",
      colors,
    };
  }, 2, 2000).catch(() => ({
    product_name: "product",
    product_category: "General Product",
    product_subcategory: "product",
    brand_name: "unbranded",
    primary_color: "neutral",
    secondary_colors: [],
    material: "[INFER]",
    finish: "[INFER]",
    size_visible: "[INFER]",
    key_features: [],
    condition: "New",
    target_use: "daily use",
    image_quality: "Good",
    background_in_photo: "unknown",
    multiple_items: false,
    description: "Product image analyzed",
    category: "product",
    colors: ["neutral"],
  }));
}

// 6 standard catalog shot type prompts per training document Part 2
export function buildCatalogShotPrompts(analysis) {
  const productName = analysis.product_name || "product";
  const primaryColor = analysis.primary_color || "neutral";
  const material = (analysis.material && analysis.material !== "[INFER]") ? analysis.material : "";
  const brand = (analysis.brand_name && analysis.brand_name !== "unbranded") ? analysis.brand_name : "";
  const keyFeatures = analysis.key_features || [];
  const category = (analysis.product_category || "").toLowerCase();

  const QUALITY_ENHANCER = "hyperrealistic, photorealistic not illustrated, ultra sharp focus, 8K commercial product photography, studio quality, consistent with original product color and form, no AI artifacts, physically accurate materials and surfaces";

  const productDesc = [primaryColor, material, productName].filter(Boolean).join(" ");
  const brandNote = brand ? `, ${brand} brand clearly visible and sharp` : "";

  // Lifestyle context mapping per training doc
  const LIFESTYLE_MAP = {
    "food": "kitchen counter with fresh ingredients, natural daylight streaming in",
    "beauty": "marble surface with minimal botanical props, soft natural light",
    "skincare": "marble surface with minimal botanical props, soft natural light",
    "electronics": "clean modern desk, minimal tech setup, ambient room light",
    "footwear": "clean floor with slight overhead angle, minimal white background",
    "apparel": "neutral fabric background, flat lay on linen",
    "jewelry": "velvet linen surface, soft natural light, elegant minimal setup",
    "home & kitchen": "wooden breakfast table, morning light, newspaper or book nearby",
    "sports": "outdoor surface or gym environment with clean background",
    "bags": "flat lay on neutral linen or hanging on minimal hook",
    "books": "wooden table with reading glasses and coffee cup nearby",
    "toys": "clean playful background, colourful but uncluttered",
    "food & beverage": "kitchen counter with ingredients and warm daylight",
  };

  let lifestyleContext = "clean aspirational lifestyle setting, natural light";
  for (const [key, val] of Object.entries(LIFESTYLE_MAP)) {
    if (category.includes(key)) { lifestyleContext = val; break; }
  }

  const featuresForInfogr = keyFeatures.slice(0, 4).join(", ") || "main features, texture, build quality";
  const specificDetail = keyFeatures[0] || "material texture and surface finish";

  return [
    {
      type: "hero",
      label: "Hero Shot",
      description: "Main listing image — pure white background",
      prompt: `Professional ecommerce product photography of ${productDesc}, front-facing hero shot, pure white studio background #FFFFFF, soft diffused studio lighting, even illumination no harsh shadows, subtle natural drop shadow directly below product, product filling 85% of frame, hyperrealistic, ultra sharp focus, 8K resolution, commercial catalog photography style${brandNote}, no props, no text overlays, ${QUALITY_ENHANCER}`,
    },
    {
      type: "back",
      label: "Back View",
      description: "Rear/secondary angle",
      prompt: `Professional ecommerce product photography of ${productDesc}, rear back view showing back panel label reverse side, pure white studio background #FFFFFF, soft even studio lighting, same commercial photography style, ultra sharp focus, hyperrealistic${brandNote}, label text readable if present, no props, ${QUALITY_ENHANCER}`,
    },
    {
      type: "angle",
      label: "45° Angle",
      description: "Three-quarter view showing depth",
      prompt: `Professional ecommerce product photography of ${productDesc}, three-quarter 45-degree angle view, white studio background with subtle light grey gradient, directional soft-box lighting from upper-left, elegant long soft shadow to the right, depth of field with sharp product, hyperrealistic, commercial catalog quality, showing product form and depth, premium feel, 8K detail, ${QUALITY_ENHANCER}`,
    },
    {
      type: "detail",
      label: "Detail Close-Up",
      description: "Macro shot showing texture and craftsmanship",
      prompt: `Extreme close-up macro photography of ${productDesc} showing ${specificDetail}, ${primaryColor} ${material} texture visible in sharp detail, very shallow depth of field blurred background, warm studio lighting highlighting texture craftsmanship finish, hyperrealistic DSLR macro lens quality, commercial product photography, ultra sharp on focus point, ${QUALITY_ENHANCER}`,
    },
    {
      type: "lifestyle",
      label: "Lifestyle Shot",
      description: "Product in natural aspirational setting",
      prompt: `Lifestyle product photography of ${productDesc} in ${lifestyleContext}, product as main subject clearly dominant in frame, complementary minimal props 2-3 items max, soft natural window light editorial style, hyperrealistic aspirational and relatable, shallow depth of field product in sharp focus, commercial lifestyle photography, not cluttered clean composition, ${QUALITY_ENHANCER}`,
    },
    {
      type: "infographic",
      label: "Infographic Shot",
      description: "Clean shot for feature callout overlays",
      prompt: `Clean professional product photography of ${productDesc} at slight angle showing all sides, white background, all key features clearly visible (${featuresForInfogr}), even studio lighting no harsh shadows, hyperrealistic sharp detail on all sides, no text overlays (text added programmatically by UI), commercial product photography for ecommerce infographic use, ${QUALITY_ENHANCER}`,
    },
  ];
}

export async function compositeProductIntoScene(productNoBg, sceneImages) {
  return sceneImages;
}
