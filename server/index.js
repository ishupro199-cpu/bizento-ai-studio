import express from "express";
import cors from "cors";
import { generateRouter } from "./routes/generate.js";
import { paymentRouter } from "./routes/payment.js";
import { adminRouter } from "./routes/admin.js";
import { aiTestRouter } from "./routes/aiTest.js";
import { referralRouter } from "./routes/referral.js";
import { notificationsRouter } from "./routes/notifications.js";
import { blogsRouter } from "./routes/blogs.js";
import { initFirebaseAdmin } from "./config/firebase.js";

const app = express();

initFirebaseAdmin();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "PixaLera AI Pipeline",
    hasNvidiaApi: !!process.env.NVIDIA_API_KEY,
    hasRazorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    hasFirebaseAdmin: !!process.env.FIREBASE_SERVICE_ACCOUNT,
    imageProvider: process.env.NVIDIA_API_KEY ? "nvidia" : "none",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/generate", generateRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ai-test", aiTestRouter);
app.use("/api/referral", referralRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/blogs", blogsRouter);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`PixaLera AI Pipeline server running on port ${PORT}`);
  console.log(`NVIDIA NIM API: ${process.env.NVIDIA_API_KEY ? "✓ configured" : "✗ not configured"}`);
  console.log(`Razorpay: ${process.env.RAZORPAY_KEY_ID ? "✓ configured" : "✗ not configured"}`);
  console.log(`Firebase Admin: ${process.env.FIREBASE_SERVICE_ACCOUNT ? "✓ configured" : "✗ limited mode"}`);
});
