import { useState } from "react";
import { Plus, Send, LayoutGrid, Camera, Clapperboard, Megaphone, AlertTriangle } from "lucide-react";
import { GenerationLoading } from "@/components/app/GenerationLoading";
import { GenerationResults } from "@/components/app/GenerationResults";
import { useGenerationState } from "@/hooks/useGenerationState";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useRef } from "react";

const tools = [
  { id: "catalog", name: "Generate Catalog", icon: LayoutGrid },
  { id: "photo", name: "Product Photography", icon: Camera },
  { id: "cinematic", name: "Cinematic Ads", icon: Clapperboard },
  { id: "creative", name: "Ad Creatives", icon: Megaphone },
];

const examplePrompts = [
  "Luxury perfume bottle on marble",
  "Minimal skincare catalog shoot",
  "Sneaker in neon futuristic lighting",
];

export default function WelcomeDashboard() {
  const gen = useGenerationState();
  const { canGenerate, setShowUpgradeModal, user } = useAppContext();
  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedTool, setSelectedTool] = useState("catalog");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, previewUrl, clearUpload } = useImageUpload();

  const firstName = user.name?.split(" ")[0] || "there";
  const isGenerating = gen.phase === "uploading" || gen.phase === "generating";

  const handleGenerate = () => {
    if (inputPrompt.trim() && canGenerate) {
      gen.startGeneration(inputPrompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await upload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (gen.phase === "complete") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <GenerationResults results={gen.results} onRegenerate={gen.reset} />
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return <GenerationLoading currentStep={gen.currentStep} progress={gen.progress} />;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Zero credits banner */}
      {!canGenerate && (
        <div className="mx-4 mt-4 bg-destructive/10 border border-destructive/20 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-foreground">You've reached your generation limit.</span>
          </div>
          <Button size="sm" className="text-xs h-7 rounded-full" onClick={() => setShowUpgradeModal(true)}>
            Upgrade
          </Button>
        </div>
      )}

      {/* Main centered content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[900px] space-y-8">

          {/* 1. Workspace header */}
          <div className="flex justify-center">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground">
              {firstName}'s Workspace
            </div>
          </div>

          {/* 2. Greeting */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Hi {firstName},
            </h1>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-muted-foreground">
              What do you want to make?
            </h2>
          </div>

          {/* 3. Prompt input */}
          <div className="relative">
            {/* Image preview strip */}
            {previewUrl && (
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="relative">
                  <img src={previewUrl} alt="Upload" className="h-10 w-10 rounded-xl object-cover border border-white/10" />
                  <button
                    onClick={clearUpload}
                    className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-background border border-white/10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">Image attached</span>
              </div>
            )}

            <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-[24px] px-4 py-3 focus-within:border-white/20 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground mb-0.5"
                title="Upload image"
              >
                <Plus className="h-5 w-5" />
              </button>

              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your product (e.g. perfume bottle on marble...)"
                rows={1}
                className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground/60 outline-none leading-6 max-h-40 overflow-y-auto py-1"
                style={{ minHeight: "32px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
              />

              <button
                onClick={handleGenerate}
                disabled={!inputPrompt.trim() || !canGenerate}
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-0.5"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 4. Tools selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none justify-center flex-wrap sm:flex-nowrap">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150 border ${
                  selectedTool === tool.id
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8 hover:text-foreground"
                }`}
              >
                <tool.icon className="h-4 w-4 shrink-0" />
                {tool.name}
              </button>
            ))}
          </div>

          {/* 5. Example prompts */}
          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">Try an example prompt</p>
            <div className="flex gap-2 flex-wrap justify-center">
              {examplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInputPrompt(prompt)}
                  className="px-4 py-2 rounded-full text-sm text-muted-foreground bg-white/5 border border-white/10 hover:bg-white/10 hover:text-foreground transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
