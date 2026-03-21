import { useState } from "react";
import {
  Download, RefreshCw, Edit3, Megaphone, Image as ImageIcon,
  DownloadCloud, RotateCcw, Sparkles, Clock, Zap,
  CheckCircle2, AlertCircle, ThumbsUp, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageLightbox } from "./ImageLightbox";
import { PlatformOptimization } from "./PlatformOptimization";
import type { GenerationResult } from "@/hooks/useGenerationState";

interface GenerationResultsProps {
  results: GenerationResult[];
  prompt: string;
  isPro: boolean;
  isFree?: boolean;
  onRegenerate: () => void;
}

const VARIANT_LABELS = ["Variant A", "Variant B", "Variant C"];
const VARIANT_STYLES = ["Luxury Studio", "Dramatic Scene", "Lifestyle Shot"];

function handleDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.target = "_blank";
  a.click();
}

interface ResultCardProps {
  img: GenerationResult;
  idx: number;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onRegenerate: () => void;
  approved: boolean;
  isFree?: boolean;
}

function ResultCard({ img, idx, selected, onSelect, onOpen, onRegenerate, approved, isFree }: ResultCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const showRealImage = img.isReal && img.imageUrl && !imgError;

  return (
    <div
      onClick={approved ? onOpen : onSelect}
      className={`rounded-xl overflow-hidden group cursor-pointer transition-all duration-200 border ${
        selected && !approved
          ? "border-primary/60 ring-2 ring-primary/30"
          : "border-white/10 hover:border-primary/30"
      } bg-white/3`}
    >
      <div
        className="aspect-square flex items-center justify-center relative overflow-hidden"
        style={{ background: img.gradient }}
      >
        {showRealImage ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            )}
            <img
              src={img.imageUrl}
              alt={`Generated variant ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : img.uploadedImageUrl && idx === 0 ? (
          <img
            src={img.uploadedImageUrl}
            alt="Generated"
            className="absolute inset-0 w-full h-full object-contain p-4 drop-shadow-2xl"
          />
        ) : img.uploadedImageUrl && idx === 1 ? (
          <img
            src={img.uploadedImageUrl}
            alt="Generated"
            className="absolute inset-0 w-full h-full object-contain p-6 drop-shadow-2xl opacity-90 scale-90"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-foreground/20">
            <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12" />
            <span className="text-[10px]">Preview</span>
          </div>
        )}

        {/* Selection indicator (pre-approval) */}
        {!approved && (
          <div className={`absolute top-2 right-2 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            selected
              ? "border-primary bg-primary"
              : "border-white/30 bg-black/30"
          }`}>
            {selected && <div className="h-2 w-2 rounded-full bg-black" />}
          </div>
        )}

        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className="text-[9px] bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5 text-white/70 font-medium">
            {VARIANT_LABELS[idx] ?? `Variant ${idx + 1}`}
          </span>
          {img.isReal && img.imageUrl && !imgError && (
            <span className="text-[9px] bg-primary/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-primary font-medium flex items-center gap-0.5">
              <Zap className="h-2.5 w-2.5" /> AI
            </span>
          )}
        </div>

        {/* Free user watermark */}
        {isFree && img.isReal && img.imageUrl && !imgError && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/65 backdrop-blur-sm rounded-full px-2 py-1 pointer-events-none">
            <Zap className="h-3 w-3 text-primary shrink-0" />
            <span className="text-[8px] text-primary font-bold tracking-wide">PIXALERA</span>
          </div>
        )}

        {approved && (
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 sm:h-9 sm:w-9 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10"
              onClick={(e) => {
                e.stopPropagation();
                const url = img.imageUrl || img.uploadedImageUrl;
                if (url) handleDownload(url, `pixalera-${img.style}-v${idx + 1}.webp`);
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 sm:h-9 sm:w-9 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10"
              onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 sm:h-9 sm:w-9 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 sm:h-9 sm:w-9 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 hidden sm:flex"
              onClick={(e) => e.stopPropagation()}
            >
              <Megaphone className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="p-2 sm:p-3 space-y-1">
        <p className="text-[10px] text-primary font-medium">{VARIANT_STYLES[idx] ?? "Generated"}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{img.prompt}</p>
      </div>
    </div>
  );
}

export function GenerationResults({ results, prompt, isPro, isFree, onRegenerate }: GenerationResultsProps) {
  const [lightboxImage, setLightboxImage] = useState<GenerationResult | null>(null);
  const [approved, setApproved] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [showPlatformOpt, setShowPlatformOpt] = useState(false);

  if (results.length === 0) return null;

  const info = results[0];
  const hasRealImages = info.isReal && results.some((r) => r.imageUrl);
  const realImageCount = results.filter((r) => r.imageUrl).length;

  const handleApprove = () => {
    setApproved(true);
    setShowPlatformOpt(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {approved ? "Generation Complete ✓" : "Review Your Visuals"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {approved
              ? `${results.length} visual${results.length !== 1 ? "s" : ""} approved · Saved to your library`
              : "Select your favorite or approve all to continue"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {hasRealImages ? (
            <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{realImageCount} AI image{realImageCount !== 1 ? "s" : ""}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Preview mode</span>
            </div>
          )}
          {info.generationTime && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground/70 bg-white/5 border border-white/8 rounded-full px-2.5 py-1.5 hidden sm:flex">
              <Clock className="h-3 w-3" />
              <span>{info.generationTime}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Preview mode notice */}
      {!hasRealImages && (
        <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-3 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-foreground">Running in Preview Mode</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
              Add a <span className="text-primary font-mono">NVIDIA_API_KEY</span> to enable real AI image generation.
            </p>
          </div>
        </div>
      )}

      {/* Images grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {results.map((img, idx) => (
          <ResultCard
            key={img.id}
            img={img}
            idx={idx}
            selected={selectedVariant === idx}
            onSelect={() => setSelectedVariant(idx === selectedVariant ? null : idx)}
            onOpen={() => setLightboxImage(img)}
            onRegenerate={onRegenerate}
            approved={approved}
            isFree={isFree}
          />
        ))}
      </div>

      {/* Approve / Regenerate buttons — shown before approval */}
      {!approved && (
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            onClick={handleApprove}
            className="flex-1 gap-2 rounded-xl h-11 font-semibold text-sm"
          >
            <ThumbsUp className="h-4 w-4" />
            Approve & Continue
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
          <Button
            variant="outline"
            onClick={onRegenerate}
            className="flex-1 sm:flex-none gap-2 rounded-xl h-11 border-white/15 text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      )}

      {/* After approval — action buttons */}
      {approved && (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="bg-white/5 border border-white/10 rounded-lg gap-1.5 text-xs"
            onClick={() => {
              results.forEach((img, i) => {
                const url = img.imageUrl || img.uploadedImageUrl;
                if (url) setTimeout(() => handleDownload(url, `pixalera-${info.style}-v${i + 1}.webp`), i * 300);
              });
            }}
          >
            <DownloadCloud className="h-3.5 w-3.5" /> Download All
          </Button>
          <Button size="sm" variant="ghost" className="bg-white/5 border border-white/10 rounded-lg gap-1.5 text-xs" onClick={onRegenerate}>
            <RotateCcw className="h-3.5 w-3.5" /> Regenerate
          </Button>
          {!showPlatformOpt && (
            <Button
              size="sm"
              className="rounded-lg gap-1.5 text-xs"
              onClick={() => setShowPlatformOpt(true)}
            >
              <Sparkles className="h-3.5 w-3.5" /> Platform Listings
            </Button>
          )}
        </div>
      )}

      {/* Platform Optimization section */}
      {showPlatformOpt && approved && (
        <div className="border border-white/10 rounded-2xl p-4 sm:p-5 bg-white/2">
          <PlatformOptimization
            prompt={prompt || info.prompt}
            isPro={isPro}
            onClose={() => setShowPlatformOpt(false)}
          />
        </div>
      )}

      {/* Generation details */}
      {approved && (
        <div className="bg-white/3 border border-white/8 rounded-xl p-3 sm:p-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Generation Details</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-white/5 border border-white/8 rounded-full px-3 py-1 text-muted-foreground">🎨 {info.style}</span>
            <span className="bg-white/5 border border-white/8 rounded-full px-3 py-1 text-muted-foreground">🛠 {info.tool}</span>
            <span className="bg-white/5 border border-white/8 rounded-full px-3 py-1 text-muted-foreground">🤖 {info.model}</span>
            {info.generationTime && (
              <span className="bg-white/5 border border-white/8 rounded-full px-3 py-1 text-muted-foreground">
                ⚡ {info.generationTime}s
              </span>
            )}
            <span className={`bg-white/5 border border-white/8 rounded-full px-3 py-1 ${hasRealImages ? "text-primary" : "text-muted-foreground"}`}>
              {hasRealImages ? "✓ Real AI images" : "○ Preview mode"}
            </span>
          </div>
          {info.augmentedPrompt && (
            <div className="bg-white/3 rounded-lg p-2.5 space-y-1">
              <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">Augmented Prompt</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{info.augmentedPrompt}</p>
            </div>
          )}
        </div>
      )}

      <ImageLightbox
        image={lightboxImage}
        open={!!lightboxImage}
        onOpenChange={(open) => !open && setLightboxImage(null)}
      />
    </div>
  );
}
