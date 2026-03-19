import { Check, Sparkles, Zap, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext, PLANS, PlanId } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useUserProfile } from "@/hooks/useFirestore";
import { Timestamp } from "firebase/firestore";

const planOrder: PlanId[] = ["free", "starter", "pro"];

export default function PlanPage() {
  const { user } = useAppContext();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  const planExpiry = profile?.planExpiry
    ? profile.planExpiry instanceof Timestamp
      ? profile.planExpiry.toDate()
      : new Date(profile.planExpiry)
    : null;

  const isExpired = planExpiry ? new Date() > planExpiry : false;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Your Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your subscription</p>
      </div>

      {planExpiry && user.plan !== "free" && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          isExpired
            ? "bg-red-500/10 border-red-500/20"
            : "bg-primary/5 border-primary/20"
        }`}>
          <Calendar className={`h-4 w-4 shrink-0 ${isExpired ? "text-red-400" : "text-primary"}`} />
          <div>
            <p className={`text-sm font-medium ${isExpired ? "text-red-400" : "text-foreground"}`}>
              {isExpired
                ? "Your plan has expired — you've been downgraded to Free"
                : `${PLANS[user.plan].name} plan active until ${format(planExpiry, "MMM d, yyyy")}`}
            </p>
            {isExpired && (
              <p className="text-xs text-muted-foreground mt-0.5">Renew below to restore access</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {planOrder.map((planId) => {
          const plan = PLANS[planId];
          const isCurrent = user.plan === planId && !isExpired;
          const isFree = planId === "free";

          return (
            <div
              key={planId}
              className={`glass rounded-xl p-5 space-y-4 relative border ${
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
                <div className="flex items-center gap-2">
                  {planId === "pro" ? (
                    <Sparkles className="h-4 w-4 text-purple-400" />
                  ) : (
                    <Zap className="h-4 w-4 text-primary" />
                  )}
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                </div>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {plan.price}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{plan.billingPeriod}
                  </span>
                </p>
                {plan.bonusCredits > 0 && (
                  <p className="text-xs text-green-400 mt-1">+{plan.bonusCredits} bonus credits</p>
                )}
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
                onClick={() => {
                  if (!isFree && !isCurrent) {
                    navigate(`/app/checkout?plan=${planId}`);
                  }
                }}
              >
                {isCurrent ? (
                  "Current Plan"
                ) : isFree ? (
                  "Downgrade to Free"
                ) : (
                  <span className="flex items-center gap-2">
                    Upgrade to {plan.name}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Current Usage</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Credits Left", value: user.creditsRemaining },
            { label: "Credits Used", value: user.creditsUsed },
            { label: "Total Gens", value: user.flashGenerations + user.proGenerations },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
