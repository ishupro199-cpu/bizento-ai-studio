import axios from "axios";

const NVIDIA_API = "https://integrate.api.nvidia.com/v1";

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

export async function generateImages(prompt, scenePrompt, count = 3, aspectRatio = "1:1") {
  const fullPrompt = `${prompt}${scenePrompt ? `, ${scenePrompt}` : ""}, photorealistic, high quality, commercial photography`;

  // Use NVIDIA NIM API for image generation
  if (nvidiaToken()) {
    try {
      console.log("Generating images with NVIDIA NIM API...");
      const urls = await generateImagesNvidia(fullPrompt, count, aspectRatio);
      if (urls && urls.length > 0) {
        console.log(`NVIDIA NIM generated ${urls.length} image(s)`);
        return urls;
      }
    } catch (err) {
      console.error("NVIDIA NIM pipeline failed:", err.message);
    }
  } else {
    console.warn("NVIDIA_API_KEY not configured - cannot generate real images");
  }

  return null;
}

// Helper to check if NVIDIA API is available
export function getAvailableProviders() {
  return {
    nvidia: !!nvidiaToken(),
  };
}

export async function removeBackground(imageUrl) {
  // Background removal not available without external service
  // Return original image URL
  console.log("Background removal: returning original image (service not configured)");
  return imageUrl;
}

// Full Product Analysis Schema per training document Part 1
// Returns default analysis structure (vision analysis requires separate API)
export async function analyzeProduct(imageUrl) {
  // Return default analysis - can be enhanced with vision API later
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
