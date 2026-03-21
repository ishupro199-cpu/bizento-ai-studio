import axios from "axios";

const REPLICATE_API = "https://api.replicate.com/v1";
const NVIDIA_API = "https://ai.api.nvidia.com/v1";

const token = () => process.env.REPLICATE_API_TOKEN;
const nvidiaKey = () => process.env.NVIDIA_API_KEY;

const ASPECT_RATIO_MAP = {
  "1:1": { w: 1024, h: 1024 },
  "4:5": { w: 896, h: 1120 },
  "16:9": { w: 1344, h: 768 },
  "9:16": { w: 768, h: 1344 },
  "3:2": { w: 1216, h: 832 },
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

// ── NVIDIA NIM — Stable Diffusion / FLUX via NVIDIA API ─────────────────────
async function generateImagesNvidia(prompt, count = 3, aspectRatio = "1:1") {
  const key = nvidiaKey();
  if (!key) return null;

  const dims = ASPECT_RATIO_MAP[aspectRatio] || ASPECT_RATIO_MAP["1:1"];
  const results = [];

  try {
    // Try FLUX.1-schnell via NVIDIA NIM first
    const response = await withRetry(async () => {
      return await axios.post(
        `${NVIDIA_API}/genai/black-forest-labs/flux-schnell`,
        {
          prompt: `${prompt}, photorealistic, high quality, commercial photography`,
          width: dims.w,
          height: dims.h,
          num_inference_steps: 4,
          seed: Math.floor(Math.random() * 999999),
          guidance_scale: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 120000,
        }
      );
    }, 2, 2000);

    if (response.data?.artifacts?.[0]?.base64) {
      const base64 = response.data.artifacts[0].base64;
      results.push(`data:image/webp;base64,${base64}`);
    } else if (response.data?.image_url) {
      results.push(response.data.image_url);
    }

    // Generate more variants if needed
    if (results.length > 0 && count > 1) {
      const extras = await Promise.allSettled(
        Array.from({ length: Math.min(count - 1, 2) }, (_, i) =>
          axios.post(
            `${NVIDIA_API}/genai/black-forest-labs/flux-schnell`,
            {
              prompt: `${prompt}, photorealistic, high quality, commercial photography, variant ${i + 2}`,
              width: dims.w,
              height: dims.h,
              num_inference_steps: 4,
              seed: Math.floor(Math.random() * 999999),
              guidance_scale: 0,
            },
            {
              headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              timeout: 120000,
            }
          ).catch(() => null)
        )
      );

      for (const result of extras) {
        if (result.status === "fulfilled" && result.value) {
          const data = result.value.data;
          if (data?.artifacts?.[0]?.base64) {
            results.push(`data:image/webp;base64,${data.artifacts[0].base64}`);
          } else if (data?.image_url) {
            results.push(data.image_url);
          }
        }
      }
    }

    if (results.length > 0) {
      console.log(`NVIDIA NIM (FLUX) generated ${results.length} image(s)`);
      return results;
    }
  } catch (err) {
    console.warn("NVIDIA FLUX failed, trying SDXL:", err.message);
  }

  // Fallback to SDXL via NVIDIA
  try {
    const sdxlResponse = await withRetry(async () => {
      return await axios.post(
        `${NVIDIA_API}/genai/stabilityai/sdxl-turbo`,
        {
          text_prompts: [{ text: `${prompt}, photorealistic, high quality`, weight: 1 }],
          sampler: "K_DPM_2_ANCESTRAL",
          steps: 4,
          seed: Math.floor(Math.random() * 999999),
          width: Math.min(dims.w, 1024),
          height: Math.min(dims.h, 1024),
          cfg_scale: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 90000,
        }
      );
    }, 2, 2000);

    if (sdxlResponse.data?.artifacts) {
      for (const art of sdxlResponse.data.artifacts.slice(0, count)) {
        if (art.base64) {
          results.push(`data:image/png;base64,${art.base64}`);
        }
      }
    }

    if (results.length > 0) {
      console.log(`NVIDIA NIM (SDXL) generated ${results.length} image(s)`);
      return results;
    }
  } catch (err) {
    console.warn("NVIDIA SDXL also failed:", err.message);
  }

  return null;
}

// ── Replicate fallback ────────────────────────────────────────────────────────
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
  const ratioStr = aspectRatio in ASPECT_RATIO_MAP ? aspectRatio : "1:1";

  return await withRetry(async () => {
    const res = await axios.post(
      `${REPLICATE_API}/models/black-forest-labs/flux-schnell/predictions`,
      {
        input: {
          prompt: fullPrompt,
          num_outputs: Math.min(count, 4),
          output_format: "webp",
          output_quality: 90,
          aspect_ratio: ratioStr,
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

// ── HuggingFace last resort ───────────────────────────────────────────────────
async function generateImageHF(prompt, model = "stabilityai/stable-diffusion-xl-base-1.0") {
  const hfToken = process.env.HUGGINGFACE_API_TOKEN;
  const headers = { "Content-Type": "application/json" };
  if (hfToken) headers["Authorization"] = `Bearer ${hfToken}`;
  try {
    const res = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
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

// ── Main export: tries NVIDIA → Replicate → HuggingFace ──────────────────────
export async function generateImages(prompt, scenePrompt, count = 3, aspectRatio = "1:1") {
  const fullPrompt = `${prompt}${scenePrompt ? `, ${scenePrompt}` : ""}, photorealistic, high quality, commercial photography`;

  // 1. Try NVIDIA NIM first (primary)
  if (nvidiaKey()) {
    try {
      const urls = await generateImagesNvidia(fullPrompt, count, aspectRatio);
      if (urls && urls.length > 0) return urls;
    } catch (err) {
      console.error("NVIDIA pipeline failed:", err.message);
    }
  }

  // 2. Try Replicate (secondary)
  if (token()) {
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

  // 3. HuggingFace last resort
  try {
    console.log("Trying HuggingFace inference API...");
    const imagePromises = Array.from({ length: Math.min(count, 3) }, (_, i) =>
      generateImageHF(`${fullPrompt}, variant ${i + 1}`)
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

// ── Background removal (Replicate only, NVIDIA doesn't have this) ─────────────
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

// ── Product analysis via NVIDIA vision model ──────────────────────────────────
export async function analyzeProduct(imageUrl) {
  const key = nvidiaKey();

  // Try NVIDIA vision first
  if (key && imageUrl) {
    try {
      const response = await withRetry(async () => {
        return await axios.post(
          `${NVIDIA_API}/vlm/nvidia/neva-22b`,
          {
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Analyze this ecommerce product image and extract:
PRODUCT: Specific product name
CATEGORY: One of: Electronics / Apparel / Home & Kitchen / Beauty / Sports / Books / Toys / Footwear / Bags / Jewelry / Food / Other
SUBCATEGORY: Specific type
BRAND: Brand name or "unbranded"
PRIMARY_COLOR: Exact color
SECONDARY_COLORS: Accent colors or "none"
MATERIAL: Primary material
FINISH: Matte / Glossy / Textured / Brushed / Natural / other
FEATURES: Up to 5 key features separated by commas
BACKGROUND: white / colored / cluttered / outdoor / lifestyle
IMAGE_QUALITY: Good / Poor lighting / Blurry / Cluttered background
MULTIPLE_ITEMS: yes or no

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
                  },
                  {
                    type: "image_url",
                    image_url: { url: imageUrl },
                  },
                ],
              },
            ],
            max_tokens: 400,
            temperature: 0.1,
          },
          {
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            timeout: 60000,
          }
        );
      }, 2, 2000);

      const text = response.data?.choices?.[0]?.message?.content || "";
      if (text) {
        return parseAnalysisText(text);
      }
    } catch (err) {
      console.warn("NVIDIA vision analysis failed:", err.message);
    }
  }

  // Fallback to Replicate LLaVA
  if (token()) {
    try {
      return await analyzeProductReplicate(imageUrl);
    } catch (err) {
      console.warn("Replicate analysis failed:", err.message);
    }
  }

  return getDefaultAnalysis();
}

function parseAnalysisText(text) {
  const extract = (key) => {
    const match = text.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "im"));
    return match ? match[1].trim() : null;
  };

  const primaryColor = extract("PRIMARY_COLOR") || "neutral";
  const colorMatch = text.match(/\b(red|blue|green|black|white|gold|silver|brown|pink|purple|yellow|orange|grey|gray|navy|cream|beige)\b/gi);
  const colors = colorMatch ? [...new Set(colorMatch.map((c) => c.toLowerCase()))] : ["neutral"];
  const featuresStr = extract("FEATURES") || "";
  const key_features = featuresStr && featuresStr.toLowerCase() !== "none"
    ? featuresStr.split(",").map((f) => f.trim()).filter(Boolean)
    : [];
  const multipleStr = (extract("MULTIPLE_ITEMS") || "no").toLowerCase();

  return {
    product_name: extract("PRODUCT") || "product",
    product_category: extract("CATEGORY") || "General Product",
    product_subcategory: extract("SUBCATEGORY") || extract("PRODUCT") || "product",
    brand_name: extract("BRAND") || "unbranded",
    primary_color: primaryColor,
    secondary_colors: (extract("SECONDARY_COLORS") || "none").toLowerCase() === "none" ? [] : (extract("SECONDARY_COLORS") || "").split(",").map((c) => c.trim()),
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
    category: extract("CATEGORY") || "product",
    colors,
  };
}

function getDefaultAnalysis() {
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

async function analyzeProductReplicate(imageUrl) {
  return await withRetry(async () => {
    const res = await axios.post(
      `${REPLICATE_API}/models/yorickvp/llava-13b/predictions`,
      {
        input: {
          image: imageUrl,
          prompt: `Analyze this ecommerce product image precisely and extract these details:
PRODUCT: [product name]
CATEGORY: [Electronics / Apparel / Home & Kitchen / Beauty / Sports / Books / Toys / Footwear / Bags / Jewelry / Food / Other]
SUBCATEGORY: [specific type]
BRAND: [brand or "unbranded"]
PRIMARY_COLOR: [exact color]
SECONDARY_COLORS: [colors or "none"]
MATERIAL: [material]
FINISH: [Matte/Glossy/Textured/Brushed/Natural/other]
FEATURES: [up to 5 features]
BACKGROUND: [white/colored/cluttered/outdoor/lifestyle]
IMAGE_QUALITY: [Good/Poor lighting/Blurry/Cluttered background]
MULTIPLE_ITEMS: [yes/no]`,
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
    return parseAnalysisText(text);
  }, 2, 2000).catch(() => getDefaultAnalysis());
}

// ── Catalog shot prompts ──────────────────────────────────────────────────────
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
      prompt: `Clean professional product photography of ${productDesc} at slight angle showing all sides, white background, all key features clearly visible (${featuresForInfogr}), even studio lighting no harsh shadows, hyperrealistic sharp detail on all sides, no text overlays, commercial product photography for ecommerce infographic use, ${QUALITY_ENHANCER}`,
    },
  ];
}

export async function compositeProductIntoScene(productNoBg, sceneImages) {
  return sceneImages;
}
