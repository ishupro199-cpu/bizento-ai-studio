import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../config/firebase.js";
import { verifyFirebaseToken } from "../middleware/auth.js";

const router = Router();

const PLANS = {
  starter: {
    name: "Starter",
    credits: 100,
    bonusCredits: 20,
    priceINR: 99,
    durationMonths: 1,
  },
  pro: {
    name: "Pro",
    credits: 450,
    bonusCredits: 50,
    priceINR: 399,
    durationMonths: 3,
  },
};

const GST_RATE = 0.18;

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

router.post("/create-order", verifyFirebaseToken, async (req, res) => {
  const { plan } = req.body;
  const uid = req.uid;

  if (!uid) return res.status(401).json({ error: "Unauthorized" });

  const planConfig = PLANS[plan];
  if (!planConfig) {
    return res.status(400).json({ error: "Invalid plan. Must be starter or pro." });
  }

  const baseAmount = planConfig.priceINR;
  const gstAmount = parseFloat((baseAmount * GST_RATE).toFixed(2));
  const totalAmount = parseFloat((baseAmount + gstAmount).toFixed(2));
  const amountPaisa = Math.round(totalAmount * 100);

  const razorpay = getRazorpay();

  if (!razorpay) {
    return res.status(503).json({
      error: "Payment system not configured",
      code: "RAZORPAY_NOT_CONFIGURED",
      testMode: true,
      planConfig: {
        plan,
        name: planConfig.name,
        credits: planConfig.credits,
        bonusCredits: planConfig.bonusCredits,
        baseAmount,
        gstAmount,
        totalAmount,
      },
    });
  }

  try {
    const order = await razorpay.orders.create({
      amount: amountPaisa,
      currency: "INR",
      receipt: `pixalera_${uid}_${Date.now()}`,
      notes: {
        userId: uid,
        plan,
        credits: planConfig.credits,
        bonusCredits: planConfig.bonusCredits,
      },
    });

    const adminDb = getAdminDb();
    let paymentDocId = null;
    if (adminDb) {
      const paymentRef = await adminDb.collection("payments").add({
        userId: uid,
        orderId: order.id,
        plan,
        amount: baseAmount,
        gstAmount,
        totalAmount,
        credits: planConfig.credits,
        bonusCredits: planConfig.bonusCredits,
        status: "pending",
        razorpayOrderId: order.id,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      paymentDocId = paymentRef.id;
    }

    return res.json({
      success: true,
      orderId: order.id,
      paymentDocId,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: amountPaisa,
      currency: "INR",
      planDetails: {
        plan,
        name: planConfig.name,
        credits: planConfig.credits,
        bonusCredits: planConfig.bonusCredits,
        baseAmount,
        gstAmount,
        totalAmount,
      },
    });
  } catch (err) {
    console.error("Create order error:", err.message);
    return res.status(500).json({ error: "Failed to create payment order" });
  }
});

router.post("/verify", verifyFirebaseToken, async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paymentDocId,
    plan,
  } = req.body;
  const uid = req.uid;

  if (!uid) return res.status(401).json({ error: "Unauthorized" });

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(503).json({ error: "Payment system not configured" });
  }

  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ error: "Invalid payment signature" });
  }

  const planConfig = PLANS[plan];
  if (!planConfig) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  const adminDb = getAdminDb();
  if (!adminDb) {
    return res.status(503).json({ error: "Database not available" });
  }

  try {
    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userSnap.data();
    const currentCredits = userData.creditsRemaining ?? 0;
    const totalNewCredits = planConfig.credits + planConfig.bonusCredits;
    const newBalance = currentCredits + totalNewCredits;

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + planConfig.durationMonths);

    await userRef.update({
      plan,
      creditsRemaining: newBalance,
      creditsUsed: 0,
      planExpiry: expiryDate,
      planPurchasedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection("transactions").add({
      userId: uid,
      type: "plan_purchase",
      credits: totalNewCredits,
      balanceBefore: currentCredits,
      balanceAfter: newBalance,
      description: `Plan upgraded to ${planConfig.name} — ${planConfig.credits} credits + ${planConfig.bonusCredits} bonus`,
      paymentId: paymentDocId,
      createdAt: FieldValue.serverTimestamp(),
    });

    if (paymentDocId) {
      await adminDb.collection("payments").doc(paymentDocId).update({
        status: "success",
        razorpayPaymentId,
        razorpaySignature,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    await adminDb.collection("admin").doc("stats").set(
      {
        totalRevenue: FieldValue.increment(planConfig.priceINR),
        totalPayments: FieldValue.increment(1),
        [`planDistribution.${plan}`]: FieldValue.increment(1),
      },
      { merge: true }
    );

    await adminDb.collection("adminLogs").add({
      action: "plan_change",
      targetUserId: uid,
      details: `User upgraded to ${planConfig.name} plan via Razorpay payment ${razorpayPaymentId}`,
      meta: { plan, credits: totalNewCredits, paymentId: razorpayPaymentId },
      createdAt: FieldValue.serverTimestamp(),
    });

    const purchaseBonus = await giveReferralPurchaseBonus(adminDb, uid, totalNewCredits);

    return res.json({
      success: true,
      plan,
      credits: totalNewCredits,
      newBalance,
      planExpiry: expiryDate.toISOString(),
      referralBonus: purchaseBonus,
    });
  } catch (err) {
    console.error("Verify payment error:", err.message);

    if (paymentDocId && adminDb) {
      await adminDb.collection("payments").doc(paymentDocId).update({
        status: "failed",
        error: err.message,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return res.status(500).json({ error: "Payment verification failed" });
  }
});

router.get("/config", (_req, res) => {
  res.json({
    configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    keyId: process.env.RAZORPAY_KEY_ID || null,
  });
});

async function giveReferralPurchaseBonus(adminDb, userId, purchasedCredits) {
  try {
    const userSnap = await adminDb.collection("users").doc(userId).get();
    if (!userSnap.exists) return null;
    const userData = userSnap.data() || {};
    const referrerId = userData.referredBy;
    if (!referrerId) return null;

    const alreadyRewarded = await adminDb.collection("referrals")
      .where("referred_user_id", "==", userId)
      .where("purchase_reward_given", "==", true)
      .limit(1).get();
    if (!alreadyRewarded.empty) return null;

    const bonus = Math.floor(purchasedCredits * 0.5);
    if (bonus <= 0) return null;

    await adminDb.runTransaction(async (tx) => {
      const referrerRef = adminDb.collection("users").doc(referrerId);
      tx.update(referrerRef, {
        creditsRemaining: FieldValue.increment(bonus),
        referralCreditsEarned: FieldValue.increment(bonus),
      });
      const refSnap = await adminDb.collection("referrals")
        .where("referred_user_id", "==", userId)
        .where("referrer_id", "==", referrerId)
        .limit(1).get();
      if (!refSnap.empty) {
        tx.update(refSnap.docs[0].ref, { purchase_reward_given: true, purchase_bonus: bonus });
      }
    });

    await adminDb.collection("transactions").add({
      userId: referrerId,
      type: "referral_reward",
      credits: bonus,
      description: `Purchase bonus — referred user bought a plan (${bonus} credits = 50% of ${purchasedCredits})`,
      createdAt: FieldValue.serverTimestamp(),
    });

    return bonus;
  } catch (err) {
    console.error("Referral purchase bonus error:", err.message);
    return null;
  }
}

export { router as paymentRouter };
