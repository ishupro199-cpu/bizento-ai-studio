import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../config/firebase.js";
import { verifyFirebaseToken } from "../middleware/auth.js";

const router = Router();

async function requireAdmin(req, res, next) {
  const uid = req.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });

  const adminDb = getAdminDb();
  if (!adminDb) return next();

  try {
    const userSnap = await adminDb.collection("users").doc(uid).get();
    if (!userSnap.exists || userSnap.data().role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    req.adminEmail = userSnap.data().email || "";
    next();
  } catch {
    return res.status(403).json({ error: "Admin access check failed" });
  }
}

router.post("/credits/adjust", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const { targetUserId, amount, action, reason } = req.body;
  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: "Database not available" });

  try {
    const userRef = adminDb.collection("users").doc(targetUserId);
    const snap = await userRef.get();
    if (!snap.exists) return res.status(404).json({ error: "User not found" });

    const data = snap.data();
    const before = data.creditsRemaining ?? 0;
    const delta = action === "add" ? Math.abs(amount) : -Math.abs(amount);
    const after = Math.max(0, before + delta);

    await userRef.update({
      creditsRemaining: after,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection("transactions").add({
      userId: targetUserId,
      type: "admin_adjust",
      credits: Math.abs(amount),
      balanceBefore: before,
      balanceAfter: after,
      description: `Admin ${action === "add" ? "added" : "removed"} ${amount} credits — ${reason || "manual adjustment"}`,
      adminId: req.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection("adminLogs").add({
      adminId: req.uid,
      adminEmail: req.adminEmail || "",
      action: "credit_adjust",
      targetUserId,
      targetUserEmail: data.email || "",
      details: `${action === "add" ? "Added" : "Removed"} ${amount} credits. Reason: ${reason || "manual"}`,
      meta: { before, after, delta },
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, before, after });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/users/suspend", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const { targetUserId, suspend, reason } = req.body;
  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: "Database not available" });

  try {
    const userRef = adminDb.collection("users").doc(targetUserId);
    const snap = await userRef.get();
    if (!snap.exists) return res.status(404).json({ error: "User not found" });

    await userRef.update({
      suspended: !!suspend,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection("adminLogs").add({
      adminId: req.uid,
      adminEmail: req.adminEmail || "",
      action: suspend ? "user_suspend" : "user_activate",
      targetUserId,
      targetUserEmail: snap.data().email || "",
      details: `User ${suspend ? "suspended" : "activated"}. Reason: ${reason || "not specified"}`,
      meta: { suspend },
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, suspended: !!suspend });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/users/plan", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const { targetUserId, plan } = req.body;
  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: "Database not available" });

  const PLAN_CREDITS = { free: 15, starter: 120, pro: 500 };

  try {
    const userRef = adminDb.collection("users").doc(targetUserId);
    const snap = await userRef.get();
    if (!snap.exists) return res.status(404).json({ error: "User not found" });

    const data = snap.data();

    await userRef.update({
      plan,
      creditsRemaining: PLAN_CREDITS[plan] ?? 15,
      creditsUsed: 0,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection("adminLogs").add({
      adminId: req.uid,
      adminEmail: req.adminEmail || "",
      action: "plan_change",
      targetUserId,
      targetUserEmail: data.email || "",
      details: `Admin changed plan from ${data.plan} to ${plan}`,
      meta: { oldPlan: data.plan, newPlan: plan },
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, plan });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/users/:uid", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const targetUserId = req.params.uid;
  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: "Database not available" });

  try {
    const snap = await adminDb.collection("users").doc(targetUserId).get();
    const email = snap.exists ? snap.data().email || "" : "";

    await adminDb.collection("users").doc(targetUserId).delete();

    await adminDb.collection("adminLogs").add({
      adminId: req.uid,
      adminEmail: req.adminEmail || "",
      action: "user_delete",
      targetUserId,
      targetUserEmail: email,
      details: `User account deleted`,
      meta: {},
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export { router as adminRouter };
