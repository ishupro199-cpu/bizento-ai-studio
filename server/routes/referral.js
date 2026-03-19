import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { verifyFirebaseToken } from "../middleware/auth.js";
import { getAdminDb } from "../config/firebase.js";

const router = Router();

const REFERRER_REWARD = 20;
const REFERRED_REWARD = 10;
const MILESTONES = [
  { count: 3, bonus: 10 },
  { count: 10, bonus: 50 },
  { count: 25, bonus: 150 },
];

router.get("/stats", verifyFirebaseToken, async (req, res) => {
  const db = getAdminDb();
  if (!db) return res.json({ totalReferrals: 0, creditsEarned: 0, pendingRewards: 0, referralCode: req.uid, referrals: [] });

  try {
    const [referralSnap, userSnap] = await Promise.all([
      db.collection("referrals").where("referrer_id", "==", req.uid).orderBy("created_at", "desc").limit(50).get(),
      db.collection("users").doc(req.uid).get(),
    ]);

    const referrals = referralSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const userData = userSnap.data() || {};

    const totalReferrals = referrals.length;
    const creditsEarned = userData.referralCreditsEarned || 0;
    const pendingRewards = referrals.filter(r => r.status === "pending").length;

    res.json({
      totalReferrals,
      creditsEarned,
      pendingRewards,
      referralCode: req.uid,
      referrals: referrals.slice(0, 20),
      nextMilestone: MILESTONES.find(m => m.count > totalReferrals) || null,
    });
  } catch (err) {
    console.error("Referral stats error:", err.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.post("/apply", verifyFirebaseToken, async (req, res) => {
  const { referrerCode } = req.body;
  const referredId = req.uid;
  const db = getAdminDb();

  if (!db) return res.status(503).json({ error: "Database not available" });
  if (!referrerCode) return res.status(400).json({ error: "referrerCode required" });
  if (referrerCode === referredId) return res.status(400).json({ error: "Self-referral not allowed" });

  try {
    const existingRef = await db.collection("referrals")
      .where("referred_user_id", "==", referredId).limit(1).get();
    if (!existingRef.empty) return res.status(409).json({ error: "Already referred" });

    const referrerSnap = await db.collection("users").doc(referrerCode).get();
    if (!referrerSnap.exists) return res.status(404).json({ error: "Referrer not found" });

    const referralDoc = {
      referrer_id: referrerCode,
      referred_user_id: referredId,
      status: "pending",
      reward_given: false,
      created_at: new Date().toISOString(),
    };
    const docRef = await db.collection("referrals").add(referralDoc);

    await db.collection("users").doc(referredId).set(
      { referredBy: referrerCode, referralCode: referredId },
      { merge: true }
    );

    res.json({ success: true, referralId: docRef.id });
  } catch (err) {
    console.error("Referral apply error:", err.message);
    res.status(500).json({ error: "Failed to apply referral" });
  }
});

router.post("/complete", verifyFirebaseToken, async (req, res) => {
  const db = getAdminDb();
  if (!db) return res.status(503).json({ error: "Database not available" });

  const userId = req.uid;

  try {
    const pendingSnap = await db.collection("referrals")
      .where("referred_user_id", "==", userId)
      .where("status", "==", "pending")
      .limit(1).get();

    if (pendingSnap.empty) return res.json({ success: false, message: "No pending referral" });

    const refDoc = pendingSnap.docs[0];
    const refData = refDoc.data();
    const referrerId = refData.referrer_id;

    await db.runTransaction(async (tx) => {
      const referrerRef = db.collection("users").doc(referrerId);
      const referredRef = db.collection("users").doc(userId);
      const referrerSnap = await tx.get(referrerRef);
      const referrerData = referrerSnap.data() || {};

      const newReferralCount = (referrerData.referralCount || 0) + 1;
      const newCreditsEarned = (referrerData.referralCreditsEarned || 0) + REFERRER_REWARD;

      let milestoneBonus = 0;
      for (const milestone of MILESTONES) {
        const prevCount = newReferralCount - 1;
        if (prevCount < milestone.count && newReferralCount >= milestone.count) {
          milestoneBonus += milestone.bonus;
        }
      }

      tx.update(referrerRef, {
        creditsRemaining: FieldValue.increment(REFERRER_REWARD + milestoneBonus),
        referralCount: newReferralCount,
        referralCreditsEarned: newCreditsEarned + milestoneBonus,
      });
      tx.update(referredRef, {
        creditsRemaining: FieldValue.increment(REFERRED_REWARD),
      });
      tx.update(refDoc.ref, {
        status: "completed",
        reward_given: true,
        completed_at: new Date().toISOString(),
        milestoneBonus,
      });
    });

    res.json({ success: true, referrerReward: REFERRER_REWARD, referredReward: REFERRED_REWARD });
  } catch (err) {
    console.error("Referral complete error:", err.message);
    res.status(500).json({ error: "Failed to complete referral" });
  }
});

router.get("/all", verifyFirebaseToken, async (req, res) => {
  const db = getAdminDb();
  if (!db) return res.status(503).json({ error: "Database not available" });

  try {
    const snap = await db.collection("referrals").orderBy("created_at", "desc").limit(200).get();
    const referrals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ referrals, total: referrals.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { router as referralRouter };
