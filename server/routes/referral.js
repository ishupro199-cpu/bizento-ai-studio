import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { verifyFirebaseToken } from "../middleware/auth.js";
import { getAdminDb } from "../config/firebase.js";

const router = Router();

const REFERRER_SIGNUP_REWARD = 5;
const REFERRED_SIGNUP_REWARD = 5;

const MILESTONES = [
  { count: 3, bonus: 10 },
  { count: 10, bonus: 50 },
  { count: 25, bonus: 150 },
];

router.get("/stats", verifyFirebaseToken, async (req, res) => {
  const db = getAdminDb();
  if (!db) return res.json({ totalReferrals: 0, creditsEarned: 0, pendingRewards: 0, referralCode: req.uid, referrals: [], nextMilestone: null });

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
    const existingRef = await db.collection("referrals").where("referred_user_id", "==", referredId).limit(1).get();
    if (!existingRef.empty) return res.status(409).json({ error: "Already referred" });

    const referrerSnap = await db.collection("users").doc(referrerCode).get();
    if (!referrerSnap.exists) return res.status(404).json({ error: "Referrer not found" });

    await db.runTransaction(async (tx) => {
      const referrerRef = db.collection("users").doc(referrerCode);
      const referredRef = db.collection("users").doc(referredId);
      const referrerData = referrerSnap.data() || {};

      const newReferralCount = (referrerData.referralCount || 0) + 1;
      let milestoneBonus = 0;
      for (const milestone of MILESTONES) {
        const prevCount = newReferralCount - 1;
        if (prevCount < milestone.count && newReferralCount >= milestone.count) {
          milestoneBonus += milestone.bonus;
        }
      }

      const totalReferrerReward = REFERRER_SIGNUP_REWARD + milestoneBonus;

      const referralRef = db.collection("referrals").doc();
      tx.set(referralRef, {
        referrer_id: referrerCode,
        referred_user_id: referredId,
        status: "completed",
        reward_given: true,
        referrer_reward: totalReferrerReward,
        referred_reward: REFERRED_SIGNUP_REWARD,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        milestoneBonus,
      });

      tx.update(referrerRef, {
        creditsRemaining: FieldValue.increment(totalReferrerReward),
        referralCount: newReferralCount,
        referralCreditsEarned: FieldValue.increment(totalReferrerReward),
      });

      tx.update(referredRef, {
        creditsRemaining: FieldValue.increment(REFERRED_SIGNUP_REWARD),
        referredBy: referrerCode,
        referralCode: referredId,
      });
    });

    await db.collection("transactions").add({
      userId: referrerCode,
      type: "referral_reward",
      credits: REFERRER_SIGNUP_REWARD,
      description: `Referral bonus — new user signed up`,
      createdAt: FieldValue.serverTimestamp(),
    });

    await db.collection("transactions").add({
      userId: referredId,
      type: "referral_reward",
      credits: REFERRED_SIGNUP_REWARD,
      description: `Welcome bonus — referred by a friend`,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({ success: true, referrerReward: REFERRER_SIGNUP_REWARD, referredReward: REFERRED_SIGNUP_REWARD });
  } catch (err) {
    console.error("Referral apply error:", err.message);
    res.status(500).json({ error: "Failed to apply referral" });
  }
});

router.post("/purchase-reward", verifyFirebaseToken, async (req, res) => {
  const { purchasedCredits } = req.body;
  const userId = req.uid;
  const db = getAdminDb();

  if (!db) return res.status(503).json({ error: "Database not available" });
  if (!purchasedCredits || purchasedCredits <= 0) return res.status(400).json({ error: "purchasedCredits required" });

  try {
    const userSnap = await db.collection("users").doc(userId).get();
    if (!userSnap.exists) return res.status(404).json({ error: "User not found" });
    const userData = userSnap.data() || {};
    const referrerId = userData.referredBy;

    if (!referrerId) return res.json({ success: false, message: "No referrer" });

    const alreadyRewarded = await db.collection("referrals")
      .where("referred_user_id", "==", userId)
      .where("purchase_reward_given", "==", true)
      .limit(1).get();
    if (!alreadyRewarded.empty) return res.json({ success: false, message: "Purchase reward already given" });

    const bonus = Math.floor(purchasedCredits * 0.5);

    await db.runTransaction(async (tx) => {
      const referrerRef = db.collection("users").doc(referrerId);
      tx.update(referrerRef, {
        creditsRemaining: FieldValue.increment(bonus),
        referralCreditsEarned: FieldValue.increment(bonus),
      });

      const refSnap = await db.collection("referrals")
        .where("referred_user_id", "==", userId)
        .where("referrer_id", "==", referrerId)
        .limit(1).get();
      if (!refSnap.empty) {
        tx.update(refSnap.docs[0].ref, { purchase_reward_given: true, purchase_bonus: bonus });
      }
    });

    await db.collection("transactions").add({
      userId: referrerId,
      type: "referral_reward",
      credits: bonus,
      description: `Purchase bonus — referred user bought a plan (${bonus} credits = 50% of ${purchasedCredits})`,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({ success: true, bonus, referrerId });
  } catch (err) {
    console.error("Purchase reward error:", err.message);
    res.status(500).json({ error: "Failed to give purchase reward" });
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
