import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext, PLANS, PlanId } from "@/contexts/AppContext";

const planOrder: PlanId[] = ["free", "starter", "pro"];

export default function PlanPage() {
  const { user, switchPlan } = useAppContext();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Your Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your subscription</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {planOrder.map((planId) => {
          const plan = PLANS[planId];
          const isCurrent = user.plan === planId;
          return (
            <div key={planId} className={`glass rounded-xl p-5 space-y-4 relative ${isCurrent ? "border-primary" : ""}`}>
              {isCurrent && <Badge className="absolute -top-2 left-3 bg-primary text-primary-foreground text-[10px]">Current</Badge>}
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                </div>
                <p className="text-3xl font-bold text-foreground mt-2">{plan.price}<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
              </div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={isCurrent ? "outline" : "default"}
                disabled={isCurrent}
                onClick={() => switchPlan(planId)}
              >
                {isCurrent ? "Current Plan" : "Switch to " + plan.name}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
