import { useState, useRef, useEffect, useCallback } from "react";
import {
  PaperAirplaneIcon as Send,
  Squares2X2Icon as LayoutGrid,
  CameraIcon as Camera,
  FilmIcon as Clapperboard,
  MegaphoneIcon as Megaphone,
  ExclamationTriangleIcon as AlertTriangle,
  CheckIcon as Check,
  PlusIcon as Plus,
  ArrowUpTrayIcon as Upload,
  PhotoIcon as ImageIcon,
  ArrowPathIcon as RotateCcw,
  HandThumbUpIcon as ThumbsUp,
  XMarkIcon as X,
  LinkIcon as Link2,
  AdjustmentsHorizontalIcon as Settings2,
  LockClosedIcon as Lock,
  InformationCircleIcon as Info,
  BuildingOffice2Icon as Building,
  BoltIcon as BoltIcon,
} from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import type { ToolId, QualityId, ModelId } from "@/contexts/AppContext";
import { TOOL_CREDIT_COSTS, QUALITY_ADDON_COSTS, PLANS, calculateCreditCost } from "@/contexts/AppContext";
import { useChatContext } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/hooks/useImageUpload";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { callGenerationApi } from "@/lib/generationApi";
import { toast } from "sonner";
import { augmentPrompt } from "@/lib/promptAugmentation";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { PlatformOptimization } from "@/components/app/PlatformOptimization";

const TOOL_DEFS: Array<{
  id: ToolId;
  name: string;
  icon: React.ElementType;
  desc: string;
  tooltip?: string;
  proOnly?: boolean;
}> = [
  {
    id: "catalog",
    name: "Catalog Generator",
    icon: LayoutGrid,
    desc: "Auto-generate studio-quality product catalog images for marketplaces",
  },
  {
    id: "photo",
    name: "Product Photography",
    icon: Camera,
    desc: "Transform raw product shots into professional lifestyle photography",
  },
  {
    id: "creative",
    name: "Ad Creatives",
    icon: Megaphone,
    desc: "Design scroll-stopping image ads optimised for social & paid channels",
  },
  {
    id: "cinematic",
    name: "Cinematic Ads",
    icon: Clapperboard,
    desc: "Generate high-quality cinematic CGI product ads with lighting and premium environments",
    tooltip: "Create cinematic CGI ads with advanced lighting, shadows, and realistic environments",
    proOnly: true,
  },
];

const THINKING_STEPS = [
  "Analyzing your product...",
  "Understanding product details...",
  "Identifying category, colors, materials...",
  "Matching high-performing ecommerce styles...",
  "Creating high-quality scene...",
  "Applying lighting and composition...",
];

const STYLE_CARDS = [
  { id: "luxury",   label: "Luxury Studio",   sublabel: "Premium brand style",  gradient: "linear-gradient(135deg,#1a1400 0%,#7a5500 100%)" },
  { id: "minimal",  label: "Amazon Clean",    sublabel: "Marketplace ready",     gradient: "linear-gradient(135deg,#f1f3f5 0%,#dee2e6 100%)" },
  { id: "neon",     label: "Neon Futuristic", sublabel: "Bold & viral",          gradient: "linear-gradient(135deg,#0d0221 0%,#2d0041 100%)" },
  { id: "floral",   label: "Floral Lifestyle",sublabel: "Soft & natural",        gradient: "linear-gradient(135deg,#fce4ec 0%,#e8f5e9 100%)" },
  { id: "beach",    label: "Beach Campaign",  sublabel: "Warm lifestyle",        gradient: "linear-gradient(135deg,#0077b6 0%,#f9c74f 100%)" },
];

const GRADIENTS = [
  "linear-gradient(135deg, hsl(85 100% 45% / 0.25), hsl(200 80% 40% / 0.18))",
  "linear-gradient(135deg, hsl(280 60% 50% / 0.25), hsl(85 100% 45% / 0.18))",
  "linear-gradient(135deg, hsl(30 80% 50% / 0.25), hsl(350 60% 50% / 0.18))",
];

const ASPECT_RATIOS = ["1:1", "4:5", "16:9", "9:16", "3:2"];

const QUALITY_OPTIONS: Array<{ id: QualityId; label: string; minPlan: "free" | "starter" | "pro" }> = [
  { id: "720p", label: "720p", minPlan: "free"    },
  { id: "1K",   label: "1K",   minPlan: "free"    },
  { id: "2K",   label: "2K",   minPlan: "starter" },
  { id: "4K",   label: "4K",   minPlan: "pro"     },
];

const ALL_INSPIRATION_PROMPTS = [
  "Luxury perfume bottle on marble surface with soft golden hour light",
  "Minimalist product shot against clean white background for Amazon listing",
  "Skincare cream with botanical ingredients in a serene spa setting",
  "Sneakers displayed on urban concrete with graffiti wall backdrop",
  "Premium watch on dark leather with dramatic single-source lighting",
  "Coffee mug in a cozy morning café scene with warm blurred bokeh",
  "Tech gadget with cool blue neon ambient glow in dark studio",
  "Jewelry piece surrounded by soft pink rose petals and candlelight",
  "Artisan candle with lavender sprigs on rustic weathered wood",
  "Wireless headphones floating against abstract gradient background",
  "Premium handbag on glass shelf with city skyline at dusk behind it",
  "Supplement bottle with fitness equipment and high-energy action scene",
];

const PRO_PROMPTS = [
  "Cinematic CGI ad: luxury fragrance bottle in slow-motion mist with dramatic light rays",
  "High-end jewelry commercial with water droplets in crystal-clear ultra slow motion",
  "Premium whiskey bottle with shattering ice in dramatic dark studio lighting",
];

type ChatPhase = "idle" | "chat-thinking" | "thinking" | "show-styles" | "generating" | "results" | "approved" | "ai-chat";

function detectClientIntent(prompt: string, hasImage: boolean): "generate" | "chat" {
  if (hasImage) return "generate";
  const lower = prompt.toLowerCase();
  const generateKeywords = [
    "generate","create","make","show","produce","photograph","design",
    "photo","image","catalog","ad","cinematic","background","scene",
    "luxury","minimal","neon","studio","lighting","shoot","render",
    "bottle","product","sneaker","watch","bag","perfume","jewelry",
    "phone","food","cosmetic","skincare","supplement","clothing","shoes",
    "white background","dark background","marble","lifestyle",
  ];
  if (generateKeywords.some(k => lower.includes(k))) return "generate";
  if (prompt.trim().split(/\s+/).length > 8) return "generate";
  return "chat";
}

async function fetchAIReply(prompt: string, history?: Array<{role: string; content: string}>): Promise<string> {
  try {
    const res = await fetch("/api/generate/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, history: history || [] }),
    });
    const data = await res.json();
    return data.reply || "I'm here to help! Describe a product and I'll create stunning visuals for you.";
  } catch {
    return "I'm here to help you create professional product images! Tell me about your product.";
  }
}

interface GenSettings {
  aspectRatio: string;
  numOutputs: number;
  quality: QualityId;
}

interface GeneratedImage {
  id: number;
  gradient: string;
  imageUrl?: string;
  isReal: boolean;
}

function TypingText({ text, active }: { text: string; active: boolean }) {
  const [displayed, setDisplayed] = useState(active ? "" : text);
  const [idx, setIdx] = useState(active ? 0 : text.length);
  useEffect(() => {
    if (!active) { setDisplayed(text); setIdx(text.length); return; }
    setDisplayed(""); setIdx(0);
  }, [text, active]);
  useEffect(() => {
    if (!active || idx >= text.length) return;
    const t = setTimeout(() => { setDisplayed(p => p + text[idx]); setIdx(i => i + 1); }, 26);
    return () => clearTimeout(t);
  }, [idx, text, active]);
  return <span>{displayed}{active && idx < text.length && <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse" />}</span>;
}

async function saveBlobToFirebase(blobUrl: string, userId: string, filename: string): Promise<string> {
  try {
    const resp = await fetch(blobUrl);
    const blob = await resp.blob();
    const storageRef = ref(storage, `generated/${userId}/${filename}`);
    await uploadBytes(storageRef, blob, { contentType: blob.type || "image/webp" });
    return await getDownloadURL(storageRef);
  } catch { return blobUrl; }
}

const PLAN_ORDER: Record<string, number> = { free: 0, starter: 1, pro: 2 };

async function detectToolFromPrompt(prompt: string, hasImage: boolean): Promise<ToolId> {
  try {
    const res = await fetch("/api/generate/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `You are a tool classifier. Based on the user's request, choose exactly ONE tool from this list: catalog, photo, creative, cinematic. Reply with ONLY the tool name, nothing else.\n\nUser request: "${prompt}"\nHas product image: ${hasImage}\n\nRules:\n- catalog: product catalog, marketplace, white/clean background, Amazon listing\n- photo: lifestyle photography, scene, environment, outdoor/indoor setting\n- creative: ads, social media, marketing, promotions, banners\n- cinematic: CGI, cinematic, premium video-style, dramatic lighting\n\nYour answer (one word only):`,
        history: [],
      }),
    });
    const data = await res.json();
    const reply = (data.reply || "").toLowerCase().trim().split(/\s/)[0];
    if (reply.startsWith("cinematic")) return "cinematic";
    if (reply.startsWith("photo")) return "photo";
    if (reply.startsWith("creative") || reply.startsWith("ad")) return "creative";
    return "catalog";
  } catch {
    return "catalog";
  }
}

export default function WelcomeDashboard() {
  const { canGenerate, setShowUpgradeModal, user, selectedModel, setSelectedModel, addGeneration } = useAppContext();
  const { user: authUser } = useAuth();
  const { createSession, startNewChat, markMessageSent } = useChatContext();
  const location = useLocation();

  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedTool, setSelectedTool] = useState<ToolId | "default">("default");
  const [autoDetectedTool, setAutoDetectedTool] = useState<ToolId | null>(null);
  const [defaultSuggestion, setDefaultSuggestion] = useState<string | null>(null);
  const [plusOpen, setPlusOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [genSettings, setGenSettings] = useState<GenSettings>({ aspectRatio: "1:1", numOutputs: 3, quality: "1K" });
  const [cinematicTooltip, setCinematicTooltip] = useState(false);

  const productRef = useRef<HTMLInputElement>(null);
  const referenceRef = useRef<HTMLInputElement>(null);
  const { upload: uploadProduct, uploading: uploadingProduct, previewUrl: productPreview, uploadedUrl: productUrl, clearUpload: clearProduct } = useImageUpload();
  const [referencePreview, setReferencePreview] = useState<string | null>(null);

  const [phase, setPhase] = useState<ChatPhase>("idle");
  const [sentPrompt, setSentPrompt] = useState("");
  const [sentProductPreview, setSentProductPreview] = useState<string | null>(null);
  const [sentRefPreview, setSentRefPreview] = useState<string | null>(null);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [thinkingDone, setThinkingDone] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [showApprovedPlatform, setShowApprovedPlatform] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);

  // Inspiration prompts
  const [promptSeed, setPromptSeed] = useState(() => Math.floor(Math.random() * ALL_INSPIRATION_PROMPTS.length));

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);

  const { workspaces, activeWorkspace, activeWorkspaceId, setActiveWorkspaceId, addWorkspace } = useWorkspace();
  const [wsPopoverOpen, setWsPopoverOpen] = useState(false);
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [newWsName, setNewWsName] = useState("");

  const isPro = user.plan === "pro";
  const isStarter = user.plan === "starter";
  const isGenerating = phase === "thinking" || phase === "generating" || phase === "chat-thinking";
  const planLevel = PLAN_ORDER[user.plan] ?? 0;

  const creditToolId: ToolId = selectedTool === "default" ? "catalog" : selectedTool;
  const currentCreditCost = calculateCreditCost(creditToolId, selectedModel as ModelId, genSettings.quality as QualityId);
  const hasEnoughCredits = user.creditsRemaining >= currentCreditCost;
  const canSend = inputPrompt.trim().length > 0 && !isGenerating && (hasEnoughCredits || phase === "ai-chat");

  const currentTool = selectedTool === "default"
    ? { id: "default" as const, name: "Default (Auto)", icon: BoltIcon, desc: "AI picks best tool from your prompt" }
    : TOOL_DEFS.find(t => t.id === selectedTool)!;

  // Workspace name from shared context
  const firstName = user.name?.split(" ")[0] || "there";
  const workspaceName = activeWorkspace?.name || `${firstName}'s Workspace`;

  const handleCreateWorkspace = () => {
    if (!newWsName.trim()) return;
    const ws = addWorkspace(newWsName.trim());
    setActiveWorkspaceId(ws.id);
    setShowCreateWs(false);
    setNewWsName("");
    setWsPopoverOpen(false);
    toast.success(`Workspace "${newWsName.trim()}" created`);
  };

  // Suggested prompts (3 from pool based on seed + pro prompts for pro users)
  const getSuggestedPrompts = useCallback(() => {
    const pool = isPro ? [...ALL_INSPIRATION_PROMPTS, ...PRO_PROMPTS] : ALL_INSPIRATION_PROMPTS;
    const len = pool.length;
    return [
      pool[promptSeed % len],
      pool[(promptSeed + 4) % len],
      pool[(promptSeed + 8) % len],
    ];
  }, [promptSeed, isPro]);

  const suggestedPrompts = getSuggestedPrompts();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [phase, thinkingStep, generatedImages, showApprovedPlatform]);

  useEffect(() => {
    const state = location.state as { prompt?: string } | null;
    if (state?.prompt) { setInputPrompt(state.prompt); window.history.replaceState({}, ""); }
  }, [location.state]);

  const handleReferenceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setReferencePreview(URL.createObjectURL(file));
    if (referenceRef.current) referenceRef.current.value = "";
  };

  const runThinkingAnimation = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      let step = 0;
      const durations = [700, 800, 900, 1100, 900, 700];
      const next = () => {
        if (step >= THINKING_STEPS.length) { setThinkingDone(true); resolve(); return; }
        setThinkingStep(step);
        timerRef.current = window.setTimeout(() => { step++; next(); }, durations[step] ?? 800);
      };
      timerRef.current = window.setTimeout(next, 200);
    });
  }, []);

  const handleSend = async () => {
    if (!inputPrompt.trim() || isGenerating) return;
    if (phase !== "ai-chat" && !hasEnoughCredits) return;

    const prompt = inputPrompt.trim();
    if (phase === "idle") {
      createSession(prompt);
      markMessageSent();
    }

    setSentPrompt(prompt);
    setSentProductPreview(productPreview);
    setSentRefPreview(referencePreview);
    setInputPrompt("");
    setThinkingStep(0);
    setThinkingDone(false);
    setGeneratedImages([]);
    setSelectedStyle(null);
    setShowApprovedPlatform(false);
    setAiReply(null);
    setDefaultSuggestion(null);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const hasImage = !!productPreview;
    const intent = detectClientIntent(prompt, hasImage);

    if (intent === "chat" && selectedTool !== "default") {
      setPhase("chat-thinking");
      const reply = await fetchAIReply(prompt);
      setAiReply(reply);
      setPhase("ai-chat");
    } else if (selectedTool === "default") {
      setPhase("thinking");
      const [, detectedTool] = await Promise.all([
        runThinkingAnimation(),
        detectToolFromPrompt(prompt, hasImage),
      ]);
      const detectedName = TOOL_DEFS.find(t => t.id === detectedTool)?.name || "Catalog Generator";
      setAutoDetectedTool(detectedTool);
      setDefaultSuggestion(`Using **${detectedName}** — generating your images now.`);
      await startGeneration("luxury", prompt, detectedTool);
    } else if (hasImage) {
      setPhase("thinking");
      await runThinkingAnimation();
      await startGeneration("luxury", prompt);
    } else {
      setPhase("thinking");
      await runThinkingAnimation();
      setPhase("show-styles");
    }
  };

  const startGeneration = useCallback(async (style: string, prompt: string, toolOverride?: ToolId) => {
    setPhase("generating");
    setThinkingStep(0);
    setThinkingDone(false);

    const effectiveToolId: ToolId = toolOverride || (selectedTool !== "default" ? selectedTool as ToolId : "catalog");
    const toolDef = TOOL_DEFS.find(t => t.id === effectiveToolId);
    const toolName = toolDef?.name || "Catalog Generator";
    const augmented = augmentPrompt(prompt, style, toolName);

    const animPromise = runThinkingAnimation();
    const apiPromise = callGenerationApi({
      imageUrl: productUrl || undefined,
      prompt,
      tool: toolName,
      style,
      model: selectedModel,
      quality: genSettings.quality,
      aspectRatio: genSettings.aspectRatio,
      numOutputs: genSettings.numOutputs,
      userId: authUser?.uid,
    });

    const [, apiResp] = await Promise.all([animPromise, apiPromise]);

    if (!apiResp.success && apiResp.code) {
      setPhase("idle");
      if (apiResp.code === "INSUFFICIENT_CREDITS") {
        toast.error("Not enough credits. Upgrade your plan to continue.");
        setShowUpgradeModal(true);
      } else if (apiResp.code === "USER_SUSPENDED") {
        toast.error("Your account has been suspended. Contact support.");
      } else if (apiResp.code === "PLAN_REQUIRED") {
        toast.error(`This feature requires the ${apiResp.requiredPlan?.toUpperCase()} plan.`);
        setShowUpgradeModal(true);
      } else {
        toast.error(apiResp.error || "Generation failed. Please try again.");
      }
      return;
    }

    let finalUrls: string[] = [];
    let isReal = false;

    if (apiResp.success && apiResp.hasRealImages && apiResp.images.length > 0) {
      isReal = true;
      if (authUser?.uid) {
        const ts = Date.now();
        finalUrls = await Promise.all(
          apiResp.images.map((url, i) =>
            url.startsWith("http")
              ? saveBlobToFirebase(url, authUser.uid, `${ts}_v${i}.webp`)
              : Promise.resolve(url)
          )
        );
      } else {
        finalUrls = apiResp.images;
      }
    }

    const numImgs = genSettings.numOutputs || 3;
    const imgs: GeneratedImage[] = GRADIENTS.slice(0, numImgs).map((g, i) => ({
      id: Date.now() + i,
      gradient: g,
      imageUrl: finalUrls[i],
      isReal,
    }));

    setGeneratedImages(imgs);
    setPhase("results");

    const serverHandledCredits = typeof apiResp.creditsRemaining === "number";
    addGeneration({
      prompt,
      augmentedPrompt: apiResp.augmentedPrompt ?? augmented,
      tool: toolName,
      style,
      model: selectedModel,
      quality: genSettings.quality,
      date: new Date(),
      gradient: GRADIENTS[0],
      uploadedImageUrl: productUrl || "",
      variantCount: numImgs,
      imageUrls: finalUrls,
      hasRealImages: isReal,
      catalogAttributes: apiResp.catalogAttributes as any,
    } as any, serverHandledCredits);
  }, [selectedTool, productUrl, selectedModel, authUser, addGeneration, runThinkingAnimation, genSettings]);

  const handleStyleSelect = async (styleId: string) => {
    setSelectedStyle(styleId);
    await startGeneration(styleId, sentPrompt);
  };

  const handleStyleSkip = async () => {
    setSelectedStyle("luxury");
    await startGeneration("luxury", sentPrompt);
  };

  const handleApprove = () => { setPhase("approved"); setShowApprovedPlatform(true); };
  const handleRegenerate = () => { const style = selectedStyle || "luxury"; startGeneration(style, sentPrompt); };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("idle");
    setSentPrompt("");
    setSentProductPreview(null);
    setSentRefPreview(null);
    setGeneratedImages([]);
    setSelectedStyle(null);
    setShowApprovedPlatform(false);
    setThinkingStep(0);
    setThinkingDone(false);
    setAiReply(null);
    setDefaultSuggestion(null);
    setAutoDetectedTool(null);
    clearProduct();
    setReferencePreview(null);
    startNewChat();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSend(); }
  };

  const handleToolSelect = (toolId: ToolId | "default") => {
    if (toolId !== "default") {
      const toolDef = TOOL_DEFS.find(t => t.id === toolId);
      if (toolDef?.proOnly && !isPro) {
        setShowUpgradeModal(true);
        return;
      }
    }
    setSelectedTool(toolId);
    setSettingsOpen(false);
  };

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <input type="file" ref={productRef} className="hidden" accept="image/*"
        onChange={async (e) => {
          const f = e.target.files?.[0]; if (f) { await uploadProduct(f); setPlusOpen(false); }
          if (productRef.current) productRef.current.value = "";
        }} />
      <input type="file" ref={referenceRef} className="hidden" accept="image/*" onChange={handleReferenceSelect} />

      {/* ─── CHAT AREA ─── */}
      <div className={`flex-1 overflow-y-auto sidebar-scroll ${phase === "idle" ? "" : "px-3 sm:px-6 py-6 space-y-5"}`}
        style={{ paddingBottom: phase === "idle" ? 0 : phase === "show-styles" ? "220px" : "100px" }}>

        {/* IDLE STATE — fully inline, no sticky bar */}
        {phase === "idle" && (
          <div className="flex flex-col items-center justify-center min-h-full py-8 px-4 sm:px-6 animate-fade-in">
            <div className="w-full max-w-xl space-y-4">

              {/* Workspace chip + greeting */}
              <div className="text-center space-y-2 mb-5">
                <Popover open={wsPopoverOpen} onOpenChange={(o) => { setWsPopoverOpen(o); if (!o) { setShowCreateWs(false); setNewWsName(""); } }}>
                  <PopoverTrigger asChild>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition-all hover:opacity-80"
                      style={{ background: "rgba(137,233,0,0.07)", border: "1px solid rgba(137,233,0,0.18)", color: "rgba(137,233,0,0.8)" }}>
                      <Building className="h-3 w-3" />
                      <span className="text-[11px] font-medium">{workspaceName}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="center" side="bottom" className="w-56 p-1.5 rounded-xl bg-popover border border-white/10">
                    <div className="px-3 pt-2 pb-1">
                      <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Workspaces</p>
                    </div>
                    {workspaces.map(ws => (
                      <button key={ws.id} onClick={() => { setActiveWorkspaceId(ws.id); setWsPopoverOpen(false); }}
                        className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors ${ws.id === activeWorkspaceId ? "bg-primary/10" : "hover:bg-white/5"}`}>
                        <Building className={`h-3.5 w-3.5 shrink-0 ${ws.id === activeWorkspaceId ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`flex-1 text-left text-sm font-medium truncate ${ws.id === activeWorkspaceId ? "text-primary" : "text-foreground"}`}>{ws.name}</span>
                        {ws.id === activeWorkspaceId && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                      </button>
                    ))}
                    <div className="h-px bg-white/8 my-1.5 mx-2" />
                    {!showCreateWs ? (
                      <button onClick={() => { if (isPro) setShowCreateWs(true); else { setWsPopoverOpen(false); setShowUpgradeModal(true); } }}
                        className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-white/5">
                        <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="flex-1 text-left text-sm text-muted-foreground">Create New Workspace</span>
                        {!isPro && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.15)", color: "rgba(245,158,11,0.9)" }}>PRO</span>}
                      </button>
                    ) : (
                      <div className="px-2 pb-1 space-y-1.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                        <input autoFocus value={newWsName} onChange={e => setNewWsName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleCreateWorkspace(); if (e.key === "Escape") setShowCreateWs(false); }}
                          placeholder="Workspace name..." className="w-full bg-white/6 rounded-lg px-2.5 py-1.5 text-[12px] text-foreground outline-none placeholder:text-muted-foreground/40"
                          style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                        <div className="flex gap-1.5">
                          <button onClick={() => setShowCreateWs(false)} className="flex-1 py-1 rounded-lg text-[11px] text-muted-foreground bg-white/5 hover:bg-white/8 transition-colors">Cancel</button>
                          <button onClick={handleCreateWorkspace} disabled={!newWsName.trim()} className="flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-40"
                            style={{ background: "rgba(137,233,0,0.15)", color: "#89E900", border: "1px solid rgba(137,233,0,0.25)" }}>Create</button>
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                <p className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "-0.01em" }}>
                  Hi {firstName}, what do you want to create?
                </p>
                {!hasEnoughCredits && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5 flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <span className="text-sm text-foreground">You've reached your generation limit.</span>
                    <Button size="sm" className="text-xs h-7 rounded-lg ml-2" onClick={() => setShowUpgradeModal(true)}>Upgrade</Button>
                  </div>
                )}
              </div>

              {/* Attached image previews */}
              {(productPreview || referencePreview) && (
                <div className="flex gap-2 mb-1">
                  {productPreview && (
                    <div className="relative">
                      <img src={productPreview} alt="Product" className="h-14 w-14 rounded-xl object-cover border border-white/15" />
                      <div className="absolute -top-1.5 left-0 right-0 flex justify-center">
                        <span className="text-[8px] bg-white/15 rounded-full px-1.5 py-0.5 text-white/70 backdrop-blur-sm">Product</span>
                      </div>
                      <button onClick={clearProduct}
                        className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-background border border-white/20 rounded-full flex items-center justify-center text-muted-foreground text-[10px] leading-none hover:text-foreground">
                        ×
                      </button>
                    </div>
                  )}
                  {referencePreview && (
                    <div className="relative">
                      <img src={referencePreview} alt="Reference" className="h-14 w-14 rounded-xl object-cover border border-primary/30" />
                      <div className="absolute -top-1.5 left-0 right-0 flex justify-center">
                        <span className="text-[8px] bg-primary/40 rounded-full px-1.5 py-0.5 text-white backdrop-blur-sm">Ref</span>
                      </div>
                      <button onClick={() => setReferencePreview(null)}
                        className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-background border border-white/20 rounded-full flex items-center justify-center text-muted-foreground text-[10px] leading-none hover:text-foreground">
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Inline Prompt Box */}
              <div className="flex items-end gap-2 rounded-2xl px-3 py-2.5 focus-within:border-white/22 transition-[border-color] duration-150"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}>

                {/* + button */}
                <Popover open={plusOpen} onOpenChange={setPlusOpen}>
                  <PopoverTrigger asChild>
                    <button disabled={uploadingProduct || !!productPreview} title={productPreview ? "Remove image to add a new one" : "Add / Select Tool"}
                      className="h-7 w-7 shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground mb-0.5 disabled:opacity-40">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" side="top" className="w-52 p-1.5 rounded-xl bg-popover border border-white/10">
                    <div className="px-3 pt-2 pb-1">
                      <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Attach Image</p>
                    </div>
                    <button onClick={() => { productRef.current?.click(); setPlusOpen(false); }}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-white/5 transition-colors">
                      <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="text-left">
                        <p className="text-sm">Product Image</p>
                        <p className="text-[10px] text-muted-foreground/60">Main product to transform</p>
                      </div>
                    </button>
                    <button onClick={() => { referenceRef.current?.click(); setPlusOpen(false); }}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-white/5 transition-colors">
                      <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="text-left">
                        <p className="text-sm">Reference Image</p>
                        <p className="text-[10px] text-muted-foreground/60">Style or inspiration</p>
                      </div>
                    </button>
                  </PopoverContent>
                </Popover>

                {/* Settings button */}
                <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <PopoverTrigger asChild>
                    <button title="AI Tool & Generation Settings"
                      className="h-7 w-7 shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground mb-0.5">
                      <Settings2 className="h-3.5 w-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" side="top" className="w-80 p-3 rounded-2xl bg-popover border border-white/10 space-y-3 max-h-[80vh] overflow-y-auto sidebar-scroll">
                    {/* Tool Selection */}
                    <div className="space-y-2">
                      <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">AI Tool</p>
                      <div className="space-y-1">
                        <button onClick={() => handleToolSelect("default")}
                          className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 border transition-all ${selectedTool === "default" ? "bg-primary/10 border-primary/30" : "bg-white/3 border-white/8 hover:bg-white/6"}`}>
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${selectedTool === "default" ? "bg-primary/20" : "bg-white/8"}`}>
                            <BoltIcon className={`h-3.5 w-3.5 ${selectedTool === "default" ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className={`text-xs font-semibold ${selectedTool === "default" ? "text-primary" : "text-foreground"}`}>Default (Auto)</p>
                            <p className="text-[10px] text-muted-foreground/50">AI picks best tool from prompt</p>
                          </div>
                          {selectedTool === "default" && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                        </button>
                        {TOOL_DEFS.map(tool => {
                          const Icon = tool.icon;
                          const isActive = selectedTool === tool.id;
                          const isLocked = tool.proOnly && !isPro;
                          return (
                            <button key={tool.id} onClick={() => !isLocked && handleToolSelect(tool.id)}
                              className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 border transition-all ${isActive ? "bg-primary/10 border-primary/30" : isLocked ? "bg-white/2 border-white/5 opacity-40 cursor-not-allowed" : "bg-white/3 border-white/8 hover:bg-white/6"}`}>
                              <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${isActive ? "bg-primary/20" : "bg-white/8"}`}>
                                <Icon className={`h-3 w-3 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                              </div>
                              <p className={`flex-1 text-left text-xs font-medium ${isActive ? "text-primary" : "text-foreground"}`}>{tool.name}</p>
                              {isLocked && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.15)", color: "rgba(245,158,11,0.9)" }}>PRO</span>}
                              {isActive && !isLocked && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="h-px bg-white/8" />
                    {/* Aspect Ratio */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Aspect Ratio</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ASPECT_RATIOS.map(ar => (
                          <button key={ar} onClick={() => setGenSettings(s => ({ ...s, aspectRatio: ar }))}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${genSettings.aspectRatio === ar ? "bg-primary/10 text-primary border-primary/30" : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8"}`}>{ar}</button>
                        ))}
                      </div>
                    </div>
                    {/* Outputs */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Outputs</p>
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map(n => (
                          <button key={n} onClick={() => setGenSettings(s => ({ ...s, numOutputs: n }))}
                            className={`flex-1 py-1.5 rounded-lg text-sm font-bold border transition-all duration-150 ${genSettings.numOutputs === n ? "bg-primary/10 text-primary border-primary/30" : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8"}`}>{n}</button>
                        ))}
                      </div>
                    </div>
                    {/* Quality */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Image Quality</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {QUALITY_OPTIONS.map(q => {
                          const locked = PLAN_ORDER[q.minPlan] > planLevel;
                          const addonCost = QUALITY_ADDON_COSTS[q.id];
                          return (
                            <button key={q.id} disabled={locked} onClick={() => !locked && setGenSettings(s => ({ ...s, quality: q.id }))}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border transition-all duration-150 ${locked ? "bg-white/3 text-muted-foreground/30 border-white/5 cursor-not-allowed" : genSettings.quality === q.id ? "bg-primary/10 text-primary border-primary/30" : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8"}`}>
                              <span className="font-semibold">{q.label}</span>
                              {locked ? <span className="flex items-center gap-0.5 text-[9px] text-amber-500/70"><Lock className="h-2.5 w-2.5" /> {q.minPlan === "pro" ? "Pro" : "Starter"}</span>
                                : addonCost > 0 ? <span className="text-[9px] text-primary/70">+{addonCost} cr</span>
                                : <span className="text-[9px] opacity-40">free</span>}
                            </button>
                          );
                        })}
                      </div>
                      <div className="pt-2 border-t border-white/8 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Estimated cost</span>
                        <span className="text-[10px] font-semibold" style={{ color: "#89E900" }}>{currentCreditCost} credits</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Textarea */}
                <textarea ref={textareaRef} value={inputPrompt} onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={handleKeyDown} placeholder={`${currentTool.name} — describe your product...`} rows={1}
                  className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground/35 outline-none leading-relaxed max-h-32 overflow-y-auto scrollbar-none py-1"
                  onInput={(e) => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; }} />

                {/* Credit pill inside prompt box */}
                <div className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-semibold transition-all duration-200 mb-0.5 ${hasEnoughCredits ? "border-primary/25 bg-primary/8 text-primary" : "border-destructive/30 bg-destructive/8 text-destructive"}`}>
                  <BoltIcon className="h-2.5 w-2.5" />
                  <span>{currentCreditCost}</span>
                </div>

                {/* Send button */}
                <button onClick={handleSend} disabled={!canSend} title="Send (Ctrl+Enter)"
                  className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 mb-0.5">
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Active tool indicator */}
              <div className="flex items-center gap-2 px-1">
                {(() => { const Icon = currentTool.icon; return <Icon className="h-3 w-3 text-muted-foreground/40" />; })()}
                <span className="text-[10px] text-muted-foreground/40">{currentTool.name}</span>
                <span className="text-[10px] text-muted-foreground/25">·</span>
                <span className="text-[10px] text-muted-foreground/40 capitalize">{selectedModel} model</span>
              </div>


              {/* Try this prompt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-muted-foreground/55 uppercase tracking-wider">Try this prompt</span>
                  <button onClick={() => setPromptSeed(s => (s + 3) % ALL_INSPIRATION_PROMPTS.length)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground/45 hover:text-muted-foreground transition-colors">
                    <RotateCcw className="h-3 w-3" />
                    Refresh
                  </button>
                </div>
                <div className="space-y-1.5">
                  {suggestedPrompts.map((prompt, i) => (
                    <button key={i} onClick={() => setInputPrompt(prompt)}
                      className="w-full text-left px-3 py-2 rounded-xl bg-white/3 hover:bg-white/5 transition-all duration-150">
                      <p className="text-[11px] text-foreground/65 leading-relaxed">{prompt}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Sent message bubble */}
        {sentPrompt && (
          <div className="flex justify-end animate-fade-in">
            <div className="max-w-[75%] space-y-2">
              {(sentProductPreview || sentRefPreview) && (
                <div className="flex justify-end gap-2">
                  {sentProductPreview && (
                    <div className="relative">
                      <img src={sentProductPreview} alt="Product" className="h-20 w-20 rounded-xl object-cover border border-white/15 shadow-lg" />
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-black/70 text-white rounded-full px-1.5 py-0.5 whitespace-nowrap">Product</span>
                    </div>
                  )}
                  {sentRefPreview && (
                    <div className="relative">
                      <img src={sentRefPreview} alt="Reference" className="h-20 w-20 rounded-xl object-cover border border-primary/30 shadow-lg" />
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-primary/80 text-black rounded-full px-1.5 py-0.5 whitespace-nowrap">Reference</span>
                    </div>
                  )}
                </div>
              )}
              <div className="bg-primary/12 border border-primary/20 rounded-2xl rounded-tr-sm px-4 py-3">
                <p className="text-sm text-foreground leading-relaxed">{sentPrompt}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chat thinking (simple typing indicator) */}
        {phase === "chat-thinking" && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[80%] space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <BoltIcon className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Pixalera AI</span>
              </div>
              <div className="bg-white/4 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thinking / Generating steps */}
        {(phase === "thinking" || phase === "ai-chat" || phase === "generating" || phase === "show-styles" || phase === "results" || phase === "approved") && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[80%] space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <BoltIcon className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Pixalera AI</span>
              </div>
              <div className="bg-white/4 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3.5 space-y-2">
                {THINKING_STEPS.map((step, i) => {
                  const done = i < thinkingStep || thinkingDone;
                  const active = i === thinkingStep && !thinkingDone && (phase === "thinking" || phase === "generating");
                  return (
                    <div key={step} className={`flex items-center gap-2.5 transition-all duration-300 ${
                      done ? "text-primary" : active ? "text-foreground" : "text-muted-foreground/30"
                    }`}>
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                        done ? "bg-primary/20" : active ? "bg-primary/10" : "bg-white/5"
                      }`}>
                        {done ? <Check className="h-2.5 w-2.5 text-primary" />
                          : active ? <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          : <div className="h-1 w-1 rounded-full bg-current" />}
                      </div>
                      <span className="text-xs leading-snug">
                        {active ? <TypingText text={step} active={true} /> : step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* AI Chat Reply */}
        {phase === "ai-chat" && aiReply && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[80%] space-y-3">
              <div className="bg-white/4 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3.5">
                <p className="text-sm text-foreground leading-relaxed">{aiReply}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setInputPrompt("Generate a product photo for my "); setPhase("idle"); handleReset(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] border border-white/10 bg-white/4 text-muted-foreground hover:bg-white/8 hover:text-foreground transition-colors">
                  <BoltIcon className="h-3 w-3" /> Generate Image
                </button>
                <button onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] border border-white/10 bg-white/4 text-muted-foreground hover:bg-white/8 hover:text-foreground transition-colors">
                  <RotateCcw className="h-3 w-3" /> Start Over
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Default tool AI suggestion */}
        {defaultSuggestion && (phase === "generating" || phase === "results" || phase === "approved") && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[80%] space-y-1.5">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <BoltIcon className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Pixalera AI</span>
              </div>
              <div className="bg-white/4 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5">
                <p className="text-sm text-foreground leading-relaxed">
                  {defaultSuggestion.replace(/\*\*(.*?)\*\*/g, "$1")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generation animation boxes */}
        {phase === "generating" && (
          <div className="flex justify-end animate-fade-in">
            <div className="max-w-[85%] space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: genSettings.numOutputs }).map((_, idx) => (
                  <div key={idx} className="aspect-square rounded-xl border border-white/10 relative overflow-hidden"
                    style={{ background: "rgba(137,233,0,0.03)" }}>
                    <div className="absolute inset-0 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]"
                        style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)" }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full border-2 border-primary/15 border-t-primary/50 animate-spin" />
                    </div>
                    <span className="absolute top-1.5 left-1.5 text-[8px] bg-black/50 rounded-full px-1.5 py-0.5 text-white/35">
                      {["A", "B", "C"][idx]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/45 text-right animate-pulse">Generating your images...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {(phase === "results" || phase === "approved") && generatedImages.length > 0 && (
          <div className="flex justify-end animate-fade-in">
            <div className="max-w-[85%] space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {generatedImages.map((img, idx) => (
                  <div key={img.id} className="aspect-square rounded-xl overflow-hidden border border-white/10 relative"
                    style={{ background: img.gradient }}>
                    {img.isReal && img.imageUrl ? (
                      <img src={img.imageUrl} alt={`Variant ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-6 w-6 text-white/20" />
                      </div>
                    )}
                    <span className="absolute top-1.5 left-1.5 text-[8px] bg-black/50 rounded-full px-1.5 py-0.5 text-white/70">
                      {["A", "B", "C"][idx]}
                    </span>
                    {!isPro && !isStarter && img.isReal && img.imageUrl && (
                      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                        <BoltIcon className="h-2.5 w-2.5 text-primary" />
                        <span className="text-[7px] text-primary font-bold tracking-wide">PIXALERA</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {!generatedImages[0]?.isReal && (
                <p className="text-[10px] text-amber-400/70 text-right">Preview mode — add REPLICATE_API_TOKEN for real images</p>
              )}
              {phase === "results" && (
                <div className="flex gap-2 justify-end">
                  <button onClick={handleRegenerate}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm border border-white/15 bg-white/5 text-muted-foreground hover:bg-white/8 hover:text-foreground transition-colors">
                    <RotateCcw className="h-3.5 w-3.5" /> Regenerate
                  </button>
                  <button onClick={handleApprove}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-black hover:bg-primary/90 transition-colors">
                    <ThumbsUp className="h-3.5 w-3.5" /> Approve
                  </button>
                </div>
              )}
              {phase === "approved" && (
                <div className="flex items-center gap-2 justify-end">
                  <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
                    <Check className="h-3 w-3" /> Approved
                  </div>
                  <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground underline transition-colors">
                    New Generate
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Platform optimization */}
        {showApprovedPlatform && phase === "approved" && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[90%] w-full space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <BoltIcon className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Pixalera AI</span>
              </div>
              <div className="bg-white/4 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-4">
                <PlatformOptimization
                  prompt={sentPrompt}
                  isPro={isPro || isStarter}
                  onClose={() => setShowApprovedPlatform(false)}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ─── STYLE CARDS ─── */}
      {phase === "show-styles" && (
        <div className="px-3 sm:px-6 pb-2 animate-fade-in">
          <div className="mb-2 flex items-center gap-2">
            <BoltIcon className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-medium text-muted-foreground">Choose a style preset, or skip to auto-select</p>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 sidebar-scroll">
            {STYLE_CARDS.map((style) => (
              <button key={style.id} onClick={() => handleStyleSelect(style.id)}
                className={`shrink-0 flex flex-col rounded-xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all duration-200 ${
                  selectedStyle === style.id ? "border-primary/60 ring-1 ring-primary/30" : ""
                }`} style={{ width: 100 }}>
                <div className="aspect-square w-full" style={{ background: style.gradient }} />
                <div className="px-2 py-1.5 bg-white/4">
                  <p className="text-[10px] font-semibold text-foreground leading-snug truncate">{style.label}</p>
                  <p className="text-[9px] text-muted-foreground/60 truncate">{style.sublabel}</p>
                </div>
              </button>
            ))}
            <button onClick={handleStyleSkip}
              className="shrink-0 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 hover:border-white/30 transition-colors bg-white/2"
              style={{ width: 100, minHeight: 120 }}>
              <RotateCcw className="h-4 w-4 text-muted-foreground mb-1.5" />
              <p className="text-[10px] text-muted-foreground leading-snug text-center px-2">Auto-select best</p>
            </button>
          </div>
        </div>
      )}

      {/* ─── PROMPT BAR (non-idle only) ─── */}
      {phase !== "idle" && <div className="shrink-0 px-3 sm:px-6 pb-4 pt-2 border-t border-white/8 bg-background/80 backdrop-blur-sm">

        {/* Attached image previews */}
        {(productPreview || referencePreview) && (
          <div className="flex gap-2 mb-2">
            {productPreview && (
              <div className="relative">
                <img src={productPreview} alt="Product" className="h-14 w-14 rounded-xl object-cover border border-white/15" />
                <div className="absolute -top-1.5 left-0 right-0 flex justify-center">
                  <span className="text-[8px] bg-white/15 rounded-full px-1.5 py-0.5 text-white/70 backdrop-blur-sm">Product</span>
                </div>
                <button onClick={clearProduct}
                  className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-background border border-white/20 rounded-full flex items-center justify-center text-muted-foreground text-[10px] leading-none hover:text-foreground">
                  ×
                </button>
              </div>
            )}
            {referencePreview && (
              <div className="relative">
                <img src={referencePreview} alt="Reference" className="h-14 w-14 rounded-xl object-cover border border-primary/30" />
                <div className="absolute -top-1.5 left-0 right-0 flex justify-center">
                  <span className="text-[8px] bg-primary/40 rounded-full px-1.5 py-0.5 text-white backdrop-blur-sm">Ref</span>
                </div>
                <button onClick={() => setReferencePreview(null)}
                  className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-background border border-white/20 rounded-full flex items-center justify-center text-muted-foreground text-[10px] leading-none hover:text-foreground">
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2 bg-white/5 border border-white/12 rounded-2xl px-3 py-2.5 focus-within:border-white/22 transition-[border-color] duration-150">

          {/* + button — image upload only */}
          <Popover open={plusOpen} onOpenChange={setPlusOpen}>
            <PopoverTrigger asChild>
              <button disabled={isGenerating || uploadingProduct || !!productPreview} title={productPreview ? "Remove image to add a new one" : "Attach Image"}
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground mb-0.5 disabled:opacity-40">
                <Plus className="h-4.5 w-4.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" side="top" className="w-52 p-1.5 rounded-xl bg-popover border border-white/10">
              <div className="px-3 pt-2 pb-1">
                <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Attach Image</p>
              </div>
              <button onClick={() => { productRef.current?.click(); setPlusOpen(false); }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-white/5 transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="text-left">
                  <p className="text-sm">Product Image</p>
                  <p className="text-[10px] text-muted-foreground/60">Main product to transform</p>
                </div>
              </button>
              <button onClick={() => { referenceRef.current?.click(); setPlusOpen(false); }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-white/5 transition-colors">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="text-left">
                  <p className="text-sm">Reference Image</p>
                  <p className="text-[10px] text-muted-foreground/60">Style or inspiration</p>
                </div>
              </button>
            </PopoverContent>
          </Popover>

          {/* Settings button — AI Tool + generation settings */}
          <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
            <PopoverTrigger asChild>
              <button title="AI Tool & Settings" disabled={isGenerating}
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground mb-0.5 disabled:opacity-40">
                <Settings2 className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" side="top" className="w-80 p-3 rounded-2xl bg-popover border border-white/10 space-y-3 max-h-[80vh] overflow-y-auto sidebar-scroll">
              {/* Tool Selection */}
              <div className="space-y-2">
                <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">AI Tool</p>
                <div className="space-y-1">
                  <button onClick={() => handleToolSelect("default")}
                    className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 border transition-all ${selectedTool === "default" ? "bg-primary/10 border-primary/30" : "bg-white/3 border-white/8 hover:bg-white/6"}`}>
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${selectedTool === "default" ? "bg-primary/20" : "bg-white/8"}`}>
                      <BoltIcon className={`h-3.5 w-3.5 ${selectedTool === "default" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-xs font-semibold ${selectedTool === "default" ? "text-primary" : "text-foreground"}`}>Default (Auto)</p>
                      <p className="text-[10px] text-muted-foreground/50">AI picks best tool from prompt</p>
                    </div>
                    {selectedTool === "default" && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </button>
                  {TOOL_DEFS.map(tool => {
                    const Icon = tool.icon;
                    const isActive = selectedTool === tool.id;
                    const isLocked = tool.proOnly && !isPro;
                    return (
                      <button key={tool.id} onClick={() => !isLocked && handleToolSelect(tool.id)}
                        className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 border transition-all ${isActive ? "bg-primary/10 border-primary/30" : isLocked ? "bg-white/2 border-white/5 opacity-40 cursor-not-allowed" : "bg-white/3 border-white/8 hover:bg-white/6"}`}>
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${isActive ? "bg-primary/20" : "bg-white/8"}`}>
                          <Icon className={`h-3 w-3 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <p className={`flex-1 text-left text-xs font-medium ${isActive ? "text-primary" : "text-foreground"}`}>{tool.name}</p>
                        {isLocked && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.15)", color: "rgba(245,158,11,0.9)" }}>PRO</span>}
                        {isActive && !isLocked && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="h-px bg-white/8" />
              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Aspect Ratio</p>
                <div className="flex flex-wrap gap-1.5">
                  {ASPECT_RATIOS.map(ar => (
                    <button key={ar} onClick={() => setGenSettings(s => ({ ...s, aspectRatio: ar }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${genSettings.aspectRatio === ar ? "bg-primary/10 text-primary border-primary/30" : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8"}`}>{ar}</button>
                  ))}
                </div>
              </div>
              {/* Outputs */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Outputs</p>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map(n => (
                    <button key={n} onClick={() => setGenSettings(s => ({ ...s, numOutputs: n }))}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-bold border transition-all duration-150 ${genSettings.numOutputs === n ? "bg-primary/10 text-primary border-primary/30" : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8"}`}>{n}</button>
                  ))}
                </div>
              </div>
              {/* Quality */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Image Quality</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUALITY_OPTIONS.map(q => {
                    const locked = PLAN_ORDER[q.minPlan] > planLevel;
                    const addonCost = QUALITY_ADDON_COSTS[q.id];
                    return (
                      <button key={q.id} disabled={locked}
                        onClick={() => !locked && setGenSettings(s => ({ ...s, quality: q.id }))}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border transition-all duration-150 ${
                          locked
                            ? "bg-white/3 text-muted-foreground/30 border-white/5 cursor-not-allowed"
                            : genSettings.quality === q.id
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8"
                        }`}>
                        <span className="font-semibold">{q.label}</span>
                        {locked
                          ? <span className="flex items-center gap-0.5 text-[9px] text-amber-500/70"><Lock className="h-2.5 w-2.5" /> {q.minPlan === "pro" ? "Pro" : "Starter"}</span>
                          : addonCost > 0
                            ? <span className="text-[9px] text-primary/70">+{addonCost} cr</span>
                            : <span className="text-[9px] opacity-40">free</span>
                        }
                      </button>
                    );
                  })}
                </div>
                <div className="mt-1 pt-2 border-t border-white/8 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Estimated cost</span>
                  <span className="text-[10px] font-semibold" style={{ color: "#89E900" }}>{currentCreditCost} credits</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder={`${currentTool.name} — describe your product...`}
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground/35 outline-none leading-relaxed max-h-32 overflow-y-auto scrollbar-none py-1 disabled:opacity-50"
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
          />

          {/* Credit pill inside prompt box */}
          {!isGenerating && (
            <div className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-semibold transition-all duration-200 mb-0.5 ${hasEnoughCredits ? "border-primary/25 bg-primary/8 text-primary" : "border-destructive/30 bg-destructive/8 text-destructive"}`}>
              <BoltIcon className="h-2.5 w-2.5" />
              <span>{currentCreditCost}</span>
            </div>
          )}

          {/* Send button */}
          <button onClick={handleSend}
            disabled={!canSend}
            title="Send (Ctrl+Enter)"
            className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 mb-0.5">
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Active tool indicator */}
        <div className="flex items-center gap-2 mt-1.5 px-1">
          {(() => { const Icon = currentTool.icon; return <Icon className="h-3 w-3 text-muted-foreground/40" />; })()}
          <span className="text-[10px] text-muted-foreground/40">{currentTool.name}</span>
          <span className="text-[10px] text-muted-foreground/25">·</span>
          <span className="text-[10px] text-muted-foreground/40 capitalize">{selectedModel} model</span>
        </div>

      </div>}
    </div>
  );
}
