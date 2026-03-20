import { useState, useEffect } from "react";
import {
  CreditCard, Zap, Sparkles, Calendar, TrendingUp, Package,
  Check, ArrowRight, Receipt, Shield, ChevronDown, ChevronUp,
  BarChart3, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext, PLANS, PlanId } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useUserProfile } from "@/hooks/useFirestore";
import { Timestamp, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface Transaction {
  id: string;
  type: string;
  credits: number;
  balanceBefore?: number;
  balanceAfter?: number;
  description: string;
  createdAt: any;
  tool?: string;
}

interface UsageBreakdown {
  catalog: number;
  photo: number;
  creative: number;
  cinematic: number;
}

const FEATURE_ACCESS: Record<PlanId, { label: string; available: boolean }[]> = {
  free: [
    { label: "15 credits/month", available: true },
    { label: "Catalog generation", available: true },
    { label: "Flash model", available: true },
    { label: "Max quality: 1K", available: true },
    { label: "Pro model", available: false },
    { label: "Photography & Ad Creatives", available: false },
    { label: "Cinematic Ads (CGI)", available: false },
    { label: "2K / 4K quality", available: false },
    { label: "Prompt Library", available: false },
    { label: "Watermark removed", available: false },
  ],
  starter: [
    { label: "100 credits/month", available: true },
    { label: "+20 bonus credits", available: true },
    { label: "Catalog, Photography, Ad Creatives", available: true },
    { label: "Flash + Pro models", available: true },
    { label: "Max quality: 2K", available: true },
    { label: "Watermark removed", available: true },
    { label: "Full history access", available: true },
    { label: "Basic Prompt Library", available: true },
    { label: "Cinematic Ads (CGI)", available: false },
    { label: "4K quality", available: false },
  ],
  pro: [
    { label: "450 credits (3 months)", available: true },
    { label: "+50 bonus credits", available: true },
    { label: "All tools unlocked", available: true },
    { label: "Cinematic Ads (CGI)", available: true },
    { label: "Flash + Pro models", available: true },
    { label: "Max quality: 4K", available: true },
    { label: "Watermark removed", available: true },
    { label: "Full Prompt Library", available: true },
    { label: "AI prompt suggestions", available: true },
    { label: "Priority processing", available: true },
  ],
};

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/6" style={{ background: "rgba(255,255,255,0.02)" }}>
        <Icon className="h-4 w-4 text-primary shrink-0" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function BillingPage() {
  const { user, setShowUpgradeModal } = useAppContext();
  const { profile } = useUserProfile();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [showAllTx, setShowAllTx] = useState(false);
  const [usage, setUsage] = useState<UsageBreakdown>({ catalog: 0, photo: 0, creative: 0, cinematic: 0 });

  const planExpiry = profile?.planExpiry
    ? profile.planExpiry instanceof Timestamp
      ? profile.planExpiry.toDate()
      : new Date(profile.planExpiry)
    : null;
  const isExpired = planExpiry ? new Date() > planExpiry : false;
  const plan = PLANS[user.plan];
  const totalCredits = plan.credits + plan.bonusCredits;
  const used = user.creditsUsed ?? 0;
  const remaining = user.creditsRemaining ?? 0;
  const usedPercent = totalCredits > 0 ? Math.min(100, (used / totalCredits) * 100) : 0;

  useEffect(() => {
    if (!authUser) return;
    loadTransactions();
  }, [authUser]);

  const loadTransactions = async () => {
    if (!authUser) return;
    setTxLoading(true);
    try {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", authUser.uid),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snap = await getDocs(q);
      const txs: Transaction[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Transaction, "id">),
      }));
      setTransactions(txs);

      const usageMap: UsageBreakdown = { catalog: 0, photo: 0, creative: 0, cinematic: 0 };
      for (const tx of txs) {
        if (tx.type === "deduction" && tx.tool) {
          const k = tx.tool as keyof UsageBreakdown;
          if (k in usageMap) usageMap[k] += tx.credits;
        }
      }
      setUsage(usageMap);
    } catch (e) {
      console.error("load tx error:", e);
    } finally {
      setTxLoading(false);
    }
  };

  const displayedTx = showAllTx ? transactions : transactions.slice(0, 5);

  const txTypeLabel: Record<string, { label: string; color: string }> = {
    plan_purchase: { label: "Plan Purchase", color: "#89E900" },
    deduction: { label: "Generation", color: "#F87171" },
    refund: { label: "Refund", color: "#60A5FA" },
    referral_reward: { label: "Referral", color: "#A78BFA" },
    expiry_reset: { label: "Plan Expired", color: "#F59E0B" },
  };

  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">Plans & Billing</h1>
          <p className="text-sm text-muted-foreground">Manage your subscription and track your usage</p>
        </div>

        {/* Current Plan Status */}
        <SectionCard title="Current Plan" icon={Package}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2.5">
                {user.plan === "pro" ? (
                  <Sparkles className="h-5 w-5 text-purple-400" />
                ) : (
                  <Zap className="h-5 w-5 text-primary" />
                )}
                <span className="text-2xl font-bold text-foreground">{plan.name} Plan</span>
                <Badge className={`text-[10px] ${isExpired ? "bg-red-500/15 text-red-400 border-red-500/25" : "bg-primary/10 text-primary border-primary/25"}`}>
                  {user.plan === "free" ? "Active" : isExpired ? "Expired" : "Active"}
                </Badge>
              </div>
              {planExpiry && user.plan !== "free" && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className={isExpired ? "text-red-400" : "text-muted-foreground"}>
                    {isExpired
                      ? `Expired on ${format(planExpiry, "MMM d, yyyy")}`
                      : `Renews / expires on ${format(planExpiry, "MMM d, yyyy")}`}
                  </span>
                </div>
              )}
              <p className="text-2xl font-bold" style={{ color: "#89E900" }}>
                {plan.price}
                <span className="text-sm text-muted-foreground font-normal"> / {plan.billingPeriod}</span>
              </p>
            </div>
            {user.plan !== "pro" && (
              <Button
                className="shrink-0"
                onClick={() => navigate("/app/checkout?plan=" + (user.plan === "free" ? "starter" : "pro"))}
              >
                Upgrade <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </SectionCard>

        {/* Credits */}
        <SectionCard title="Credits Overview" icon={Zap}>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Allotted", value: totalCredits, color: "#89E900" },
                { label: "Used", value: used, color: "#F87171" },
                { label: "Remaining", value: remaining, color: "#60A5FA" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl p-3 text-center border border-white/6" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Usage</span>
                <span>{usedPercent.toFixed(0)}% used</span>
              </div>
              <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${usedPercent}%`, background: usedPercent > 80 ? "#F87171" : "#89E900" }} />
              </div>
            </div>

            {/* Tool breakdown */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usage Breakdown</p>
              {[
                { key: "catalog" as const, label: "Catalog Generation", color: "#89E900" },
                { key: "photo" as const, label: "Product Photography", color: "#60A5FA" },
                { key: "creative" as const, label: "Ad Creatives", color: "#F59E0B" },
                { key: "cinematic" as const, label: "Cinematic Ads", color: "#A78BFA" },
              ].map(({ key, label, color }) => {
                const credits = usage[key];
                const pct = used > 0 ? (credits / used) * 100 : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-sm text-foreground/70 flex-1">{label}</span>
                      <span className="text-sm font-medium text-foreground">{credits} cr</span>
                    </div>
                    <div className="w-20 h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>

        {/* Billing Details */}
        {user.plan !== "free" && (
          <SectionCard title="Billing Details" icon={CreditCard}>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="text-foreground font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base price</span>
                <span className="text-foreground">₹{plan.priceAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (18%)</span>
                <span className="text-foreground">₹{(plan.priceAmount * 0.18).toFixed(2)}</span>
              </div>
              <div className="border-t border-white/8 pt-2 flex justify-between text-sm font-semibold">
                <span className="text-foreground">Total paid</span>
                <span style={{ color: "#89E900" }}>₹{(plan.priceAmount * 1.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment method</span>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">Razorpay</span>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Transaction History */}
        <SectionCard title="Transaction History" icon={Receipt}>
          {txLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 rounded-xl animate-pulse border border-white/6" style={{ background: "rgba(255,255,255,0.03)" }} />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 px-3 pb-1">
                <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Date</span>
                <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Type</span>
                <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Description</span>
                <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider text-right">Credits</span>
              </div>
              {displayedTx.map((tx) => {
                const typeInfo = txTypeLabel[tx.type] || { label: tx.type, color: "rgba(255,255,255,0.5)" };
                const isDeduction = tx.type === "deduction";
                const date = tx.createdAt
                  ? tx.createdAt instanceof Timestamp
                    ? tx.createdAt.toDate()
                    : new Date(tx.createdAt)
                  : null;
                return (
                  <div key={tx.id} className="grid grid-cols-4 gap-2 items-center rounded-xl px-3 py-2.5 border border-white/5 hover:border-white/8 transition-colors" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <span className="text-xs text-muted-foreground">
                      {date ? format(date, "MMM d") : "—"}
                    </span>
                    <span className="text-xs font-medium truncate" style={{ color: typeInfo.color }}>
                      {typeInfo.label}
                    </span>
                    <span className="text-xs text-muted-foreground/70 truncate">{tx.description || "—"}</span>
                    <span className={`text-xs font-bold text-right ${isDeduction ? "text-red-400" : "text-green-400"}`}>
                      {isDeduction ? "-" : "+"}{tx.credits}
                    </span>
                  </div>
                );
              })}
              {transactions.length > 5 && (
                <button
                  onClick={() => setShowAllTx(v => !v)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showAllTx ? <><ChevronUp className="h-3.5 w-3.5" /> Show less</> : <><ChevronDown className="h-3.5 w-3.5" /> Show {transactions.length - 5} more</>}
                </button>
              )}
            </div>
          )}
        </SectionCard>

        {/* Feature Access */}
        <SectionCard title="Feature Access" icon={BarChart3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {FEATURE_ACCESS[user.plan].map(({ label, available }) => (
              <div key={label} className="flex items-center gap-2.5 py-1">
                <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${available ? "bg-primary/15" : "bg-white/5"}`}>
                  {available ? (
                    <Check className="h-2.5 w-2.5 text-primary" />
                  ) : (
                    <span className="text-muted-foreground/40 text-[10px] font-bold">✕</span>
                  )}
                </div>
                <span className={`text-sm ${available ? "text-foreground/80" : "text-muted-foreground/40 line-through"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          {user.plan !== "pro" && (
            <div className="mt-4 pt-4 border-t border-white/8">
              <button
                onClick={() => navigate("/app/checkout?plan=" + (user.plan === "free" ? "starter" : "pro"))}
                className="flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: "#89E900" }}
              >
                <TrendingUp className="h-4 w-4" />
                Upgrade to unlock all features
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </SectionCard>

        {/* Plan cards */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Switch Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["free", "starter", "pro"] as PlanId[]).map((planId) => {
              const p = PLANS[planId];
              const isCurrent = user.plan === planId && !isExpired;
              return (
                <div key={planId} className={`rounded-xl p-4 space-y-3 border relative ${isCurrent ? "border-primary/40" : "border-white/6"}`}
                  style={{ background: isCurrent ? "rgba(137,233,0,0.04)" : "rgba(255,255,255,0.02)" }}>
                  {isCurrent && (
                    <Badge className="absolute -top-2 left-3 bg-primary text-black text-[10px]">Current</Badge>
                  )}
                  <div>
                    <p className="text-base font-bold text-foreground">{p.name}</p>
                    <p className="text-xl font-bold mt-0.5" style={{ color: "#89E900" }}>
                      {p.price}
                      <span className="text-xs text-muted-foreground font-normal">/{p.billingPeriod}</span>
                    </p>
                    {p.bonusCredits > 0 && (
                      <p className="text-[10px] text-green-400">+{p.bonusCredits} bonus credits</p>
                    )}
                  </div>
                  <Button variant={isCurrent ? "outline" : "default"} size="sm" className="w-full text-xs"
                    disabled={isCurrent || planId === "free"}
                    onClick={() => { if (!isCurrent && planId !== "free") navigate(`/app/checkout?plan=${planId}`); }}>
                    {isCurrent ? "Current" : planId === "free" ? "Free" : `Get ${p.name}`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
