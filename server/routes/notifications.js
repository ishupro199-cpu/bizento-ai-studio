import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../config/firebase.js";
import { verifyFirebaseToken } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const adminDb = getAdminDb();
  if (!adminDb) return res.json({ notifications: [] });

  try {
    const snap = await adminDb
      .collection("notifications")
      .orderBy("sentAt", "desc")
      .limit(50)
      .get();

    const notifications = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      sentAt: d.data().sentAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    return res.json({ notifications });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", verifyFirebaseToken, async (req, res) => {
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
      sentBy: req.uid || "admin",
      readBy: [],
    });

    return res.json({ success: true, id: ref.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: "Database not available" });

  try {
    await adminDb.collection("notifications").doc(req.params.id).delete();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export { router as notificationsRouter };
