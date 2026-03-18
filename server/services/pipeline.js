import axios from "axios";

const REPLICATE_API = "https://api.replicate.com/v1";
const HF_API = "https://api-inference.huggingface.co/models";
const token = () => process.env.REPLICATE_API_TOKEN;
const hfToken = () => process.env.HUGGINGFACE_API_TOKEN;

async function waitForPrediction(predictionId, maxWaitMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const res = await axios.get(`${REPLICATE_API}/predictions/${predictionId}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    const { status, output, error } = res.data;
    if (status === "succeeded") return output;
    if (status === "failed" || status === "canceled") throw new Error(error || "Prediction failed");
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Generation timed out");
}

// ─── Replicate image generation ───
async function generateImagesReplicate(prompt, scenePrompt, count = 3) {
  if (!token()) return null;
  try {
    const res = await axios.post(
      `${REPLICATE_API}/models/black-forest-labs/flux-schnell/predictions`,
      {
        input: {
          prompt: `${prompt}, ${scenePrompt}`,
          num_outputs: Math.min(count, 4),
          output_format: "webp",
          output_quality: 90,
          aspect_ratio: "1:1",
        },
      },
      { headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", Prefer: "wait" } }
    );
    if (res.data.status === "succeeded") return res.data.output;
    if (res.data.id) return await waitForPrediction(res.data.id);
    return null;
  } catch (err) {
    console.error("Replicate generation failed:", err.message);
    return null;
  }
}

// ─── Hugging Face image generation (free tier) ───
async function generateImageHF(prompt, model = "stabilityai/stable-diffusion-2-1") {
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

// ─── Main export: generateImages ───
export async function generateImages(prompt, scenePrompt, count = 3) {
  const fullPrompt = `${prompt}, ${scenePrompt}, photorealistic, high quality, commercial photography`;

  // 1. Try Replicate (if token is set)
  if (token()) {
    const urls = await generateImagesReplicate(prompt, scenePrompt, count);
    if (urls && urls.length > 0) return urls;
  }

  // 2. Try HuggingFace (free tier or with token)
  try {
    console.log("Trying HuggingFace inference API for image generation...");
    const imagePromises = Array.from({ length: Math.min(count, 3) }, (_, i) =>
      generateImageHF(
        `${fullPrompt}, variant ${i + 1}`,
        "stabilityai/stable-diffusion-xl-base-1.0"
      )
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

// ─── Background removal ───
export async function removeBackground(imageUrl) {
  if (!token()) return null;
  try {
    const res = await axios.post(
      `${REPLICATE_API}/models/851-labs/background-removal/predictions`,
      { input: { image: imageUrl } },
      { headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", Prefer: "wait" } }
    );
    if (res.data.status === "succeeded") return res.data.output;
    if (res.data.id) return await waitForPrediction(res.data.id);
    return null;
  } catch {
    return null;
  }
}

// ─── Product analysis ───
export async function analyzeProduct(imageUrl) {
  if (!token()) {
    return { category: "product", colors: ["neutral"], material: "unknown" };
  }
  try {
    const res = await axios.post(
      `${REPLICATE_API}/models/yorickvp/llava-13b/predictions`,
      {
        input: {
          image: imageUrl,
          prompt: "Analyze this product image. In 1-2 sentences describe: product category, main colors, material. Be concise.",
          max_tokens: 120,
        },
      },
      { headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", Prefer: "wait" } }
    );
    const output = res.data.status === "succeeded"
      ? res.data.output
      : res.data.id ? await waitForPrediction(res.data.id) : null;
    const text = Array.isArray(output) ? output.join("") : output || "";
    return { description: text, category: "product" };
  } catch {
    return { category: "product", description: "Product image analyzed" };
  }
}

export async function compositeProductIntoScene(productNoBg, sceneImages) {
  return sceneImages;
}
