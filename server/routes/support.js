import { Router } from "express";
import { getAdminDb } from "../config/firebase.js";
import { verifyFirebaseToken, requireAdmin } from "../middleware/auth.js";
import { FieldValue } from "firebase-admin/firestore";

const router = Router();

router.post("/submit", async (req, res) => {
  try {
    const { userId, userEmail, subject, message } = req.body;
    if (!userEmail || !subject || !message) {
      return res.status(400).json({ error: "userEmail, subject, and message are required" });
    }

    const db = getAdminDb();
    if (!db) return res.status(500).json({ error: "Database not available" });

    const ref = await db.collection("support_tickets").add({
      userId: userId || null,
      userEmail,
      subject,
      message,
      status: "open",
      adminReply: null,
      replies: [],
      createdAt: FieldValue.serverTimestamp(),
      repliedAt: null,
    });

    return res.json({ success: true, ticketId: ref.id });
  } catch (err) {
    console.error("Support submit error:", err.message);
    return res.status(500).json({ error: "Failed to submit ticket" });
  }
});

router.post("/reply", verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const { ticketId, adminReply, markClosed } = req.body;
    if (!ticketId || !adminReply) {
      return res.status(400).json({ error: "ticketId and adminReply are required" });
    }

    const db = getAdminDb();
    if (!db) return res.status(500).json({ error: "Database not available" });

    const ticketRef = db.collection("support_tickets").doc(ticketId);
    const ticketSnap = await ticketRef.get();
    if (!ticketSnap.exists) return res.status(404).json({ error: "Ticket not found" });

    const ticketData = ticketSnap.data();

    await ticketRef.update({
      adminReply,
      status: markClosed ? "closed" : "replied",
      repliedAt: FieldValue.serverTimestamp(),
      replies: FieldValue.arrayUnion({
        text: adminReply,
        by: req.email || "admin",
        at: new Date().toISOString(),
      }),
    });

    if (ticketData.userId) {
      await db.collection("notifications").add({
        userId: ticketData.userId,
        title: "Admin replied to your support ticket",
        message: `Your ticket "${ticketData.subject}" has been replied to.`,
        type: "info",
        isRead: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    await db.collection("admin_logs").add({
      adminId: req.uid,
      adminEmail: req.email || "admin",
      action: "support_ticket_replied",
      targetType: "support_ticket",
      targetId: ticketId,
      details: { status: markClosed ? "closed" : "replied" },
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Support reply error:", err.message);
    return res.status(500).json({ error: "Failed to reply to ticket" });
  }
});

router.post("/close", verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const { ticketId } = req.body;
    const db = getAdminDb();
    if (!db) return res.status(500).json({ error: "Database not available" });

    await db.collection("support_tickets").doc(ticketId).update({
      status: "closed",
    });

    await db.collection("admin_logs").add({
      adminId: req.uid,
      adminEmail: req.email || "admin",
      action: "support_ticket_closed",
      targetType: "support_ticket",
      targetId: ticketId,
      details: {},
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to close ticket" });
  }
});

export { router as supportRouter };
