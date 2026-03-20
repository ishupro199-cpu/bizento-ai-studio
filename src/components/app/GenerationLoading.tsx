import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const TOOL_STEPS: Record<string, string[]> = {
  "Generate Catalog": [
    "Reading your product description...",
    "Detecting product category & type...",
    "Selecting marketplace-ready composition...",
    "Building white-background catalog prompt...",
    "Generating 3 catalog variants (main, angled, lifestyle)...",
    "Applying clean studio lighting & shadows...",
  ],
  "Product Photography": [
    "Analyzing your product for photography...",
    "Selecting premium studio environment...",
    "Building lighting & composition setup...",
    "Generating splash & reflection variants...",
    "Rendering editorial-quality photography...",
    "Applying depth of field & bokeh...",
  ],
  "Ad Creatives": [
    "Understanding your product for ads...",
    "Detecting target platform (Instagram, Facebook, Poster)...",
    "Building scroll-stopping composition...",
    "Adding typography & headline space...",
    "Generating ad creative variants...",
    "Optimizing for marketing impact...",
  ],
  "Cinematic Ads": [
    "Analyzing product for cinematic treatment...",
    "Building 3D CGI environment...",
    "Setting up dramatic volumetric lighting...",
    "Adding particles (smoke, water, glow)...",
    "Rendering blockbuster-quality cinematic frame...",
    "Applying film color grading...",
  ],
};

const DEFAULT_STEPS = [
  "Analyzing your product...",
  "Understanding product details...",
  "Identifying category, colors, materials...",
  "Matching high-performing ecommerce styles...",
  "Creating high-quality scene...",
  "Applying lighting and composition...",
];

interface GenerationLoadingProps {
  currentStep: number;
  progress: number;
  tool?: string;
}

function TypingText({ text, active }: { text: string; active: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (!active) {
      setDisplayed(text);
      setCharIdx(text.length);
      return;
    }
    setDisplayed("");
    setCharIdx(0);
  }, [text, active]);

  useEffect(() => {
    if (!active) return;
    if (charIdx >= text.length) return;
    const timeout = setTimeout(() => {
      setDisplayed((prev) => prev + text[charIdx]);
      setCharIdx((i) => i + 1);
    }, 26);
    return () => clearTimeout(timeout);
  }, [charIdx, text, active]);

  return (
    <span>
      {displayed}
      {active && charIdx < text.length && (
        <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse" />
      )}
    </span>
  );
}

export function GenerationLoading({ currentStep, progress, tool }: GenerationLoadingProps) {
  const steps = (tool && TOOL_STEPS[tool]) ? TOOL_STEPS[tool] : DEFAULT_STEPS;
  const activeLabel = steps[currentStep] ?? "Finalizing your visuals...";

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 animate-fade-in px-4">
      <div className="bg-white/4 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-3">
            <div className="relative h-12 w-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-40" />
              <div className="relative h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
            </div>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            <TypingText text={activeLabel} active={true} />
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {tool
              ? `Running ${tool} pipeline with AI optimization`
              : "Optimizing using high-performing ecommerce design patterns"}
          </p>
        </div>

        <Progress value={progress} className="h-1.5 bg-white/8" />

        <div className="space-y-2.5">
          {steps.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            return (
              <div
                key={step}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isActive
                    ? "text-foreground"
                    : isDone
                    ? "text-primary"
                    : "text-muted-foreground/30"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isDone
                      ? "bg-primary/20"
                      : isActive
                      ? "bg-primary/12"
                      : "bg-white/5"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-3 w-3 text-primary" />
                  ) : isActive ? (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <div className="h-1 w-1 rounded-full bg-current" />
                  )}
                </div>
                <span className="text-xs sm:text-sm font-medium leading-snug">
                  {isActive ? (
                    <TypingText text={step} active={isActive} />
                  ) : (
                    step
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground/50">
          <span>Processing...</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
