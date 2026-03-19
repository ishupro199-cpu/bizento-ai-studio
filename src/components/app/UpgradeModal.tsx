import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { useAppContext, PLANS, PlanId } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

export function UpgradeModal() {
  const { showUpgradeModal, setShowUpgradeModal, user } = useAppContext();
  const navigate = useNavigate();
  const planOrder: PlanId[] = ["free", "starter", "pro"];

  const handleUpgrade = (planId: PlanId) => {
    setShowUpgradeModal(false);
    navigate(`/app/checkout?plan=${planId}`);
  };

  return (
    <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
      <DialogContent className="sm:max-w-2xl bg-background border-[hsl(var(--glass-border))]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Unlock more credits and premium features
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {planOrder.map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = user.plan === planId;
            const isFree = planId === "free";

            return (
              <div
                key={planId}
                className={`glass rounded-xl p-4 space-y-3 relative border ${
                  isCurrent ? "border-primary/50" : "border-white/5"
                }`}
              >
                {isCurrent && (
                  <Badge className="absolute -top-2 left-3 bg-primary text-black text-[10px]">
                    Current
                  </Badge>
                )}
                {planId === "pro" && !isCurrent && (
                  <Badge className="absolute -top-2 right-3 bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
                    Best Value
                  </Badge>
                )}
                <div>
                  <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {plan.price}
                    <span className="text-xs text-muted-foreground font-normal">/{plan.billingPeriod}</span>
                  </p>
                  {plan.bonusCredits > 0 && (
                    <p className="text-xs text-green-400 mt-0.5">+{plan.bonusCredits} bonus credits</p>
                  )}
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  className="w-full text-xs"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent || isFree}
                  onClick={() => !isCurrent && !isFree && handleUpgrade(planId)}
                >
                  {isCurrent ? (
                    "Current Plan"
                  ) : isFree ? (
                    "Free"
                  ) : (
                    <span className="flex items-center gap-1.5">
                      Upgrade <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
