import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../config/firebase.js";
import { verifyFirebaseToken } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const adminDb = getAdminDb();
  if (!adminDb) return res.json({ blogs: [] });

  try {
    const snap = await adminDb
      .collection("blogPosts")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const blogs = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    return res.json({ blogs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", verifyFirebaseToken, async (req, res) => {
  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: "Database not available" });

  const { title, slug, excerpt, content, category, author, published, tags, imageUrl } = req.body;
  if (!title || !content) return res.status(400).json({ error: "title and content required" });

  const autoSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  try {
    const ref = await adminDb.collection("blogPosts").add({
      title,
      slug: autoSlug,
      excerpt: excerpt || "",
      content,
      category: category || "Guide",
      author: author || "Team Pixalera",
      published: published ?? false,
      tags: tags || [],
      imageUrl: imageUrl || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, id: ref.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", verifyFirebaseToken, async (req, res) => {
  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: "Database not available" });

  try {
    await adminDb.collection("blogPosts").doc(req.params.id).update({
      ...req.body,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: "Database not available" });

  try {
    await adminDb.collection("blogPosts").doc(req.params.id).delete();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export { router as blogsRouter };
