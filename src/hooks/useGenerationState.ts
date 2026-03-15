import { useState, useCallback, useRef } from "react";

export type GenerationPhase = "idle" | "uploading" | "generating" | "complete";

export interface GenerationStep {
  label: string;
  duration: number;
}

export const GENERATION_STEPS: GenerationStep[] = [
  { label: "Analyzing Product", duration: 800 },
  { label: "Removing Background", duration: 900 },
  { label: "Generating Scene", duration: 1200 },
  { label: "Rendering Final Image", duration: 700 },
];

export interface GenerationResult {
  id: number;
  prompt: string;
  tool: string;
  style: string;
  model: string;
  timestamp: Date;
  gradient: string;
}

const GRADIENTS = [
  "linear-gradient(135deg, hsl(85 100% 45% / 0.3), hsl(200 80% 40% / 0.2))",
  "linear-gradient(135deg, hsl(280 60% 50% / 0.3), hsl(85 100% 45% / 0.2))",
  "linear-gradient(135deg, hsl(30 80% 50% / 0.3), hsl(350 60% 50% / 0.2))",
];

export function useGenerationState() {
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("luxury");
  const [selectedTool, setSelectedTool] = useState("catalog");
  const timerRef = useRef<number | null>(null);

  const startGeneration = useCallback((inputPrompt: string) => {
    if (!inputPrompt.trim()) return;
    setPrompt(inputPrompt);
    setPhase("uploading");
    setCurrentStep(0);
    setProgress(0);

    let step = 0;
    const totalDuration = GENERATION_STEPS.reduce((s, st) => s + st.duration, 0);
    let elapsed = 0;

    const runStep = () => {
      if (step >= GENERATION_STEPS.length) {
        setPhase("complete");
        setProgress(100);
        setResults(
          GRADIENTS.map((g, i) => ({
            id: Date.now() + i,
            prompt: inputPrompt,
            tool: "Generate Catalog",
            style: "Luxury Studio",
            model: "Nano Bana Pro",
            timestamp: new Date(),
            gradient: g,
          }))
        );
        return;
      }

      setPhase("generating");
      setCurrentStep(step);
      elapsed += GENERATION_STEPS[step].duration;
      setProgress(Math.round((elapsed / totalDuration) * 95));

      timerRef.current = window.setTimeout(() => {
        step++;
        runStep();
      }, GENERATION_STEPS[step].duration);
    };

    // Brief uploading phase
    timerRef.current = window.setTimeout(() => {
      runStep();
    }, 500);
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("idle");
    setCurrentStep(0);
    setProgress(0);
    setResults([]);
    setPrompt("");
  }, []);

  return {
    phase, currentStep, progress, results, prompt,
    selectedStyle, setSelectedStyle,
    selectedTool, setSelectedTool,
    startGeneration, reset,
  };
}
