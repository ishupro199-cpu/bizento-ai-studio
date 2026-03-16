import { Coins, Zap, Sparkles, TrendingUp } from "lucide-react";
import { useAppContext, PLANS } from "@/contexts/AppContext";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CreditsPage() {
  const { user, setShowUpgradeModal } = useAppContext();
  const plan = PLANS[user.plan];
  const usagePercent = plan.credits > 0 ? Math.round((user.creditsUsed / plan.credits) * 100) : 0;

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
          { label: "Used", value: user.creditsUsed, icon: TrendingUp, color: "text-primary" },
          { label: "Monthly Limit", value: plan.credits, icon: Zap, color: "text-primary" },
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
          <span className="text-muted-foreground">Usage</span>
          <span className="text-foreground font-medium">{user.creditsUsed} / {plan.credits}</span>
        </div>
        <Progress value={usagePercent} className="h-2" />
      </div>

      <div className="glass rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Usage by Model</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground"><Zap className="h-3.5 w-3.5" /> Flash</span>
            <span className="text-foreground">{user.flashGenerations} generations ({user.flashGenerations} credits)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground"><Sparkles className="h-3.5 w-3.5" /> Pro</span>
            <span className="text-foreground">{user.proGenerations} generations ({user.proGenerations * 2} credits)</span>
          </div>
        </div>
      </div>

      <Button onClick={() => setShowUpgradeModal(true)} className="w-full sm:w-auto">Upgrade Plan</Button>
    </div>
  );
}
