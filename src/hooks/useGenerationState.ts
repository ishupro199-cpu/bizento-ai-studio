import { useState, useCallback, useRef } from "react";
import { useAppContext, ModelId, CREDIT_COSTS } from "@/contexts/AppContext";
import { augmentPrompt } from "@/lib/promptAugmentation";

export type GenerationPhase = "idle" | "uploading" | "generating" | "complete";

export interface GenerationStep {
  label: string;
  duration: number;
}

const FLASH_STEPS: GenerationStep[] = [
  { label: "Uploading Image", duration: 400 },
  { label: "Analyzing Product", duration: 400 },
  { label: "Removing Background", duration: 400 },
  { label: "Generating Scene", duration: 500 },
  { label: "Compositing Product", duration: 350 },
  { label: "Rendering Final Image", duration: 400 },
  { label: "Saving Results", duration: 200 },
];

const PRO_STEPS: GenerationStep[] = [
  { label: "Uploading Image", duration: 500 },
  { label: "Analyzing Product", duration: 700 },
  { label: "Removing Background", duration: 700 },
  { label: "Generating Scene", duration: 900 },
  { label: "Compositing Product", duration: 600 },
  { label: "Rendering Final Image", duration: 600 },
  { label: "Saving Results", duration: 300 },
];

export { FLASH_STEPS as GENERATION_STEPS };

export interface GenerationResult {
  id: number;
  prompt: string;
  augmentedPrompt: string;
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
  const { selectedModel, addGeneration, canGenerate } = useAppContext();
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("luxury");
  const [selectedTool, setSelectedTool] = useState("catalog");
  const timerRef = useRef<number | null>(null);

  const steps = selectedModel === "pro" ? PRO_STEPS : FLASH_STEPS;

  const startGeneration = useCallback((inputPrompt: string, toolName?: string, style?: string) => {
    if (!inputPrompt.trim() || !canGenerate) return;
    const activeStyle = style || selectedStyle;
    const activeTool = toolName || "Generate Catalog";
    const augmented = augmentPrompt(inputPrompt, activeStyle, activeTool);

    setPrompt(inputPrompt);
    setPhase("uploading");
    setCurrentStep(0);
    setProgress(0);

    const activeSteps = selectedModel === "pro" ? PRO_STEPS : FLASH_STEPS;
    let step = 0;
    const totalDuration = activeSteps.reduce((s, st) => s + st.duration, 0);
    let elapsed = 0;

    const runStep = () => {
      if (step >= activeSteps.length) {
        setPhase("complete");
        setProgress(100);

        const newResults = GRADIENTS.map((g, i) => ({
          id: Date.now() + i,
          prompt: inputPrompt,
          augmentedPrompt: augmented,
          tool: activeTool,
          style: activeStyle,
          model: selectedModel === "pro" ? "Nano Bana Pro" : "Nano Bana Flash",
          timestamp: new Date(),
          gradient: g,
        }));
        setResults(newResults);

        // Save to Firestore via AppContext
        newResults.forEach((r) => {
          addGeneration({
            prompt: r.prompt,
            tool: r.tool,
            style: r.style,
            model: selectedModel as ModelId,
            date: new Date(),
            gradient: r.gradient,
          });
        });
        return;
      }

      setPhase("generating");
      setCurrentStep(step);
      elapsed += activeSteps[step].duration;
      setProgress(Math.round((elapsed / totalDuration) * 95));

      timerRef.current = window.setTimeout(() => {
        step++;
        runStep();
      }, activeSteps[step].duration);
    };

    timerRef.current = window.setTimeout(() => {
      runStep();
    }, 500);
  }, [selectedModel, canGenerate, addGeneration, selectedStyle]);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("idle");
    setCurrentStep(0);
    setProgress(0);
    setResults([]);
    setPrompt("");
  }, []);

  return {
    phase, currentStep, progress, results, prompt, steps,
    selectedStyle, setSelectedStyle,
    selectedTool, setSelectedTool,
    startGeneration, reset, canGenerate,
  };
}
