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

// ─── Stats ──────────────────────────────────────────────────────────────────

router.get("/stats", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const adminDb = getAdminDb();
  if (!adminDb) return res.json({ totalUsers: 0, totalGenerations: 0, totalCreditsUsed: 0 });

  try {
    const [usersSnap, statsSnap] = await Promise.all([
      adminDb.collection("users").get(),
      adminDb.collection("admin").doc("stats").get(),
    ]);

    const stats = statsSnap.exists ? statsSnap.data() : {};
    const users = usersSnap.docs.map((d) => d.data());

    return res.json({
      totalUsers: users.length,
      activeUsers: users.filter((u) => !u.suspended).length,
      proUsers: users.filter((u) => u.plan === "pro").length,
      starterUsers: users.filter((u) => u.plan === "starter").length,
      freeUsers: users.filter((u) => u.plan === "free").length,
      totalGenerations: stats.totalGenerations || 0,
      totalCreditsUsed: stats.totalCreditsUsed || 0,
      flashGenerations: stats.flashGenerations || 0,
      proGenerations: stats.proGenerations || 0,
      totalRevenue: stats.totalRevenue || 0,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Users ──────────────────────────────────────────────────────────────────

router.get("/users", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const adminDb = getAdminDb();
  if (!adminDb) return res.json({ users: [] });

  try {
    const snap = await adminDb.collection("users").orderBy("createdAt", "desc").limit(200).get();
    const users = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() || null,
      planExpiry: d.data().planExpiry?.toDate?.()?.toISOString() || null,
    }));
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Transactions ────────────────────────────────────────────────────────────

router.get("/transactions", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const adminDb = getAdminDb();
  if (!adminDb) return res.json({ transactions: [] });

  try {
    const snap = await adminDb
      .collection("transactions")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const transactions = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
    }));
    return res.json({ transactions });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Generations ─────────────────────────────────────────────────────────────

router.get("/generations", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const adminDb = getAdminDb();
  if (!adminDb) return res.json({ generations: [] });

  try {
    const snap = await adminDb
      .collection("generations")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const generations = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
    }));
    return res.json({ generations });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Admin Logs ──────────────────────────────────────────────────────────────

router.get("/logs", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const adminDb = getAdminDb();
  if (!adminDb) return res.json({ logs: [] });

  try {
    const snap = await adminDb
      .collection("adminLogs")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const logs = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
    }));
    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Notifications ────────────────────────────────────────────────────────────

router.post("/notify", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: "Database not available" });

  const { title, body, type = "info", target = "all", imageUrl } = req.body;
  if (!title || !body) return res.status(400).json({ error: "title and body required" });

  try {
    const ref = await adminDb.collection("notifications").add({
      title,
      body,
      type,
      target,
      imageUrl: imageUrl || null,
      sentAt: FieldValue.serverTimestamp(),
      sentBy: req.uid,
      readBy: [],
    });

    await adminDb.collection("adminLogs").add({
      adminId: req.uid,
      adminEmail: req.adminEmail || "",
      action: "system",
      details: `Sent notification: "${title}" to ${target}`,
      meta: { notificationId: ref.id, type, target },
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, id: ref.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Credits ─────────────────────────────────────────────────────────────────

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

// ─── Suspend / Activate User ─────────────────────────────────────────────────

router.post("/users/suspend", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const { targetUserId, suspend, reason } = req.body;
  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: "Database not available" });

  try {
    const userRef = adminDb.collection("users").doc(targetUserId);
    const snap = await userRef.get();
    if (!snap.exists) return res.status(404).json({ error: "User not found" });

    await userRef.update({ suspended: !!suspend, updatedAt: FieldValue.serverTimestamp() });

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

// ─── Change User Plan ─────────────────────────────────────────────────────────

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

// ─── Delete User ──────────────────────────────────────────────────────────────

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
      details: "User account deleted",
      meta: {},
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Blog (via admin) ─────────────────────────────────────────────────────────

router.post("/blog", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: "Database not available" });

  const { title, slug, excerpt, content, category, author, published, tags, imageUrl } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });

  const autoSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  try {
    const ref = await adminDb.collection("blogPosts").add({
      title,
      slug: autoSlug,
      excerpt: excerpt || "",
      content: content || "",
      category: category || "Guide",
      author: author || "Team Pixalera",
      published: published ?? false,
      tags: tags || [],
      imageUrl: imageUrl || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection("adminLogs").add({
      adminId: req.uid,
      adminEmail: req.adminEmail || "",
      action: "system",
      details: `Created blog post: "${title}"`,
      meta: { blogId: ref.id, published },
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, id: ref.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export { router as adminRouter };
