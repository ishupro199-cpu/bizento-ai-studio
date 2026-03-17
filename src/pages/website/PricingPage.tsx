import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";

const plans = [
  { name: "Starter", price: "Free", credits: "50 credits/mo", features: ["Nano Bana Flash model", "720p exports", "Basic tools", "Community support"] },
  { name: "Pro", price: "$29", credits: "500 credits/mo", features: ["Nano Bana Pro model", "4K exports", "All tools", "Priority support", "No watermark"], popular: true },
  { name: "Business", price: "$99", credits: "2000 credits/mo", features: ["Everything in Pro", "API access", "5 team seats", "Custom branding", "Dedicated support"] },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Pixa<span className="text-primary">Lera</span></span>
        </Link>
        <Link to="/app"><Button size="sm" className="bg-primary text-primary-foreground rounded-lg">Get Started</Button></Link>
      </nav>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">Simple <span className="text-gradient">Pricing</span></h1>
          <p className="text-lg text-muted-foreground mt-4">Start free, scale as you grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`glass rounded-xl p-8 flex flex-col ${plan.popular ? "border-primary/40 glow-accent" : ""}`}>
              {plan.popular && <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Most Popular</span>}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-4xl font-bold mt-3">{plan.price}<span className="text-base text-muted-foreground font-normal">/mo</span></p>
              <p className="text-sm text-muted-foreground mt-1">{plan.credits}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/app" className="mt-8">
                <Button className={`w-full rounded-lg ${plan.popular ? "bg-primary text-primary-foreground" : "glass"}`}>
                  {plan.price === "Free" ? "Start Free" : "Get Started"}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
