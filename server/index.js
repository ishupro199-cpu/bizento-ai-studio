import express from "express";
import cors from "cors";
import { generateRouter } from "./routes/generate.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "PixaLera AI Pipeline",
    hasReplicateToken: !!process.env.REPLICATE_API_TOKEN,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/generate", generateRouter);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`PixaLera AI Pipeline server running on port ${PORT}`);
  console.log(`Replicate API: ${process.env.REPLICATE_API_TOKEN ? "✓ configured" : "✗ not configured (will use placeholder mode)"}`);
});
