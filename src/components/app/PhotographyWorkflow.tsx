import { useState } from "react";
import {
  PhotographyAnalyzeResponse,
  PhotographyBuildResponse,
  PhotographyStyle,
  PhotographyStyleSuggestion,
} from "@/lib/generationApi";
import {
  CheckCircle,
  ChevronRight,
  Download,
  ImageIcon,
  Loader2,
  RotateCcw,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";

// ── Style gradient presets for thumbnails ─────────────────────────────────────
const STYLE_GRADIENTS: Record<string, string> = {
  studio:     "linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)",
  lifestyle:  "linear-gradient(135deg, #d4a96a 0%, #8a6040 100%)",
  flatlay:    "linear-gradient(135deg, #f0ede8 0%, #c8b99a 100%)",
  dark:       "linear-gradient(135deg, #1a1a2e 0%, #0d0d0d 100%)",
  outdoor:    "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
  minimalist: "linear-gradient(135deg, #ffffff 0%, #f5f0eb 100%)",
};

const STYLE_ICONS: Record<string, string> = {
  studio:     "☀️",
  lifestyle:  "🏡",
  flatlay:    "📐",
  dark:       "🌑",
  outdoor:    "🌿",
  minimalist: "⬜",
};

// ── Lighting mood colors ──────────────────────────────────────────────────────
const LIGHTING_COLORS: Record<string, string> = {
  bright:    "#fff8e1",
  warm:      "#ffe0a0",
  cool:      "#e3f0ff",
  moody:     "#2d2d3a",
  cinematic: "#1a1020",
  natural:   "#f0f4e8",
};

interface PhotoStylePickerProps {
  data: PhotographyAnalyzeResponse;
  onGenerate: (style: string, background: string, lighting: string) => void;
  isBuilding: boolean;
}

export function PhotoStylePicker({ data, onGenerate, isBuilding }: PhotoStylePickerProps) {
  const [step, setStep] = useState<"style" | "background" | "lighting">("style");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(data.defaultStyle || null);
  const [selectedBg, setSelectedBg] = useState<string | null>(data.defaultBackground || null);
  const [selectedLight, setSelectedLight] = useState<string>(data.defaultLighting || "natural");

  const suggestedIds = data.suggestions.map((s: PhotographyStyleSuggestion) => s.styleId);
  const suggestionReasonMap: Record<string, string> = {};
  data.suggestions.forEach((s: PhotographyStyleSuggestion) => {
    suggestionReasonMap[s.styleId] = s.reason;
  });

  const backgrounds = selectedStyle ? (data.styleBackgrounds[selectedStyle] || []) : [];

  const handleStyleClick = (styleId: string) => {
    setSelectedStyle(styleId);
    const bgs = data.styleBackgrounds[styleId] || [];
    setSelectedBg(bgs[0] || null);
    setStep("background");
  };

  const handleBgClick = (bg: string) => {
    setSelectedBg(bg);
    setStep("lighting");
  };

  const handleGenerate = () => {
    if (selectedStyle && selectedBg && selectedLight) {
      onGenerate(selectedStyle, selectedBg, selectedLight);
    }
  };

  return (
    <div className="px-3 sm:px-6 pb-2 space-y-3 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <p className="text-xs font-semibold text-foreground">
          {data.analysis?.product_name && (
            <span className="text-primary mr-1">{data.analysis.product_name}</span>
          )}
          — Choose your photography style
        </p>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <span className={step === "style" ? "text-primary font-semibold" : "line-through opacity-50"}>Style</span>
        <ChevronRight className="h-3 w-3" />
        <span className={step === "background" ? "text-primary font-semibold" : step === "lighting" || isBuilding ? "line-through opacity-50" : "opacity-40"}>Background</span>
        <ChevronRight className="h-3 w-3" />
        <span className={step === "lighting" || isBuilding ? (step === "lighting" ? "text-primary font-semibold" : "line-through opacity-50") : "opacity-40"}>Lighting</span>
        <ChevronRight className="h-3 w-3" />
        <span className={isBuilding ? "text-primary font-semibold" : "opacity-40"}>Generate</span>
      </div>

      {/* ── STEP 1: Style picker ── */}
      {step === "style" && (
        <div>
          {suggestedIds.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="h-3 w-3 text-amber-400" />
              <p className="text-[10px] text-amber-400/80">AI-recommended for your product</p>
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto pb-2 sidebar-scroll">
            {data.allStyles.map((style: PhotographyStyle) => {
              const isSuggested = suggestedIds.includes(style.id);
              const reason = suggestionReasonMap[style.id];
              return (
                <button key={style.id} onClick={() => handleStyleClick(style.id)}
                  className={`shrink-0 flex flex-col rounded-xl overflow-hidden border transition-all duration-200 hover:scale-[1.02] ${
                    isSuggested
                      ? "border-amber-500/50 ring-1 ring-amber-500/20"
                      : "border-white/10 hover:border-white/25"
                  }`}
                  style={{ width: 106 }}>
                  {/* Thumbnail */}
                  <div className="aspect-square w-full flex items-center justify-center relative"
                    style={{ background: STYLE_GRADIENTS[style.id] || "#333" }}>
                    <span className="text-2xl">{STYLE_ICONS[style.id]}</span>
                    {isSuggested && (
                      <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center">
                        <Zap className="h-2.5 w-2.5 text-black" />
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-1.5 bg-white/4 flex-1">
                    <p className="text-[10px] font-semibold text-foreground leading-snug">{style.label}</p>
                    <p className="text-[8px] text-muted-foreground/60 mt-0.5 leading-snug line-clamp-2">
                      {reason || style.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 2: Background picker ── */}
      {step === "background" && selectedStyle && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-foreground">
              {data.allStyles.find(s => s.id === selectedStyle)?.label} — Choose background
            </p>
            <button onClick={() => setStep("style")} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> Change style
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {backgrounds.map((bg: string) => (
              <button key={bg} onClick={() => handleBgClick(bg)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                  selectedBg === bg
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-white/10 bg-white/4 text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}>
                {bg}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 3: Lighting picker ── */}
      {step === "lighting" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-foreground">Lighting mood</p>
            <button onClick={() => setStep("background")} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> Change background
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sidebar-scroll">
            {data.lightingMoods.map((mood) => (
              <button key={mood.id} onClick={() => setSelectedLight(mood.id)}
                className={`shrink-0 flex flex-col items-start rounded-xl overflow-hidden border transition-all ${
                  selectedLight === mood.id
                    ? "border-primary/60 ring-1 ring-primary/25"
                    : "border-white/10 hover:border-white/25"
                }`}
                style={{ width: 110 }}>
                <div className="w-full h-10 rounded-t-xl"
                  style={{ background: LIGHTING_COLORS[mood.id] || "#888" }} />
                <div className="px-2 py-1.5 bg-white/4 w-full">
                  <p className="text-[10px] font-semibold text-foreground">{mood.label}</p>
                  <p className="text-[8px] text-muted-foreground/60 line-clamp-2 mt-0.5">{mood.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Sun className="h-3 w-3" />
              <span>
                <span className="text-foreground font-medium">{data.allStyles.find(s => s.id === selectedStyle)?.label}</span>
                {" · "}{selectedBg}
              </span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isBuilding}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold bg-primary text-black hover:bg-primary/90 transition-colors disabled:opacity-60">
              {isBuilding
                ? <><Loader2 className="h-3 w-3 animate-spin" /> Building prompt…</>
                : <><Sparkles className="h-3 w-3" /> Generate Hero Shot</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Photo Result ──────────────────────────────────────────────────────────────

interface PhotoResultProps {
  result: PhotographyBuildResponse;
  onApprove: () => void;
  onRefine: (text: string) => void;
  approved: boolean;
}

export function PhotoResult({ result, onApprove, onRefine, approved }: PhotoResultProps) {
  const [refineText, setRefineText] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  const handleDownload = () => {
    if (!result.imageUrls[0]) return;
    const a = document.createElement("a");
    a.href = result.imageUrls[0];
    a.download = `pixalera_${result.style}_${result.background.replace(/\s+/g, "_").toLowerCase()}.jpg`;
    a.click();
  };

  const handleRefineSubmit = () => {
    if (!refineText.trim()) return;
    onRefine(refineText.trim());
    setRefineText("");
  };

  const styleLabel: Record<string, string> = {
    studio: "Studio Clean", lifestyle: "Lifestyle", flatlay: "Flat Lay",
    dark: "Dark Luxury", outdoor: "Outdoor", minimalist: "Minimalist",
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Hero Image */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/3 group"
        style={{ maxWidth: 420, margin: "0 auto" }}>
        <div className="aspect-square relative">
          {result.hasRealImages && result.imageUrls[0] ? (
            <img src={result.imageUrls[0]} alt="Photography hero shot"
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
              <ImageIcon className="h-12 w-12 text-white/15" />
              <div className="text-center">
                <p className="text-xs text-white/40 font-medium">Preview Mode</p>
                <p className="text-[10px] text-white/25 mt-1">Add NVIDIA_API_KEY for real images</p>
              </div>
            </div>
          )}

          {/* Style badge */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <span className="text-[9px] font-bold bg-black/60 backdrop-blur-sm text-white/80 rounded-full px-2 py-1">
              {styleLabel[result.style] || result.style}
            </span>
            <span className="text-[9px] font-medium bg-black/60 backdrop-blur-sm text-white/60 rounded-full px-2 py-1">
              {result.background}
            </span>
          </div>

          {/* Approved badge */}
          {approved && (
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm rounded-full px-2 py-1">
                <CheckCircle className="h-3 w-3 text-white" />
                <span className="text-[9px] font-bold text-white">APPROVED</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions overlay on hover */}
        {result.hasRealImages && !approved && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-2 justify-center">
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 border border-white/20 transition-colors">
                <Download className="h-3.5 w-3.5" /> Save JPEG
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 justify-center flex-wrap">
        {!approved ? (
          <>
            <button onClick={onApprove}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[12px] font-bold bg-emerald-500 text-white hover:bg-emerald-400 transition-colors">
              <CheckCircle className="h-3.5 w-3.5" /> Approve Shot
            </button>
            {result.hasRealImages && (
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold border border-white/15 text-muted-foreground hover:text-foreground hover:border-white/30 transition-colors">
                <Download className="h-3.5 w-3.5" /> Download JPG
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[12px] font-semibold">
              <CheckCircle className="h-4 w-4" /> Shot approved!
            </div>
            {result.hasRealImages && (
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold bg-primary text-black hover:bg-primary/90 transition-colors">
                <Download className="h-3.5 w-3.5" /> Download JPG
              </button>
            )}
          </div>
        )}
      </div>

      {/* Refinement chat */}
      {!approved && (
        <div className="border border-white/8 rounded-xl bg-white/3 p-3">
          <p className="text-[10px] text-muted-foreground/70 mb-2 font-medium">
            Not perfect? Describe changes (e.g. "make background darker", "add warm lighting"):
          </p>
          <div className="flex gap-2">
            <input
              value={refineText}
              onChange={e => setRefineText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleRefineSubmit()}
              placeholder="e.g. dark background, warmer light, marble surface…"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
            />
            <button onClick={handleRefineSubmit}
              disabled={!refineText.trim()}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white/8 text-foreground hover:bg-white/15 disabled:opacity-40 transition-colors border border-white/10">
              Refine
            </button>
          </div>
        </div>
      )}

      {/* Prompt detail */}
      <div>
        <button onClick={() => setShowPrompt(!showPrompt)}
          className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1">
          {showPrompt ? "▾" : "▸"} {showPrompt ? "Hide" : "Show"} generation prompt
        </button>
        {showPrompt && (
          <div className="mt-2 p-3 rounded-lg bg-black/30 border border-white/8">
            <p className="text-[9px] text-white/50 font-mono leading-relaxed whitespace-pre-wrap">{result.prompt}</p>
          </div>
        )}
      </div>

      {/* No real images notice */}
      {!result.hasRealImages && (
        <p className="text-[10px] text-amber-400/70 text-center">
          Preview mode — add NVIDIA_API_KEY to generate real hero shots
        </p>
      )}
    </div>
  );
}
