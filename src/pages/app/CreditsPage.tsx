import { useState, useEffect } from "react";
import { Coins, Zap, Sparkles, TrendingUp, ArrowDownCircle, ArrowUpCircle, RotateCcw, ShoppingCart } from "lucide-react";
import { useAppContext, PLANS } from "@/contexts/AppContext";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: string;
  credits: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  tool?: string;
  model?: string;
  createdAt: Date;
}

const typeConfig: Record<string, { label: string; color: string; icon: any }> = {
  deduction:    { label: "Used",       color: "text-red-400",   icon: ArrowDownCircle },
  refund:       { label: "Refunded",   color: "text-green-400", icon: RotateCcw },
  bonus:        { label: "Bonus",      color: "text-green-400", icon: ArrowUpCircle },
  plan_purchase:{ label: "Purchase",   color: "text-primary",   icon: ShoppingCart },
  admin_adjust: { label: "Adjusted",   color: "text-yellow-400",icon: Coins },
  expiry_reset: { label: "Expired",    color: "text-orange-400",icon: Zap },
};

export default function CreditsPage() {
  const { user, setShowUpgradeModal } = useAppContext();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const plan = PLANS[user.plan];
  const usagePercent = plan.credits > 0 ? Math.round((user.creditsUsed / plan.credits) * 100) : 0;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    if (!authUser) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", authUser.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsub = onSnapshot(q, (snap) => {
      setTransactions(
        snap.docs.map((d) => {
          const data = d.data();
          const raw = data.createdAt;
          const createdAt = raw?.toDate ? raw.toDate() : raw ? new Date(raw) : new Date();
          return {
            id: d.id,
            type: data.type || "deduction",
            credits: data.credits ?? 0,
            balanceBefore: data.balanceBefore ?? 0,
            balanceAfter: data.balanceAfter ?? 0,
            description: data.description || "",
            tool: data.tool,
            model: data.model,
            createdAt,
          };
        })
      );
      setTxLoading(false);
    }, () => setTxLoading(false));

    return unsub;
  }, [authUser]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Credits</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your generation credits</p>
        </div>
        <Badge variant="secondary" className="text-xs">{plan.name} Plan</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Remaining", value: user.creditsRemaining, icon: Coins, color: "text-primary" },
          { label: "Used This Period", value: user.creditsUsed, icon: TrendingUp, color: "text-red-400" },
          { label: "Plan Limit", value: plan.credits, icon: Zap, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Usage this period</span>
          <span className="text-foreground font-medium">{user.creditsUsed} / {plan.credits}</span>
        </div>
        <Progress value={Math.min(usagePercent, 100)} className="h-2" />
        {usagePercent >= 80 && (
          <p className="text-xs text-yellow-400">
            {usagePercent >= 100 ? "Credits exhausted." : "Running low on credits."}
            {" "}<button onClick={() => navigate("/app/plan")} className="underline">Upgrade your plan</button>
          </p>
        )}
      </div>

      <div className="glass rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Usage by Model</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-3.5 w-3.5" /> Flash
            </span>
            <span className="text-foreground">{user.flashGenerations} generations</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Pro
            </span>
            <span className="text-foreground">{user.proGenerations} generations</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => navigate("/app/plan")} className="flex-1">
          Upgrade Plan
        </Button>
        <Button onClick={() => setShowUpgradeModal(true)} variant="outline" className="flex-1">
          Buy Credits
        </Button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-foreground">Transaction History</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 20 transactions</p>
        </div>

        {txLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <Coins className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Generate your first image to see credits used here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.map((tx) => {
              const cfg = typeConfig[tx.type] || typeConfig.deduction;
              const Icon = cfg.icon;
              const isPositive = ["refund", "bonus", "plan_purchase", "admin_adjust"].includes(tx.type) && tx.balanceAfter > tx.balanceBefore;

              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`p-1.5 rounded-lg bg-white/5 ${cfg.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(tx.createdAt, "MMM d, yyyy · h:mm a")}
                      {tx.tool && ` · ${tx.tool}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                      {isPositive ? "+" : "-"}{tx.credits}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.balanceAfter} left</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
