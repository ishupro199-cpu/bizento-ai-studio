import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, LayoutGrid, Camera, Clapperboard, Megaphone,
  AlertTriangle, Check, Plus, Upload, Image as ImageIcon,
  RotateCcw, Sparkles, ThumbsUp, ChevronDown,
  X, Link2, Settings2, Lock,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { useChatContext } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/hooks/useImageUpload";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { callGenerationApi } from "@/lib/generationApi";
import { augmentPrompt } from "@/lib/promptAugmentation";
import { useAuth } from "@/contexts/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { PlatformOptimization } from "@/components/app/PlatformOptimization";

const tools = [
  { id: "catalog", name: "Generate Catalog", icon: LayoutGrid },
  { id: "photo", name: "Product Photography", icon: Camera },
  { id: "cinematic", name: "Cinematic Ads", icon: Clapperboard },
  { id: "creative", name: "Ad Creatives", icon: Megaphone },
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
  { id: "luxury",   label: "Luxury Studio",        sublabel: "Premium brand style",    gradient: "linear-gradient(135deg,#1a1400 0%,#7a5500 100%)" },
  { id: "minimal",  label: "Amazon Clean",          sublabel: "Marketplace ready",       gradient: "linear-gradient(135deg,#f1f3f5 0%,#dee2e6 100%)" },
  { id: "neon",     label: "Neon Futuristic",       sublabel: "Bold & viral",            gradient: "linear-gradient(135deg,#0d0221 0%,#2d0041 100%)" },
  { id: "floral",   label: "Floral Lifestyle",      sublabel: "Soft & natural",          gradient: "linear-gradient(135deg,#fce4ec 0%,#e8f5e9 100%)" },
  { id: "beach",    label: "Beach Campaign",        sublabel: "Warm lifestyle",          gradient: "linear-gradient(135deg,#0077b6 0%,#f9c74f 100%)" },
];

const GRADIENTS = [
  "linear-gradient(135deg, hsl(85 100% 45% / 0.25), hsl(200 80% 40% / 0.18))",
  "linear-gradient(135deg, hsl(280 60% 50% / 0.25), hsl(85 100% 45% / 0.18))",
  "linear-gradient(135deg, hsl(30 80% 50% / 0.25), hsl(350 60% 50% / 0.18))",
];

const ASPECT_RATIOS = ["1:1", "4:5", "16:9", "9:16", "3:2"];
const QUALITIES = [
  { id: "720p", label: "720p", pro: false },
  { id: "1K",   label: "1K",   pro: false },
  { id: "2K",   label: "2K",   pro: true  },
  { id: "4K",   label: "4K",   pro: true  },
];

type ChatPhase = "idle" | "thinking" | "show-styles" | "generating" | "results" | "approved";

interface GenSettings {
  aspectRatio: string;
  numOutputs: number;
  quality: string;
}

interface GeneratedImage {
  id: number;
  gradient: string;
  imageUrl?: string;
  isReal: boolean;
}

// ------- typing text animation -------
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

export default function WelcomeDashboard() {
  const { canGenerate, setShowUpgradeModal, user, selectedModel, addGeneration } = useAppContext();
  const { user: authUser } = useAuth();
  const { createSession, startNewChat } = useChatContext();
  const location = useLocation();

  // input state
  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedTool, setSelectedTool] = useState("catalog");
  const [plusOpen, setPlusOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [genSettings, setGenSettings] = useState<GenSettings>({ aspectRatio: "1:1", numOutputs: 3, quality: "1K" });

  // images
  const productRef = useRef<HTMLInputElement>(null);
  const referenceRef = useRef<HTMLInputElement>(null);
  const { upload: uploadProduct, uploading: uploadingProduct, previewUrl: productPreview, uploadedUrl: productUrl, clearUpload: clearProduct } = useImageUpload();
  const [referencePreview, setReferencePreview] = useState<string | null>(null);

  // chat
  const [phase, setPhase] = useState<ChatPhase>("idle");
  const [sentPrompt, setSentPrompt] = useState("");
  const [sentProductPreview, setSentProductPreview] = useState<string | null>(null);
  const [sentRefPreview, setSentRefPreview] = useState<string | null>(null);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [thinkingDone, setThinkingDone] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [showApprovedPlatform, setShowApprovedPlatform] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);

  const isPro = user.plan === "pro";
  const isStarter = user.plan === "starter";
  const isGenerating = phase === "thinking" || phase === "generating";

  // scroll to bottom when chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [phase, thinkingStep, generatedImages, showApprovedPlatform]);

  // accept prompt from Inspiration Hub navigation
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
    if (!inputPrompt.trim() || !canGenerate || isGenerating) return;

    const prompt = inputPrompt.trim();

    // Create a new chat session in the sidebar when sending the first message
    if (phase === "idle") {
      createSession(prompt);
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

    // resize textarea
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; }

    setPhase("thinking");

    // run thinking animation
    await runThinkingAnimation();

    // show style selection
    setPhase("show-styles");
  };

  const startGeneration = useCallback(async (style: string, prompt: string) => {
    setPhase("generating");
    setThinkingStep(0);
    setThinkingDone(false);

    const toolName = tools.find(t => t.id === selectedTool)?.name || "Generate Catalog";
    const augmented = augmentPrompt(prompt, style, toolName);

    // run generating animation in parallel with API
    const animPromise = runThinkingAnimation();
    const apiPromise = callGenerationApi({
      imageUrl: productUrl || undefined,
      prompt,
      tool: toolName,
      style,
      model: selectedModel,
      userId: authUser?.uid,
    });

    const [, apiResp] = await Promise.all([animPromise, apiPromise]);

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

    const imgs: GeneratedImage[] = GRADIENTS.map((g, i) => ({
      id: Date.now() + i,
      gradient: g,
      imageUrl: finalUrls[i],
      isReal,
    }));

    setGeneratedImages(imgs);
    setPhase("results");

    addGeneration({
      prompt,
      augmentedPrompt: apiResp.augmentedPrompt ?? augmented,
      tool: toolName,
      style,
      model: selectedModel,
      date: new Date(),
      gradient: GRADIENTS[0],
      uploadedImageUrl: productUrl || "",
      variantCount: 3,
      imageUrls: finalUrls,
      hasRealImages: isReal,
    });
  }, [selectedTool, productUrl, selectedModel, authUser, addGeneration, runThinkingAnimation]);

  const handleStyleSelect = async (styleId: string) => {
    setSelectedStyle(styleId);
    await startGeneration(styleId, sentPrompt);
  };

  const handleStyleSkip = async () => {
    setSelectedStyle("luxury");
    await startGeneration("luxury", sentPrompt);
  };

  const handleApprove = () => {
    setPhase("approved");
    setShowApprovedPlatform(true);
  };

  const handleRegenerate = () => {
    const style = selectedStyle || "luxury";
    startGeneration(style, sentPrompt);
  };

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
    clearProduct();
    setReferencePreview(null);
    startNewChat();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSend(); }
  };

  const firstName = user.name?.split(" ")[0] || "there";

  // ─────────────────── RENDER ───────────────────
  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* ── Hidden file inputs ── */}
      <input type="file" ref={productRef} className="hidden" accept="image/*"
        onChange={async (e) => {
          const f = e.target.files?.[0]; if (f) { await uploadProduct(f); setPlusOpen(false); }
          if (productRef.current) productRef.current.value = "";
        }} />
      <input type="file" ref={referenceRef} className="hidden" accept="image/*" onChange={handleReferenceSelect} />

      {/* ─── CHAT AREA ─── */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-5 sidebar-scroll"
        style={{ paddingBottom: phase === "show-styles" ? "220px" : "88px" }}>

        {/* ─── Welcome screen — shown when no active chat ─── */}
        {phase === "idle" && (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center space-y-5 animate-fade-in">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl font-black" style={{ background: "rgba(137,233,0,0.12)", border: "1px solid rgba(137,233,0,0.2)", color: "#89E900" }}>
              B
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Hi {firstName},
              </h1>
              <h2 className="text-xl sm:text-2xl font-medium tracking-tight" style={{ color: "rgba(255,255,255,0.45)" }}>
                What do you want to create?
              </h2>
            </div>
            {/* Suggested tools */}
            <div className="flex flex-wrap justify-center gap-2 max-w-sm">
              {[
                { icon: LayoutGrid, label: "Generate Catalog" },
                { icon: Camera, label: "Product Photo" },
                { icon: Clapperboard, label: "Cinematic Ad" },
                { icon: Megaphone, label: "Ad Creative" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => setInputPrompt(label)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150 hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
            {!canGenerate && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <span className="text-sm text-foreground">You've reached your generation limit.</span>
                <Button size="sm" className="text-xs h-7 rounded-lg ml-2" onClick={() => setShowUpgradeModal(true)}>Upgrade</Button>
              </div>
            )}
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Upload a product image and describe your vision, or just describe it</p>
          </div>
        )}

        {/* ─── User message bubble (right) ─── */}
        {sentPrompt && (
          <div className="flex justify-end animate-fade-in">
            <div className="max-w-[75%] space-y-2">
              {/* Images above message */}
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
              {/* Prompt bubble */}
              <div className="bg-primary/12 border border-primary/20 rounded-2xl rounded-tr-sm px-4 py-3">
                <p className="text-sm text-foreground leading-relaxed">{sentPrompt}</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── AI Thinking / Generating bubble (left) ─── */}
        {(phase === "thinking" || phase === "generating" || phase === "show-styles" || phase === "results" || phase === "approved") && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[80%] space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Bizento AI</span>
              </div>
              <div className="bg-white/4 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3.5 space-y-2">
                {THINKING_STEPS.map((step, i) => {
                  const done = i < thinkingStep || thinkingDone;
                  const active = i === thinkingStep && !thinkingDone && (phase === "thinking" || phase === "generating");
                  const upcoming = !done && !active;
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

        {/* ─── Generated Images bubble (right) ─── */}
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
                  </div>
                ))}
              </div>
              {!generatedImages[0]?.isReal && (
                <p className="text-[10px] text-amber-400/70 text-right">Preview mode — add REPLICATE_API_TOKEN for real images</p>
              )}

              {/* Approve / Regenerate */}
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

        {/* ─── Platform Optimization (left bubble) ─── */}
        {showApprovedPlatform && phase === "approved" && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[90%] w-full space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Bizento AI</span>
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

      {/* ─── STYLE CARDS strip — shown above prompt box during style selection ─── */}
      {phase === "show-styles" && (
        <div className="px-3 sm:px-6 pb-2 animate-fade-in">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-medium text-muted-foreground">Choose a style preset, or skip to auto-select</p>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 sidebar-scroll">
            {STYLE_CARDS.map((style) => (
              <button key={style.id} onClick={() => handleStyleSelect(style.id)}
                className={`shrink-0 flex flex-col rounded-xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all duration-200 ${
                  selectedStyle === style.id ? "border-primary/60 ring-1 ring-primary/30" : ""
                }`}
                style={{ width: 100 }}>
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

      {/* ─── PROMPT BAR (fixed bottom) ─── */}
      <div className="shrink-0 px-3 sm:px-6 pb-4 pt-2 border-t border-white/8 bg-background/80 backdrop-blur-sm">
        {/* Attached image previews above the bar */}
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

          {/* + button */}
          <Popover open={plusOpen} onOpenChange={setPlusOpen}>
            <PopoverTrigger asChild>
              <button disabled={isGenerating || uploadingProduct} title="Attach"
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground mb-0.5 disabled:opacity-40">
                <Plus className="h-4.5 w-4.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" side="top" className="w-64 p-1.5 rounded-xl bg-popover border border-white/10">
              {/* Product image */}
              <div className="px-3 pt-2 pb-1">
                <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Images</p>
              </div>
              <button onClick={() => productRef.current?.click()}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-white/5 transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="text-left">
                  <p className="text-sm">Upload Product Image</p>
                  <p className="text-[10px] text-muted-foreground/60">Main product to transform</p>
                </div>
              </button>
              <button onClick={() => referenceRef.current?.click()}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-white/5 transition-colors">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="text-left">
                  <p className="text-sm">Upload Reference Image</p>
                  <p className="text-[10px] text-muted-foreground/60">Style reference or inspiration</p>
                </div>
              </button>
              <div className="h-px bg-white/8 my-1" />
              {/* Tool selection */}
              <div className="px-3 pt-1 pb-1">
                <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Mode</p>
              </div>
              {tools.map((tool) => (
                <button key={tool.id} onClick={() => { setSelectedTool(tool.id); setPlusOpen(false); }}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedTool === tool.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                  }`}>
                  <tool.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {tool.name}
                  {selectedTool === tool.id && <Check className="h-3 w-3 ml-auto text-primary" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Settings button */}
          <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
            <PopoverTrigger asChild>
              <button title="Settings" disabled={isGenerating}
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground mb-0.5 disabled:opacity-40">
                <Settings2 className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" side="top" className="w-72 p-4 rounded-2xl bg-popover border border-white/10 space-y-4">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Generation Settings</p>
              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Aspect Ratio</p>
                <div className="flex flex-wrap gap-1.5">
                  {ASPECT_RATIOS.map(ar => (
                    <button key={ar} onClick={() => setGenSettings(s => ({ ...s, aspectRatio: ar }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${
                        genSettings.aspectRatio === ar
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8"
                      }`}>{ar}</button>
                  ))}
                </div>
              </div>
              {/* Outputs */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Number of Outputs</p>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map(n => (
                    <button key={n} onClick={() => setGenSettings(s => ({ ...s, numOutputs: n }))}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-150 ${
                        genSettings.numOutputs === n
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8"
                      }`}>{n}</button>
                  ))}
                </div>
              </div>
              {/* Quality */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Image Quality</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUALITIES.map(q => {
                    const locked = q.pro && !isPro;
                    return (
                      <button key={q.id} disabled={locked}
                        onClick={() => !locked && setGenSettings(s => ({ ...s, quality: q.id }))}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border transition-all duration-150 ${
                          locked ? "bg-white/3 text-muted-foreground/30 border-white/5 cursor-not-allowed"
                            : genSettings.quality === q.id
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8"
                        }`}>
                        <span className="font-semibold">{q.label}</span>
                        {locked ? <span className="flex items-center gap-0.5 text-[9px] text-amber-500/70"><Lock className="h-2.5 w-2.5" /> Pro</span>
                          : <span className="text-[9px] opacity-50">Free</span>}
                      </button>
                    );
                  })}
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
            placeholder="Describe your product or scene..."
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground/40 outline-none leading-relaxed max-h-32 overflow-y-auto scrollbar-none py-1 disabled:opacity-50"
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
          />

          {/* Send button */}
          <button onClick={handleSend}
            disabled={!inputPrompt.trim() || !canGenerate || isGenerating}
            title="Send (Ctrl+Enter)"
            className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 mb-0.5">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
