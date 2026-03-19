import { Router } from "express";
import OpenAI from "openai";

const router = Router();

let _openai = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "placeholder",
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return _openai;
}

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    replitAI: !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL),
  });
});

router.post("/prompt", async (req, res) => {
  try {
    const { prompt, model = "gpt-5-mini" } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    const response = await getOpenAI().chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant for PixaLera, an AI product photography platform. Help users craft better prompts for product image generation.",
        },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 8192,
    });

    res.json({
      result: response.choices[0]?.message?.content || "",
      model: response.model,
      usage: response.usage,
    });
  } catch (err) {
    console.error("Replit AI test error:", err);
    res.status(500).json({ error: err.message || "AI request failed" });
  }
});

router.post("/prompt/stream", async (req, res) => {
  try {
    const { prompt, model = "gpt-5-mini" } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await getOpenAI().chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant for PixaLera, an AI product photography platform. Help users craft better prompts for product image generation.",
        },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 8192,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Replit AI stream error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || "AI stream failed" });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

export { router as aiTestRouter };
