import { useState } from "react";
import { Sparkles, Camera, Clapperboard, LayoutGrid, Megaphone, ArrowRight } from "lucide-react";
import { StyleSelector } from "@/components/app/StyleSelector";
import { GenerationLoading } from "@/components/app/GenerationLoading";
import { GenerationResults } from "@/components/app/GenerationResults";
import { useGenerationState } from "@/hooks/useGenerationState";
import { PromptBar } from "@/components/app/PromptBar";

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
  const gen = useGenerationState();
  const [inputPrompt, setInputPrompt] = useState("");

  const isGenerating = gen.phase === "uploading" || gen.phase === "generating";

  if (gen.phase === "complete") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <GenerationResults results={gen.results} onRegenerate={gen.reset} />
        </div>
        <PromptBar
          prompt={gen.prompt}
          onPromptChange={() => {}}
          onGenerate={gen.reset}
          disabled
        />
      </div>
    );
  }

  if (isGenerating) {
    return <GenerationLoading currentStep={gen.currentStep} progress={gen.progress} />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-3xl w-full text-center space-y-6 sm:space-y-8">
          {/* Hero */}
          <div className="space-y-3 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Welcome to <span className="text-gradient">Bizento AI</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Turn your product photos into professional catalog images and ads with AI.
            </p>
          </div>

          {/* Demo Flow */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {demoSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3 sm:gap-4">
                <div className="glass rounded-2xl p-4 sm:p-5 text-center w-36 sm:w-44 hover:bg-[hsl(var(--glass-hover))] transition-all duration-200 group">
                  <div className="mx-auto mb-2 sm:mb-3 h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <step.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground">{step.label}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{step.desc}</p>
                </div>
                {i < demoSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                )}
              </div>
            ))}
          </div>

          {/* Style Selector */}
          <div className="animate-fade-in text-left" style={{ animationDelay: "0.15s" }}>
            <StyleSelector selected={gen.selectedStyle} onSelect={gen.setSelectedStyle} />
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {tools.map((tool) => (
              <button
                key={tool.name}
                className="glass rounded-xl p-3 sm:p-4 text-left hover:bg-[hsl(var(--glass-hover))] transition-all duration-200 group cursor-pointer"
              >
                <tool.icon className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-medium text-foreground">{tool.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <PromptBar
        prompt={inputPrompt}
        onPromptChange={setInputPrompt}
        onGenerate={() => gen.startGeneration(inputPrompt)}
        disabled={false}
      />
    </div>
  );
}
