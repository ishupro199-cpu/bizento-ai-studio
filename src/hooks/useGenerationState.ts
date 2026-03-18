import { useState, useCallback, useRef, useEffect } from "react";
import { useAppContext, ModelId, CREDIT_COSTS } from "@/contexts/AppContext";
import { augmentPrompt } from "@/lib/promptAugmentation";
import { callGenerationApi } from "@/lib/generationApi";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export type GenerationPhase = "idle" | "uploading" | "analyzing" | "generating" | "compositing" | "rendering" | "saving" | "complete";

export interface GenerationStep {
  label: string;
  phase: GenerationPhase;
  duration: number;
}

const FLASH_STEPS: GenerationStep[] = [
  { label: "Analyzing your product...", phase: "uploading", duration: 700 },
  { label: "Understanding product details...", phase: "analyzing", duration: 800 },
  { label: "Identifying category, colors, materials...", phase: "generating", duration: 900 },
  { label: "Matching high-performing ecommerce styles...", phase: "generating", duration: 1100 },
  { label: "Creating high-quality scene...", phase: "compositing", duration: 900 },
  { label: "Applying lighting and composition...", phase: "rendering", duration: 700 },
];

const PRO_STEPS: GenerationStep[] = [
  { label: "Analyzing your product...", phase: "uploading", duration: 800 },
  { label: "Understanding product details...", phase: "analyzing", duration: 1000 },
  { label: "Identifying category, colors, materials...", phase: "generating", duration: 1200 },
  { label: "Matching high-performing ecommerce styles...", phase: "generating", duration: 1500 },
  { label: "Creating high-quality scene...", phase: "compositing", duration: 1200 },
  { label: "Applying lighting and composition...", phase: "rendering", duration: 900 },
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
  uploadedImageUrl: string;
  variantIndex: number;
  imageUrl?: string;
  isReal: boolean;
  generationTime?: number;
}

const GRADIENTS = [
  "linear-gradient(135deg, hsl(85 100% 45% / 0.25), hsl(200 80% 40% / 0.18))",
  "linear-gradient(135deg, hsl(280 60% 50% / 0.25), hsl(85 100% 45% / 0.18))",
  "linear-gradient(135deg, hsl(30 80% 50% / 0.25), hsl(350 60% 50% / 0.18))",
];

const STYLE_GRADIENTS: Record<string, string[]> = {
  luxury: [
    "linear-gradient(135deg, hsl(45 80% 55% / 0.30), hsl(30 60% 40% / 0.20))",
    "linear-gradient(135deg, hsl(40 70% 50% / 0.28), hsl(35 50% 45% / 0.18))",
    "linear-gradient(135deg, hsl(50 90% 60% / 0.25), hsl(25 65% 35% / 0.22))",
  ],
  marble: [
    "linear-gradient(135deg, hsl(0 0% 80% / 0.25), hsl(200 20% 70% / 0.20))",
    "linear-gradient(135deg, hsl(210 15% 75% / 0.22), hsl(0 0% 85% / 0.18))",
    "linear-gradient(135deg, hsl(195 10% 78% / 0.28), hsl(0 0% 72% / 0.22))",
  ],
  floral: [
    "linear-gradient(135deg, hsl(330 60% 70% / 0.30), hsl(85 50% 55% / 0.22))",
    "linear-gradient(135deg, hsl(340 55% 65% / 0.28), hsl(100 45% 60% / 0.20))",
    "linear-gradient(135deg, hsl(310 50% 68% / 0.25), hsl(120 40% 58% / 0.25))",
  ],
  minimal: [
    "linear-gradient(135deg, hsl(0 0% 95% / 0.20), hsl(210 15% 90% / 0.15))",
    "linear-gradient(135deg, hsl(210 10% 92% / 0.18), hsl(0 0% 97% / 0.12))",
    "linear-gradient(135deg, hsl(200 8% 93% / 0.22), hsl(0 0% 94% / 0.16))",
  ],
  neon: [
    "linear-gradient(135deg, hsl(280 80% 60% / 0.30), hsl(185 90% 50% / 0.25))",
    "linear-gradient(135deg, hsl(300 70% 55% / 0.28), hsl(170 80% 45% / 0.28))",
    "linear-gradient(135deg, hsl(260 85% 65% / 0.25), hsl(195 85% 55% / 0.22))",
  ],
  beach: [
    "linear-gradient(135deg, hsl(195 70% 55% / 0.28), hsl(45 80% 65% / 0.22))",
    "linear-gradient(135deg, hsl(200 65% 60% / 0.25), hsl(40 75% 60% / 0.25))",
    "linear-gradient(135deg, hsl(190 75% 50% / 0.30), hsl(50 85% 70% / 0.20))",
  ],
};

async function saveBlobToFirebase(
  blobUrl: string,
  userId: string,
  filename: string
): Promise<string> {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const storageRef = ref(storage, `generated/${userId}/${filename}`);
    await uploadBytes(storageRef, blob, { contentType: blob.type || "image/webp" });
    return await getDownloadURL(storageRef);
  } catch {
    return blobUrl;
  }
}

export function useGenerationState() {
  const { selectedModel, addGeneration, canGenerate } = useAppContext();
  const { user } = useAuth();
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("luxury");
  const [selectedTool, setSelectedTool] = useState("catalog");
  const [productInfo, setProductInfo] = useState<{ description?: string } | null>(null);
  const timerRef = useRef<number | null>(null);
  const generationStartRef = useRef<number>(0);

  const steps = selectedModel === "pro" ? PRO_STEPS : FLASH_STEPS;

  const startGeneration = useCallback(
    async (inputPrompt: string, toolName?: string, style?: string, uploadedImageUrl = "") => {
      if (!inputPrompt.trim() || !canGenerate) return;

      const activeStyle = style || selectedStyle;
      const activeTool = toolName || "Generate Catalog";
      const augmented = augmentPrompt(inputPrompt, activeStyle, activeTool);
      const styleGradients = STYLE_GRADIENTS[activeStyle] ?? GRADIENTS;

      setPrompt(inputPrompt);
      setPhase("uploading");
      setCurrentStep(0);
      setProgress(0);
      generationStartRef.current = Date.now();

      const activeSteps = selectedModel === "pro" ? PRO_STEPS : FLASH_STEPS;
      const totalDuration = activeSteps.reduce((s, st) => s + st.duration, 0);

      const animationPromise = new Promise<void>((resolve) => {
        let step = 0;
        let elapsed = 0;

        const runStep = () => {
          if (step >= activeSteps.length) {
            setProgress(95);
            resolve();
            return;
          }
          setCurrentStep(step);
          elapsed += activeSteps[step].duration;
          setProgress(Math.round((elapsed / totalDuration) * 90));

          timerRef.current = window.setTimeout(() => {
            step++;
            runStep();
          }, activeSteps[step].duration);
        };

        timerRef.current = window.setTimeout(runStep, 300);
      });

      const apiPromise = callGenerationApi({
        imageUrl: uploadedImageUrl || undefined,
        prompt: inputPrompt,
        tool: activeTool,
        style: activeStyle,
        model: selectedModel,
        userId: user?.uid,
      });

      const [_, apiResponse] = await Promise.all([animationPromise, apiPromise]);

      setProgress(98);
      setPhase("saving");

      let finalImageUrls: string[] = [];
      let isReal = false;

      if (apiResponse.success && apiResponse.hasRealImages && apiResponse.images.length > 0) {
        isReal = true;
        if (user?.uid) {
          const ts = Date.now();
          const savedUrls = await Promise.all(
            apiResponse.images.map((url, i) =>
              url.startsWith("http")
                ? saveBlobToFirebase(url, user.uid, `${ts}_v${i}.webp`)
                : Promise.resolve(url)
            )
          );
          finalImageUrls = savedUrls;
        } else {
          finalImageUrls = apiResponse.images;
        }
      }

      if (apiResponse.productInfo) {
        setProductInfo(apiResponse.productInfo);
      }

      const genTime = Math.round((Date.now() - generationStartRef.current) / 1000);

      const newResults: GenerationResult[] = styleGradients.map((g, i) => ({
        id: Date.now() + i,
        prompt: inputPrompt,
        augmentedPrompt: apiResponse.augmentedPrompt ?? augmented,
        tool: activeTool,
        style: activeStyle,
        model: selectedModel === "pro" ? "Nano Bana Pro" : "Nano Bana Flash",
        timestamp: new Date(),
        gradient: g,
        uploadedImageUrl: uploadedImageUrl,
        variantIndex: i,
        imageUrl: finalImageUrls[i] ?? undefined,
        isReal,
        generationTime: genTime,
      }));

      setResults(newResults);
      setProgress(100);
      setPhase("complete");

      addGeneration({
        prompt: inputPrompt,
        augmentedPrompt: apiResponse.augmentedPrompt ?? augmented,
        tool: activeTool,
        style: activeStyle,
        model: selectedModel as ModelId,
        date: new Date(),
        gradient: styleGradients[0],
        uploadedImageUrl,
        variantCount: 3,
        imageUrls: finalImageUrls,
        hasRealImages: isReal,
        generationTime: genTime,
      });
    },
    [selectedModel, canGenerate, addGeneration, selectedStyle, user]
  );

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("idle");
    setCurrentStep(0);
    setProgress(0);
    setResults([]);
    setPrompt("");
    setProductInfo(null);
  }, []);

  return {
    phase,
    currentStep,
    progress,
    results,
    prompt,
    steps,
    selectedStyle,
    setSelectedStyle,
    selectedTool,
    setSelectedTool,
    productInfo,
    startGeneration,
    reset,
    canGenerate,
  };
}
