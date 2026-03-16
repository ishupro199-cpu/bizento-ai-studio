import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { useAppContext, PLANS, PlanId } from "@/contexts/AppContext";

export function UpgradeModal() {
  const { showUpgradeModal, setShowUpgradeModal, user, switchPlan } = useAppContext();
  const planOrder: PlanId[] = ["free", "starter", "pro"];

  return (
    <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
      <DialogContent className="sm:max-w-2xl bg-background border-[hsl(var(--glass-border))]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Unlock more credits and access to the Pro model
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {planOrder.map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = user.plan === planId;
            return (
              <div key={planId} className={`glass rounded-xl p-4 space-y-3 relative ${isCurrent ? "border-primary" : ""}`}>
                {isCurrent && (
                  <Badge className="absolute -top-2 left-3 bg-primary text-primary-foreground text-[10px]">Current</Badge>
                )}
                <div>
                  <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
                  <p className="text-2xl font-bold text-foreground mt-1">{plan.price}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
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
                  disabled={isCurrent}
                  onClick={() => { switchPlan(planId); setShowUpgradeModal(false); }}
                >
                  {isCurrent ? "Current Plan" : "Switch"}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
