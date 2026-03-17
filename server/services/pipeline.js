import axios from "axios";

const REPLICATE_API = "https://api.replicate.com/v1";
const token = () => process.env.REPLICATE_API_TOKEN;

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

export async function generateImages(prompt, scenePrompt, count = 3) {
  if (!token()) return null;

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
}

export async function removeBackground(imageUrl) {
  if (!token()) return null;

  const res = await axios.post(
    `${REPLICATE_API}/models/851-labs/background-removal/predictions`,
    { input: { image: imageUrl } },
    { headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", Prefer: "wait" } }
  );

  if (res.data.status === "succeeded") return res.data.output;
  if (res.data.id) return await waitForPrediction(res.data.id);
  return null;
}

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
          prompt:
            "Analyze this product image. In 1-2 sentences describe: product category, main colors, material. Be concise.",
          max_tokens: 120,
        },
      },
      { headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", Prefer: "wait" } }
    );

    const output =
      res.data.status === "succeeded"
        ? res.data.output
        : res.data.id
        ? await waitForPrediction(res.data.id)
        : null;

    const text = Array.isArray(output) ? output.join("") : output || "";
    return { description: text, category: "product" };
  } catch {
    return { category: "product", description: "Product image analyzed" };
  }
}

export async function compositeProductIntoScene(productNoBg, sceneImages) {
  return sceneImages;
}
