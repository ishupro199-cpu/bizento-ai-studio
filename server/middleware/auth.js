import { getAdminAuth, getAdminDb } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

export async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized — no token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      req.uid = req.body.userId || null;
      req.userEmail = null;
      return next();
    }

    const decoded = await adminAuth.verifyIdToken(token);
    req.uid = decoded.uid;
    req.userEmail = decoded.email || null;
    next();
  } catch (err) {
    console.error("Token verify error:", err.message);
    return res.status(401).json({ error: "Unauthorized — invalid token" });
  }
}

export async function checkCreditAndSuspend(req, res, next) {
  const uid = req.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });

  const { tool, model, quality } = req.body;

  const TOOL_CREDIT_COSTS = {
    catalog:   { flash: 5,  pro: 10 },
    photo:     { flash: 3,  pro: 5  },
    creative:  { flash: 3,  pro: 5  },
    cinematic: { flash: 30, pro: 50 },
  };

  const QUALITY_ADDON_COSTS = {
    "720p": 0,
    "1K": 0,
    "2K": 4,
    "4K": 8,
  };

  const toolKey = mapToolToKey(tool);
  const modelKey = (model === "pro") ? "pro" : "flash";
  const qualityKey = quality || "1K";

  const baseCost = TOOL_CREDIT_COSTS[toolKey]?.[modelKey] ?? 3;
  const addonCost = QUALITY_ADDON_COSTS[qualityKey] ?? 0;
  const totalCost = baseCost + addonCost;

  req.creditCost = totalCost;
  req.toolKey = toolKey;
  req.modelKey = modelKey;

  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return next();
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userSnap.data();

    if (userData.suspended === true) {
      return res.status(403).json({
        error: "Account suspended — contact support",
        code: "USER_SUSPENDED",
      });
    }

    const planExpiry = userData.planExpiry;
    if (planExpiry && userData.plan !== "free") {
      const expiryDate = planExpiry.toDate ? planExpiry.toDate() : new Date(planExpiry);
      if (new Date() > expiryDate) {
        await userRef.update({
          plan: "free",
          creditsRemaining: 0,
          planExpiry: null,
          updatedAt: FieldValue.serverTimestamp(),
        });
        userData.plan = "free";
        userData.creditsRemaining = 0;

        await adminDb.collection("transactions").add({
          userId: uid,
          type: "expiry_reset",
          credits: 0,
          balanceBefore: userData.creditsRemaining,
          balanceAfter: 0,
          description: "Plan expired — downgraded to free",
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    }

    if (toolKey === "cinematic" && userData.plan !== "pro") {
      return res.status(403).json({
        error: "Cinematic Ads is a Pro-only feature",
        code: "PLAN_REQUIRED",
        requiredPlan: "pro",
      });
    }

    if (qualityKey === "4K" && userData.plan !== "pro") {
      return res.status(403).json({
        error: "4K quality is a Pro-only feature",
        code: "PLAN_REQUIRED",
        requiredPlan: "pro",
      });
    }

    const creditsRemaining = userData.creditsRemaining ?? 0;
    if (creditsRemaining < totalCost) {
      return res.status(402).json({
        error: "Insufficient credits",
        code: "INSUFFICIENT_CREDITS",
        required: totalCost,
        available: creditsRemaining,
      });
    }

    await userRef.update({
      creditsRemaining: creditsRemaining - totalCost,
      creditsUsed: FieldValue.increment(totalCost),
      ...(modelKey === "flash"
        ? { flashGenerations: FieldValue.increment(1) }
        : { proGenerations: FieldValue.increment(1) }),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection("transactions").add({
      userId: uid,
      type: "deduction",
      credits: totalCost,
      balanceBefore: creditsRemaining,
      balanceAfter: creditsRemaining - totalCost,
      description: `${tool} generation using ${modelKey} model`,
      tool: toolKey,
      model: modelKey,
      createdAt: FieldValue.serverTimestamp(),
    });

    req.creditDeducted = true;
    req.balanceBefore = creditsRemaining;
    req.balanceAfter = creditsRemaining - totalCost;
    next();
  } catch (err) {
    console.error("Credit check error:", err.message);
    next();
  }
}

export async function refundCredits(uid, cost, tool, model, reason, adminDb) {
  if (!adminDb || !uid || cost <= 0) return;
  try {
    const userRef = adminDb.collection("users").doc(uid);
    const snap = await userRef.get();
    if (!snap.exists) return;
    const data = snap.data();
    const before = data.creditsRemaining ?? 0;
    const after = before + cost;

    await userRef.update({
      creditsRemaining: after,
      creditsUsed: Math.max(0, (data.creditsUsed ?? 0) - cost),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection("transactions").add({
      userId: uid,
      type: "refund",
      credits: cost,
      balanceBefore: before,
      balanceAfter: after,
      description: `Refund: ${reason}`,
      tool,
      model,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("Refund error:", err.message);
  }
}

function mapToolToKey(tool) {
  const map = {
    "Generate Catalog": "catalog",
    "Product Photography": "photo",
    "Ad Creatives": "creative",
    "Cinematic Ads": "cinematic",
    catalog: "catalog",
    photo: "photo",
    creative: "creative",
    cinematic: "cinematic",
  };
  return map[tool] ?? "catalog";
}
