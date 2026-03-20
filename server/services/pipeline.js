import axios from "axios";

const REPLICATE_API = "https://api.replicate.com/v1";
const HF_API = "https://api-inference.huggingface.co/models";
const token = () => process.env.REPLICATE_API_TOKEN;
const hfToken = () => process.env.HUGGINGFACE_API_TOKEN;

const ASPECT_RATIO_MAP = {
  "1:1": "1:1",
  "4:5": "4:5",
  "16:9": "16:9",
  "9:16": "9:16",
  "3:2": "3:2",
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

export async function generateImages(prompt, scenePrompt, count = 3, aspectRatio = "1:1") {
  const fullPrompt = `${prompt}${scenePrompt ? `, ${scenePrompt}` : ""}, photorealistic, high quality, commercial photography`;

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

export async function analyzeProduct(imageUrl) {
  if (!token()) {
    return { category: "product", colors: ["neutral"], material: "unknown", description: "" };
  }
  return await withRetry(async () => {
    const res = await axios.post(
      `${REPLICATE_API}/models/yorickvp/llava-13b/predictions`,
      {
        input: {
          image: imageUrl,
          prompt: "Analyze this product image precisely. Describe: 1) Product type and name, 2) Main colors, 3) Material/texture, 4) Current background, 5) Camera angle. Be concise, max 3 sentences.",
          max_tokens: 200,
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

    const colorMatch = text.match(/\b(red|blue|green|black|white|gold|silver|brown|pink|purple|yellow|orange|grey|gray|navy|cream|beige)\b/gi);
    const colors = colorMatch ? [...new Set(colorMatch.map(c => c.toLowerCase()))] : ["neutral"];

    return {
      description: text,
      category: "product",
      colors,
      material: text.match(/\b(glass|metal|leather|fabric|plastic|wood|ceramic|silicone|cotton|wool)\b/i)?.[1] || null,
    };
  }, 2, 2000).catch(() => ({ category: "product", description: "Product image analyzed", colors: ["neutral"] }));
}

export async function compositeProductIntoScene(productNoBg, sceneImages) {
  return sceneImages;
}
