import { useState } from "react";
import {
  CinematicAdsAnalyzeResponse,
  CinematicAdsBuildResponse,
  CinematicAdFormat,
  CinematicAdsFormatSuggestion,
} from "@/lib/generationApi";
import {
  CheckCircle,
  ChevronRight,
  Download,
  ImageIcon,
  Loader2,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";

// ── Format-specific loading states ────────────────────────────────────────────
const FORMAT_LOADING_TEXT: Record<string, string[]> = {
  model:       ["Casting your ad scene...", "Placing model in frame...", "Applying lighting..."],
  cgi:         ["Building cinematic world...", "Rendering particles...", "Applying color grade..."],
  scene:       ["Setting the scene...", "Styling environment...", "Composing the frame..."],
  brand_story: ["Crafting your brand story...", "Infusing emotion...", "Perfecting the mood..."],
};

const FORMAT_REVEAL_ANIM: Record<string, string> = {
  model:       "animate-slide-in-right",
  cgi:         "animate-fade-in",
  scene:       "animate-fade-in",
  brand_story: "animate-fade-in",
};

// ── Step 1: Format Picker ─────────────────────────────────────────────────────

interface FormatPickerProps {
  data: CinematicAdsAnalyzeResponse;
  onSelect: (formatId: string, subFormatId: string) => void;
}

export function CinematicFormatPicker({ data, onSelect }: FormatPickerProps) {
  const [selectedFormat, setSelectedFormat] = useState<CinematicAdFormat | null>(null);
  const suggestedIds = data.suggestions.map((s: CinematicAdsFormatSuggestion) => s.formatId);
  const reasonMap: Record<string, string> = {};
  data.suggestions.forEach((s: CinematicAdsFormatSuggestion) => {
    reasonMap[s.formatId] = s.reason;
  });

  if (selectedFormat) {
    return (
      <div className="px-3 sm:px-6 pb-2 space-y-3 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedFormat.icon}</span>
            <p className="text-xs font-semibold text-foreground">{selectedFormat.label} — Choose style</p>
          </div>
          <button
            onClick={() => setSelectedFormat(null)}
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> Change format
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedFormat.subOptions.map(sub => (
            <button
              key={sub.id}
              onClick={() => onSelect(selectedFormat.id, sub.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/4 hover:border-primary/50 hover:bg-primary/8 transition-all text-left group">
              <span className="text-base">{sub.icon}</span>
              <span className="text-[11px] font-medium text-foreground group-hover:text-primary transition-colors">
                {sub.label}
              </span>
              <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary ml-auto" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 pb-2 space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <p className="text-xs font-semibold text-foreground">
          {data.analysis?.product_name && (
            <span className="text-primary mr-1">{data.analysis.product_name}</span>
          )}
          — Choose your ad format
        </p>
      </div>

      {/* AI suggestion reason */}
      {data.suggestions[0]?.reason && (
        <div className="flex items-start gap-1.5 px-2 py-1.5 bg-amber-500/8 border border-amber-500/20 rounded-lg">
          <Zap className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-400/90 leading-snug">{data.suggestions[0].reason}</p>
        </div>
      )}

      {/* Product analysis tags */}
      {data.analysis?.product_category && (
        <div className="flex flex-wrap gap-1.5">
          {[
            data.analysis.product_category,
            data.analysis.brand_feel,
            data.analysis.primary_emotion,
            data.analysis.color_mood,
          ].filter(Boolean).map((tag, i) => (
            <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground/70 font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Format grid */}
      <div className="grid grid-cols-2 gap-2">
        {data.allFormats.map((format: CinematicAdFormat) => {
          const isSuggested = suggestedIds.includes(format.id);
          return (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format)}
              className={`relative flex flex-col items-start rounded-2xl overflow-hidden border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-left ${
                isSuggested
                  ? "border-amber-500/50 ring-1 ring-amber-500/20"
                  : "border-white/10 hover:border-white/30"
              }`}>
              {/* Gradient banner */}
              <div
                className="w-full h-14 flex items-center justify-center relative"
                style={{ background: format.gradient }}>
                <span className="text-2xl drop-shadow-md">{format.icon}</span>
                {isSuggested && (
                  <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center">
                    <Zap className="h-2.5 w-2.5 text-black" />
                  </div>
                )}
              </div>
              <div className="p-2.5 bg-white/4 w-full flex-1">
                <p className="text-[11px] font-bold text-foreground leading-snug">{format.label}</p>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5 leading-snug line-clamp-2">{format.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 2: Config Pickers (Color Grade + Aspect Ratio) ───────────────────────

interface ConfigPickerProps {
  data: CinematicAdsAnalyzeResponse;
  formatId: string;
  subFormatId: string;
  selectedColorGrade: string;
  selectedAspectRatio: string;
  onColorGradeChange: (id: string) => void;
  onAspectRatioChange: (id: string) => void;
  onGenerate: () => void;
  isBuilding: boolean;
  onBack: () => void;
}

export function CinematicConfigPicker({
  data, formatId, subFormatId,
  selectedColorGrade, selectedAspectRatio,
  onColorGradeChange, onAspectRatioChange,
  onGenerate, isBuilding, onBack,
}: ConfigPickerProps) {
  const format = data.allFormats.find(f => f.id === formatId);
  const subFormat = format?.subOptions.find(s => s.id === subFormatId);

  return (
    <div className="px-3 sm:px-6 pb-2 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{subFormat?.icon || format?.icon}</span>
          <p className="text-xs font-semibold text-foreground">
            {format?.label} · <span className="text-muted-foreground font-normal">{subFormat?.label}</span>
          </p>
        </div>
        <button onClick={onBack} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
          <RotateCcw className="h-3 w-3" /> Back
        </button>
      </div>

      {/* Color Grade */}
      <div>
        <p className="text-[11px] font-semibold text-foreground mb-2">Color Grade</p>
        <div className="flex gap-2 overflow-x-auto pb-1 sidebar-scroll">
          {data.colorGrades.map(grade => (
            <button
              key={grade.id}
              onClick={() => onColorGradeChange(grade.id)}
              className={`shrink-0 flex flex-col rounded-xl overflow-hidden border transition-all ${
                selectedColorGrade === grade.id
                  ? "border-primary/60 ring-1 ring-primary/25"
                  : "border-white/10 hover:border-white/25"
              }`}
              style={{ width: 100 }}>
              <div className="w-full h-9 rounded-t-xl" style={{ background: grade.preview }} />
              <div className="px-2 py-1.5 bg-white/4 w-full">
                <p className="text-[10px] font-semibold text-foreground">{grade.label}</p>
                <p className="text-[8px] text-muted-foreground/60 line-clamp-2 mt-0.5 leading-snug">{grade.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <p className="text-[11px] font-semibold text-foreground mb-2">Aspect Ratio</p>
        <div className="flex gap-2 flex-wrap">
          {data.aspectRatios.map(ratio => (
            <button
              key={ratio.id}
              onClick={() => onAspectRatioChange(ratio.id)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all ${
                selectedAspectRatio === ratio.id
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/4 text-muted-foreground hover:border-white/25 hover:text-foreground"
              }`}>
              <span className="text-[12px] font-bold">{ratio.label}</span>
              <span className="text-[8px] mt-0.5 opacity-70">{ratio.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate */}
      <div className="flex justify-end pt-1">
        <button
          onClick={onGenerate}
          disabled={isBuilding}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold bg-primary text-black hover:bg-primary/90 transition-colors disabled:opacity-60">
          {isBuilding ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
          ) : (
            <><Sparkles className="h-3.5 w-3.5" /> Generate Ad</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Loading Animation per format ──────────────────────────────────────────────

interface FormatLoadingProps {
  format: string;
  step: number;
}

export function CinematicLoadingAnimation({ format, step }: FormatLoadingProps) {
  const steps = FORMAT_LOADING_TEXT[format] || FORMAT_LOADING_TEXT.cgi;
  const currentText = steps[step % steps.length];

  const renderAnimation = () => {
    switch (format) {
      case "model":
        return (
          <div className="flex gap-1 items-end h-8">
            {[0,1,2,3,4,5,6,7].map(i => (
              <div
                key={i}
                className="w-1 bg-primary/70 rounded-full"
                style={{
                  height: `${20 + Math.sin((Date.now() / 300) + i) * 14}%`,
                  animation: `pulse ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                  minHeight: 4,
                }}
              />
            ))}
          </div>
        );
      case "cgi":
        return (
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            <div className="absolute inset-1 rounded-full border-2 border-primary/60 animate-ping" style={{ animationDelay: "0.2s" }} />
            <div className="absolute inset-2 rounded-full bg-primary/40 animate-pulse" />
          </div>
        );
      case "scene":
        return (
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-sm bg-primary/60"
                style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite alternate` }}
              />
            ))}
          </div>
        );
      case "brand_story":
        return (
          <div className="w-6 h-6 rounded-full border-2 border-primary/50"
            style={{ animation: "heartbeat 1s ease-in-out infinite" }} />
        );
      default:
        return <Loader2 className="h-6 w-6 text-primary animate-spin" />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 py-8 animate-fade-in">
      {renderAnimation()}
      <p className="text-[11px] text-muted-foreground animate-pulse">{currentText}</p>
    </div>
  );
}

// ── Result Display ────────────────────────────────────────────────────────────

interface CinematicResultProps {
  result: CinematicAdsBuildResponse;
  data: CinematicAdsAnalyzeResponse;
  onApprove: () => void;
  onRefine: (text: string) => void;
  onRegenerate: () => void;
  approved: boolean;
}

const FORMAT_LABEL: Record<string, string> = {
  model: "Model / Influencer",
  cgi: "CGI / Cinematic",
  scene: "Scene Builder",
  brand_story: "Brand Story",
};

const SUBFORMAT_LABEL: Record<string, string> = {
  female_beauty: "Female Model",
  male_sports: "Male Model",
  hands_only: "Hands Only",
  lifestyle_partial: "Lifestyle",
  splash_liquid: "Liquid Splash",
  particle_dust: "Particles",
  light_rays: "Light Rays",
  space_float: "Space Float",
  nature_macro: "Nature Macro",
  morning_luxury: "Morning Luxury",
  urban_professional: "Urban Pro",
  evening_glow: "Evening Glow",
  outdoor_adventure: "Outdoor",
  luxury_hotel: "Luxury Hotel",
  confidence: "Confidence",
  elegance: "Elegance",
  joy_celebration: "Joy",
  freshness_energy: "Freshness",
};

export function CinematicAdResult({
  result, data, onApprove, onRefine, onRegenerate, approved,
}: CinematicResultProps) {
  const [refineText, setRefineText] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  const handleDownload = () => {
    if (!result.imageUrls[0]) return;
    const a = document.createElement("a");
    a.href = result.imageUrls[0];
    a.download = `pixalera_cinematic_${result.format}_${result.subFormat}.jpg`;
    a.click();
  };

  const handleRefineSubmit = () => {
    if (!refineText.trim()) return;
    onRefine(refineText.trim());
    setRefineText("");
  };

  const colorGrade = data.colorGrades.find(g => g.id === result.colorGrade);
  const aspectRatio = data.aspectRatios.find(r => r.id === result.aspectRatio);
  const revealClass = FORMAT_REVEAL_ANIM[result.format] || "animate-fade-in";

  return (
    <div className={`space-y-3 ${revealClass}`}>
      {/* Image */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/3 group"
        style={{ maxWidth: 420, margin: "0 auto" }}>
        <div className="relative" style={{ paddingTop: result.aspectRatio === "9:16" ? "177.78%" : result.aspectRatio === "16:9" ? "56.25%" : result.aspectRatio === "1:1" ? "100%" : result.aspectRatio === "4:5" ? "125%" : "133.33%" }}>
          <div className="absolute inset-0">
            {result.hasRealImages && result.imageUrls[0] ? (
              <img
                src={result.imageUrls[0]}
                alt="Cinematic ad"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: data.allFormats.find(f => f.id === result.format)?.gradient || "#333" }}>
                  <span className="text-2xl">{data.allFormats.find(f => f.id === result.format)?.icon}</span>
                </div>
<div className="text-center">
                <p className="text-xs text-white/40 font-medium">Preview Mode</p>
                <p className="text-[10px] text-white/25 mt-1">Add NVIDIA_API_KEY or REPLICATE_API_TOKEN for real images</p>
              </div>
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          <span className="text-[9px] font-bold bg-black/60 backdrop-blur-sm text-white/90 rounded-full px-2 py-1">
            {FORMAT_LABEL[result.format] || result.format}
          </span>
          <span className="text-[9px] font-medium bg-black/60 backdrop-blur-sm text-white/60 rounded-full px-2 py-1">
            {SUBFORMAT_LABEL[result.subFormat] || result.subFormat}
          </span>
          {colorGrade && (
            <span className="text-[9px] font-medium backdrop-blur-sm text-white/60 rounded-full px-2 py-1"
              style={{ background: `${colorGrade.preview}99` }}>
              {colorGrade.label}
            </span>
          )}
        </div>

        {/* Aspect ratio badge */}
        {aspectRatio && (
          <div className="absolute top-2 right-2">
            <span className="text-[9px] font-bold bg-black/60 backdrop-blur-sm text-white/60 rounded-full px-2 py-1">
              {aspectRatio.label}
            </span>
          </div>
        )}

        {/* Approved badge */}
        {approved && (
          <div className="absolute bottom-2 right-2">
            <div className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm rounded-full px-2 py-1">
              <CheckCircle className="h-3 w-3 text-white" />
              <span className="text-[9px] font-bold text-white">APPROVED</span>
            </div>
          </div>
        )}

        {/* Download overlay */}
        {result.hasRealImages && !approved && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-2 justify-center">
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 border border-white/20 transition-colors">
                <Download className="h-3.5 w-3.5" /> Save JPG
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
              <CheckCircle className="h-3.5 w-3.5" /> Approve Ad
            </button>
            <button onClick={onRegenerate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold border border-white/15 text-muted-foreground hover:text-foreground hover:border-white/30 transition-colors">
              <RotateCcw className="h-3.5 w-3.5" /> Regenerate
            </button>
            {result.hasRealImages && (
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold border border-white/15 text-muted-foreground hover:text-foreground hover:border-white/30 transition-colors">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[12px] font-semibold">
              <CheckCircle className="h-4 w-4" /> Ad approved!
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

      {/* Platform export hint */}
      {approved && (
        <div className="border border-primary/20 rounded-xl bg-primary/5 p-3">
          <p className="text-[10px] text-primary/80 font-medium mb-1">Platform Export</p>
          <div className="flex flex-wrap gap-1.5">
            {["Instagram Feed", "Story / Reel", "Facebook Post", "YouTube Thumbnail", "Pinterest"].map(p => (
              <span key={p} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground/70">
                {p}
              </span>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground/50 mt-2">Upgrade to Pro for one-click platform exports in exact dimensions.</p>
        </div>
      )}

      {/* Refinement */}
      {!approved && (
        <div className="border border-white/8 rounded-xl bg-white/3 p-3">
          <p className="text-[10px] text-muted-foreground/70 mb-2 font-medium">
            Refine it (e.g. "dark background", "warm karo", "CGI particles", "vertical format"):
          </p>
          <div className="flex gap-2">
            <input
              value={refineText}
              onChange={e => setRefineText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleRefineSubmit()}
              placeholder="e.g. make it darker, add splash effect, female model…"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
            />
            <button onClick={handleRefineSubmit}
              disabled={!refineText.trim()}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white/8 text-foreground hover:bg-white/15 disabled:opacity-40 transition-colors border border-white/10">
              Refine
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {["warm karo", "dark dramatic", "CGI splash", "female model", "vertical 9:16"].map(hint => (
              <button
                key={hint}
                onClick={() => { setRefineText(hint); }}
                className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground/60 hover:text-foreground hover:border-white/25 transition-colors">
                {hint}
              </button>
            ))}
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

      {!result.hasRealImages && (
        <p className="text-[10px] text-amber-400/70 text-center">
          Preview mode — add NVIDIA_API_KEY or REPLICATE_API_TOKEN to generate real cinematic ad images
        </p>
      )}
    </div>
  );
}
