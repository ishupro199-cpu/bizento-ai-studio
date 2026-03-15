import { GENERATION_STEPS } from "@/hooks/useGenerationState";
import { Check, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GenerationLoadingProps {
  currentStep: number;
  progress: number;
}

export function GenerationLoading({ currentStep, progress }: GenerationLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="glass rounded-2xl p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
          <h2 className="text-lg font-semibold text-foreground">Generating your visuals</h2>
          <p className="text-sm text-muted-foreground">This usually takes a few seconds...</p>
        </div>

        <Progress value={progress} className="h-2 bg-secondary" />

        <div className="space-y-3">
          {GENERATION_STEPS.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isActive ? "text-foreground" : isDone ? "text-primary" : "text-muted-foreground/40"
                }`}
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isDone ? "bg-primary/20" : isActive ? "bg-primary/10" : "bg-secondary/50"
                }`}>
                  {isDone ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : isActive ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </div>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
