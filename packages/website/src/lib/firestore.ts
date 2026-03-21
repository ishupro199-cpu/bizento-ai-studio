import {
  doc,
  collection,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  increment,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType =
  | "deduction"
  | "refund"
  | "bonus"
  | "plan_purchase"
  | "admin_adjust"
  | "expiry_reset";

export type PaymentStatus = "pending" | "success" | "failed";
export type AdminLogAction =
  | "plan_change"
  | "credit_adjust"
  | "user_suspend"
  | "user_activate"
  | "user_delete"
  | "admin_login"
  | "system";

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function logTransaction(params: {
  userId: string;
  type: TransactionType;
  credits: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  generationId?: string;
  paymentId?: string;
  tool?: string;
  model?: string;
}) {
  await addDoc(collection(db, "transactions"), {
    userId: params.userId,
    type: params.type,
    credits: params.credits,
    balanceBefore: params.balanceBefore,
    balanceAfter: params.balanceAfter,
    description: params.description,
    generationId: params.generationId || null,
    paymentId: params.paymentId || null,
    tool: params.tool || null,
    model: params.model || null,
    createdAt: serverTimestamp(),
  });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function createPaymentRecord(params: {
  userId: string;
  orderId: string;
  plan: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  credits: number;
  bonusCredits: number;
  status: PaymentStatus;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}) {
  const ref = await addDoc(collection(db, "payments"), {
    userId: params.userId,
    orderId: params.orderId,
    plan: params.plan,
    amount: params.amount,
    gstAmount: params.gstAmount,
    totalAmount: params.totalAmount,
    credits: params.credits,
    bonusCredits: params.bonusCredits,
    status: params.status,
    razorpayPaymentId: params.razorpayPaymentId || null,
    razorpaySignature: params.razorpaySignature || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePaymentRecord(
  paymentDocId: string,
  update: {
    status: PaymentStatus;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }
) {
  await updateDoc(doc(db, "payments", paymentDocId), {
    ...update,
    updatedAt: serverTimestamp(),
  });
}

// ─── Admin Logs ───────────────────────────────────────────────────────────────

export async function writeAdminLog(params: {
  adminId: string;
  adminEmail: string;
  action: AdminLogAction;
  targetUserId?: string;
  targetUserEmail?: string;
  details: string;
  meta?: Record<string, any>;
}) {
  await addDoc(collection(db, "adminLogs"), {
    adminId: params.adminId,
    adminEmail: params.adminEmail,
    action: params.action,
    targetUserId: params.targetUserId || null,
    targetUserEmail: params.targetUserEmail || null,
    details: params.details,
    meta: params.meta || {},
    createdAt: serverTimestamp(),
  });
}

// ─── Plan Activation ──────────────────────────────────────────────────────────

export function getPlanExpiry(plan: "starter" | "pro"): Date {
  const now = new Date();
  if (plan === "pro") {
    now.setMonth(now.getMonth() + 3);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now;
}

export async function activatePlan(params: {
  userId: string;
  plan: "starter" | "pro";
  credits: number;
  bonusCredits: number;
  paymentDocId: string;
}) {
  const expiry = getPlanExpiry(params.plan);
  const userRef = doc(db, "users", params.userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User not found");

  const data = snap.data();
  const balanceBefore = data.creditsRemaining ?? 0;
  const totalCredits = params.credits + params.bonusCredits;
  const balanceAfter = balanceBefore + totalCredits;

  await updateDoc(userRef, {
    plan: params.plan,
    creditsRemaining: balanceAfter,
    creditsUsed: 0,
    planExpiry: Timestamp.fromDate(expiry),
    planPurchasedAt: serverTimestamp(),
    lastPaymentId: params.paymentDocId,
    updatedAt: serverTimestamp(),
  });

  await logTransaction({
    userId: params.userId,
    type: "plan_purchase",
    credits: totalCredits,
    balanceBefore,
    balanceAfter,
    description: `Plan upgraded to ${params.plan} — ${params.credits} credits + ${params.bonusCredits} bonus`,
    paymentId: params.paymentDocId,
  });

  await setDoc(
    doc(db, "admin", "stats"),
    {
      totalRevenue: increment(1),
      [`planDistribution.${params.plan}`]: increment(1),
    },
    { merge: true }
  );
}

// ─── Credit Deduction (client-side, with logging) ─────────────────────────────

export async function deductCreditsWithLog(params: {
  userId: string;
  cost: number;
  tool: string;
  model: string;
  generationId?: string;
}) {
  const userRef = doc(db, "users", params.userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User not found");

  const data = snap.data();
  const balanceBefore = data.creditsRemaining ?? 0;

  if (balanceBefore < params.cost) {
    throw new Error("Insufficient credits");
  }

  const balanceAfter = balanceBefore - params.cost;

  await updateDoc(userRef, {
    creditsRemaining: balanceAfter,
    creditsUsed: increment(params.cost),
    flashGenerations:
      params.model === "flash" ? increment(1) : data.flashGenerations ?? 0,
    proGenerations:
      params.model === "pro" ? increment(1) : data.proGenerations ?? 0,
    updatedAt: serverTimestamp(),
  });

  await logTransaction({
    userId: params.userId,
    type: "deduction",
    credits: params.cost,
    balanceBefore,
    balanceAfter,
    description: `${params.tool} generation using ${params.model} model`,
    tool: params.tool,
    model: params.model,
    generationId: params.generationId,
  });

  return { balanceBefore, balanceAfter };
}

export async function refundCreditsWithLog(params: {
  userId: string;
  cost: number;
  tool: string;
  model: string;
  reason: string;
  generationId?: string;
}) {
  const userRef = doc(db, "users", params.userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const balanceBefore = data.creditsRemaining ?? 0;
  const balanceAfter = balanceBefore + params.cost;

  await updateDoc(userRef, {
    creditsRemaining: balanceAfter,
    creditsUsed: Math.max(0, (data.creditsUsed ?? 0) - params.cost),
    updatedAt: serverTimestamp(),
  });

  await logTransaction({
    userId: params.userId,
    type: "refund",
    credits: params.cost,
    balanceBefore,
    balanceAfter,
    description: `Refund: ${params.reason}`,
    tool: params.tool,
    model: params.model,
    generationId: params.generationId,
  });
}

// ─── Check Plan Expiry ────────────────────────────────────────────────────────

export async function checkAndHandlePlanExpiry(userId: string): Promise<boolean> {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return false;

  const data = snap.data();
  if (data.plan === "free") return false;
  if (!data.planExpiry) return false;

  const expiry: Date =
    data.planExpiry instanceof Timestamp
      ? data.planExpiry.toDate()
      : new Date(data.planExpiry);

  if (new Date() > expiry) {
    await updateDoc(userRef, {
      plan: "free",
      creditsRemaining: 0,
      planExpiry: null,
      updatedAt: serverTimestamp(),
    });

    await logTransaction({
      userId,
      type: "expiry_reset",
      credits: 0,
      balanceBefore: data.creditsRemaining ?? 0,
      balanceAfter: 0,
      description: `Plan expired — downgraded to free`,
    });

    return true;
  }

  return false;
}
