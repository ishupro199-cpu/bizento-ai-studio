import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `You are Pixalera AI — a smart, friendly assistant for an AI-powered product photography and marketing visual platform.

You help users with:
- Generating stunning product catalog images for marketplaces (Amazon, Flipkart, Meesho)
- Creating professional product photography
- Designing cinematic CGI advertisements
- Building bold social media ad creatives
- Choosing the right style, scene, and composition for their product
- Understanding credits, plans, and platform features

RESPONSE RULES:
- Be concise, warm, and professional (2–5 sentences max for most replies)
- Never start with greetings like "Hello!" on every reply — dive straight into the answer
- If the user describes a product, suggest the best tool and style for it (e.g., "Try Luxury Studio style with Catalog Generator")
- If the user asks "how do I...", give a clear, step-by-step guide
- If the user asks about credits or plans, explain clearly without being pushy
- If the user writes in Hindi or Hinglish, reply in Hindi or Hinglish naturally
- Never say "Analyzing your product..." or pretend to run analysis in chat
- Never hallucinate features that don't exist
- Keep emojis minimal and professional

PLATFORM CONTEXT:
- Tools: Catalog Generator, Product Photography, Ad Creatives, Cinematic Ads (Pro only)
- Styles: Luxury Studio, Amazon Clean, Neon Futuristic, Floral Lifestyle, Beach Campaign
- Models: Flash (fast), Pro (ultra quality)
- Quality: 720p, 1K (free), 2K (Starter+), 4K (Pro)
- Credits: Free = 15/month, Starter = 100+20/month, Pro = 300+50/month`;

async function chatWithGemini(prompt, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const formattedHistory = history.map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history: formattedHistory });
  const result = await chat.sendMessage(prompt);
  return result.response.text();
}

async function chatWithReplitFallback(prompt, openaiClient) {
  const resp = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_INSTRUCTION },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: 512,
  });
  return resp.choices[0]?.message?.content?.trim() || null;
}

export async function generateChatReply(prompt, history = [], openaiGetter = null) {
  try {
    const reply = await chatWithGemini(prompt, history);
    if (reply) return { reply, model: "gemini" };
  } catch (err) {
    console.warn("Gemini chat failed, falling back to Replit AI:", err.message);
  }

  if (openaiGetter) {
    try {
      const hasAI = !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL);
      if (hasAI) {
        const reply = await chatWithReplitFallback(prompt, openaiGetter());
        if (reply) return { reply, model: "replit-ai" };
      }
    } catch (err2) {
      console.warn("Replit AI fallback also failed:", err2.message);
    }
  }

  return {
    reply: "I'm here to help you create stunning product visuals! Tell me what product you'd like to photograph.",
    model: "fallback",
  };
}

export async function augmentPromptWithGemini(userPrompt, context = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const { tool = "Catalog Generator", style = "luxury", quality = "1K", model: modelTier = "flash", aspectRatio = "1:1" } = context;

    const systemPrompt = `You are an expert AI image generation prompt engineer for ${tool} on Pixalera AI.
Output ONLY the final image generation prompt — nothing else, no explanation.
Style: ${style}, Quality: ${quality}, Model: ${modelTier}, Aspect Ratio: ${aspectRatio}.
Requirements:
- Focus on ${tool === "Cinematic Ads" ? "dramatic lighting, volumetric fog, cinematic color grading, blockbuster production quality" : tool === "Ad Creatives" ? "bold visuals, marketing impact, scroll-stopping composition" : "clean composition, sharp product detail, professional studio quality"}
- Keep it under 180 words
- Make it highly specific and photorealistic`;

    const result = await model.generateContent(`${systemPrompt}\n\nProduct: "${userPrompt}"`);
    return result.response.text().trim();
  } catch (err) {
    console.warn("Gemini prompt augmentation failed:", err.message);
    return null;
  }
}
