import { useState, useRef } from "react";
import {
  Send, LayoutGrid, Camera, Clapperboard, Megaphone,
  AlertTriangle, ChevronDown, Check, Plus,
  ChevronLeft, ChevronRight, RotateCcw, Upload, X
} from "lucide-react";
import { GenerationLoading } from "@/components/app/GenerationLoading";
import { GenerationResults } from "@/components/app/GenerationResults";
import { useGenerationState } from "@/hooks/useGenerationState";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/hooks/useImageUpload";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const tools = [
  { id: "catalog", name: "Generate Catalog", icon: LayoutGrid },
  { id: "photo", name: "Product Photography", icon: Camera },
  { id: "cinematic", name: "Cinematic Ads", icon: Clapperboard },
  { id: "creative", name: "Ad Creatives", icon: Megaphone },
];

/* All prompts from the prompt library — cycled in groups of 3 */
const ALL_EXAMPLE_PROMPTS = [
  "Luxury perfume bottle on marble surface with golden hour lighting",
  "Minimal white background catalog shot with soft shadows",
  "Skincare product surrounded by fresh flowers and petals",
  "Sneaker floating on neon gradient background with particles",
  "Watch with water splash effect cinematic advertisement",
  "Organic food packaging on rustic wooden table outdoor setting",
  "Headphones on concrete surface with moody studio lighting",
  "Sunglasses on beach sand with ocean waves in background",
  "Lipstick collection arranged in geometric pattern minimal style",
  "Coffee bag product shot with steam and beans scattered around",
  "Diamond ring on velvet cushion with dramatic spotlight",
  "Smartphone floating with holographic UI elements around it",
];

const DEFAULT_WORKSPACES = ["My Workspace", "Brand Projects", "Client Work"];

export default function WelcomeDashboard() {
  const gen = useGenerationState();
  const { canGenerate, setShowUpgradeModal, user } = useAppContext();
  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedTool, setSelectedTool] = useState("catalog");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolsScrollRef = useRef<HTMLDivElement>(null);
  const { upload, uploading, previewUrl, clearUpload } = useImageUpload();
  const [promptPage, setPromptPage] = useState(0);
  const [plusOpen, setPlusOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState(DEFAULT_WORKSPACES);
  const [activeWorkspace, setActiveWorkspace] = useState(DEFAULT_WORKSPACES[0]);

  const firstName = user.name?.split(" ")[0] || "there";
  const isGenerating = gen.phase === "uploading" || gen.phase === "generating";

  /* Cycle through example prompts 3 at a time */
  const promptsPerPage = 3;
  const totalPages = Math.ceil(ALL_EXAMPLE_PROMPTS.length / promptsPerPage);
  const visiblePrompts = ALL_EXAMPLE_PROMPTS.slice(
    promptPage * promptsPerPage,
    promptPage * promptsPerPage + promptsPerPage
  );
  const handleRefreshPrompts = () => {
    setPromptPage((p) => (p + 1) % totalPages);
  };

  const handleGenerate = () => {
    if (inputPrompt.trim() && canGenerate) {
      gen.startGeneration(inputPrompt);
    }
  };

  /* Ctrl+Enter to send; plain Enter = newline */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await upload(file);
      setPlusOpen(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelectTool = (toolId: string) => {
    setSelectedTool(toolId);
    setPlusOpen(false);
  };

  const handleCreateWorkspace = () => {
    const name = window.prompt("Workspace name:");
    if (name?.trim()) {
      setWorkspaces((prev) => [...prev, name.trim()]);
      setActiveWorkspace(name.trim());
    }
  };

  const scrollTools = (dir: "left" | "right") => {
    toolsScrollRef.current?.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
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
        <div className="mx-4 mt-4 bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-foreground">You've reached your generation limit.</span>
          </div>
          <Button size="sm" className="text-xs h-7 rounded-lg" onClick={() => setShowUpgradeModal(true)}>
            Upgrade
          </Button>
        </div>
      )}

      {/* Main centered content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-auto">
        <div className="w-full max-w-[780px] space-y-7">

          {/* 1. Workspace selector */}
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground hover:bg-white/8 hover:text-foreground transition-colors">
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  {activeWorkspace}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-52 rounded-xl bg-popover border-white/10">
                {workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws}
                    onClick={() => setActiveWorkspace(ws)}
                    className="flex items-center gap-2 cursor-pointer text-sm rounded-lg hover:bg-white/5"
                  >
                    <Check className={`h-3.5 w-3.5 shrink-0 ${activeWorkspace === ws ? "text-primary" : "opacity-0"}`} />
                    {ws}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleCreateWorkspace}
                  className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground rounded-lg hover:bg-white/5"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  Create new workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 2. Greeting */}
          <div className="text-center space-y-1">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Hi {firstName},
            </h1>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-muted-foreground leading-tight">
              What do you want to make?
            </h2>
          </div>

          {/* 3. Prompt input */}
          <div className="space-y-2">
            {/* Attached image preview */}
            {previewUrl && (
              <div className="flex items-center gap-2 px-1">
                <div className="relative">
                  <img src={previewUrl} alt="Upload" className="h-10 w-10 rounded-lg object-cover border border-white/10" />
                  <button
                    onClick={clearUpload}
                    className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-background border border-white/10 rounded-full flex items-center justify-center text-muted-foreground text-xs leading-none hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">Image attached</span>
              </div>
            )}

            {/* Prompt box — border changes on focus, background stays stable */}
            <div className="flex items-end gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 focus-within:border-white/25 transition-[border-color] duration-150">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />

              {/* + button — opens popup with upload + tool options */}
              <Popover open={plusOpen} onOpenChange={setPlusOpen}>
                <PopoverTrigger asChild>
                  <button
                    disabled={uploading}
                    title="Add"
                    className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground mb-0.5"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="top"
                  className="w-56 p-1.5 rounded-xl bg-popover border border-white/10"
                >
                  {/* Upload image option */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-white/5 transition-colors"
                  >
                    <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                    Upload Image
                  </button>

                  <div className="h-px bg-white/8 my-1" />

                  {/* Tool options */}
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelectTool(tool.id)}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        selectedTool === tool.id
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-white/5"
                      }`}
                    >
                      <tool.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {tool.name}
                      {selectedTool === tool.id && (
                        <Check className="h-3.5 w-3.5 ml-auto text-primary" />
                      )}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your product (e.g. perfume bottle on marble...)"
                rows={1}
                className="flex-1 bg-transparent resize-none text-[17px] text-foreground placeholder:text-muted-foreground/50 outline-none leading-relaxed max-h-40 overflow-y-auto py-0.5"
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
              />

              <button
                onClick={handleGenerate}
                disabled={!inputPrompt.trim() || !canGenerate}
                title="Send (Ctrl+Enter)"
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-35 disabled:cursor-not-allowed transition-colors mb-0.5"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground/50 text-right pr-1">
              Press <kbd className="font-mono">Ctrl+Enter</kbd> to send
            </p>
          </div>

          {/* 4. Tools selector — horizontal scroll with arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTools("left")}
              className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg hover:bg-white/8 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div
              ref={toolsScrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-none flex-1"
            >
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors duration-150 border shrink-0 ${
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

            <button
              onClick={() => scrollTools("right")}
              className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg hover:bg-white/8 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* 5. Example prompts */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-base font-medium text-muted-foreground">Try an example prompt</p>
              <button
                onClick={handleRefreshPrompts}
                title="Show more prompts"
                className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-white/8 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {visiblePrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInputPrompt(prompt)}
                  className="px-4 py-2 rounded-xl text-sm text-muted-foreground bg-white/5 border border-white/10 hover:bg-white/10 hover:text-foreground transition-colors"
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
