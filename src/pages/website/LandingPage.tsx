import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Camera, Clapperboard, LayoutGrid, Megaphone, Check, Zap } from "lucide-react";

const features = [
  { icon: LayoutGrid, title: "Catalog Images", desc: "Professional ecommerce-ready product photos in seconds" },
  { icon: Camera, title: "Product Photography", desc: "AI-generated studio scenes without a studio" },
  { icon: Clapperboard, title: "Cinematic Ads", desc: "CGI-quality product advertisements" },
  { icon: Megaphone, title: "Ad Creatives", desc: "Social media ready ad designs" },
];

const pricingPlans = [
  { name: "Starter", price: "Free", credits: "50 credits/mo", features: ["Nano Bana Flash", "720p exports", "Basic tools"] },
  { name: "Pro", price: "$29", credits: "500 credits/mo", features: ["Nano Bana Pro", "4K exports", "All tools", "Priority"], popular: true },
  { name: "Business", price: "$99", credits: "2000 credits/mo", features: ["All Pro features", "API access", "Team seats", "Custom branding"] },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Bizento <span className="text-primary">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/app">
            <Button size="sm" className="bg-primary text-primary-foreground rounded-lg">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 text-sm text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-primary" />
          AI-Powered Creative Automation
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
          Product photos to<br />
          <span className="text-gradient">pro visuals</span> in seconds
        </h1>
        <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
          Upload a simple product photo and generate professional catalog images, cinematic ads, and social media creatives with AI.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link to="/app">
            <Button size="lg" className="bg-primary text-primary-foreground rounded-xl gap-2 glow-accent">
              Start Creating <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button size="lg" variant="ghost" className="glass rounded-xl">Watch Demo</Button>
          </Link>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="glass rounded-2xl p-8 md:p-12 text-center">
          <div className="grid grid-cols-3 gap-6">
            <div className="glass rounded-xl aspect-square flex items-center justify-center">
              <Camera className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="glass rounded-xl aspect-square flex items-center justify-center border-primary/20">
              <Clapperboard className="h-8 w-8 text-primary/40" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-6">Raw photo → AI Processing → Professional output</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-10">Everything you need</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-xl p-6 hover:bg-[hsl(var(--glass-hover))] transition-all duration-200 group">
              <f.icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-10">Simple pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`glass rounded-xl p-6 ${plan.popular ? "border-primary/40 glow-accent" : ""}`}
            >
              {plan.popular && (
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Most Popular</span>
              )}
              <h3 className="text-xl font-bold mt-2">{plan.name}</h3>
              <p className="text-3xl font-bold mt-2">{plan.price}<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
              <p className="text-sm text-muted-foreground mt-1">{plan.credits}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link to="/app" className="block mt-6">
                <Button className={`w-full rounded-lg ${plan.popular ? "bg-primary text-primary-foreground" : "glass"}`}>
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--glass-border))] py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm text-muted-foreground">© 2026 Bizento AI</span>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
