import { Sparkles, Camera, Clapperboard, LayoutGrid, Megaphone, ArrowRight } from "lucide-react";

const suggestions = [
  "Luxury perfume bottle cinematic ad",
  "Minimal white background catalog image",
  "Floral skincare product photography",
  "Sneaker on neon gradient background",
  "Watch product shot with water splash",
  "Organic food packaging studio shot",
];

const demoSteps = [
  { label: "Product Photo", icon: Camera, desc: "Upload your raw product image" },
  { label: "AI Processing", icon: Sparkles, desc: "Our AI enhances and transforms" },
  { label: "Pro Visuals", icon: Clapperboard, desc: "Get studio-quality results" },
];

const tools = [
  { name: "Generate Catalog", desc: "Professional ecommerce images", icon: LayoutGrid },
  { name: "Product Photography", desc: "Studio-quality scenes", icon: Camera },
  { name: "Cinematic Ads", desc: "CGI product advertisements", icon: Clapperboard },
  { name: "Ad Creatives", desc: "Social media ad designs", icon: Megaphone },
];

export default function WelcomeDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Hero */}
        <div className="space-y-3 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Welcome to <span className="text-gradient">Bizento AI</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Turn your product photos into professional catalog images and ads with AI.
          </p>
        </div>

        {/* Demo Flow */}
        <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {demoSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              <div className="glass rounded-2xl p-5 text-center w-44 hover:bg-[hsl(var(--glass-hover))] transition-all duration-200 group">
                <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
              </div>
              {i < demoSteps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {tools.map((tool) => (
            <button
              key={tool.name}
              className="glass rounded-xl p-4 text-left hover:bg-[hsl(var(--glass-hover))] transition-all duration-200 group cursor-pointer"
            >
              <tool.icon className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-foreground">{tool.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
            </button>
          ))}
        </div>

        {/* Suggestion Chips */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Try a prompt</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                className="glass rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass-hover))] transition-all duration-200 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
