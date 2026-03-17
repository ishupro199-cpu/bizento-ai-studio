import { useState } from "react";
import { Download, RefreshCw, Edit3, Megaphone, Image as ImageIcon, DownloadCloud, RotateCcw, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageLightbox } from "./ImageLightbox";
import type { GenerationResult } from "@/hooks/useGenerationState";

interface GenerationResultsProps {
  results: GenerationResult[];
  onRegenerate: () => void;
}

const VARIANT_LABELS = ["Variant A", "Variant B", "Variant C"];
const VARIANT_STYLES = [
  "Luxury Studio",
  "Dramatic Scene",
  "Lifestyle Shot",
];

function handleDownload(url: string, filename: string) {
  if (url.startsWith("blob:") || url.startsWith("http")) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }
}

export function GenerationResults({ results, onRegenerate }: GenerationResultsProps) {
  const [lightboxImage, setLightboxImage] = useState<GenerationResult | null>(null);

  if (results.length === 0) return null;

  const info = results[0];
  const hasUpload = !!info.uploadedImageUrl;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Generation Complete</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {results.length} visual{results.length !== 1 ? "s" : ""} generated · Saved to your library
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary glass rounded-full px-3 py-1.5 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Saved to Firebase
        </div>
      </div>

      {hasUpload && (
        <div className="glass rounded-xl p-3 flex items-center gap-3">
          <img
            src={info.uploadedImageUrl}
            alt="Uploaded product"
            className="h-14 w-14 rounded-lg object-cover border border-white/10 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">Product image uploaded</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Stored in Firebase Storage · Used as source for compositing
            </p>
          </div>
          <Upload className="h-4 w-4 text-primary shrink-0" />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {results.map((img, idx) => (
          <div
            key={img.id}
            onClick={() => setLightboxImage(img)}
            className="glass rounded-xl overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-200"
          >
            <div
              className="aspect-square flex items-center justify-center relative overflow-hidden"
              style={{ background: img.gradient }}
            >
              {hasUpload && idx === 0 ? (
                <img
                  src={img.uploadedImageUrl}
                  alt="Generated"
                  className="absolute inset-0 w-full h-full object-contain p-4 drop-shadow-2xl"
                />
              ) : hasUpload && idx === 1 ? (
                <img
                  src={img.uploadedImageUrl}
                  alt="Generated"
                  className="absolute inset-0 w-full h-full object-contain p-6 drop-shadow-2xl opacity-90 scale-90"
                />
              ) : (
                <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 text-foreground/15" />
              )}

              <div className="absolute top-2 left-2">
                <span className="text-[9px] glass rounded-full px-2 py-0.5 text-muted-foreground font-medium">
                  {VARIANT_LABELS[idx] || `Variant ${idx + 1}`}
                </span>
              </div>

              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 sm:h-9 sm:w-9 glass rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (img.uploadedImageUrl) handleDownload(img.uploadedImageUrl, `pixalera-${idx + 1}.png`);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 sm:h-9 sm:w-9 glass rounded-lg"
                  onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-9 sm:w-9 glass rounded-lg" onClick={(e) => e.stopPropagation()}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-9 sm:w-9 glass rounded-lg hidden sm:flex" onClick={(e) => e.stopPropagation()}>
                  <Megaphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-2 sm:p-3 space-y-1">
              <p className="text-[10px] text-primary font-medium">{VARIANT_STYLES[idx] || "Generated"}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{img.prompt}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-3 sm:p-4 space-y-3">
        <p className="text-sm text-foreground font-medium">Generation Details</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="glass rounded-full px-3 py-1 text-muted-foreground">🎨 {info.style}</span>
          <span className="glass rounded-full px-3 py-1 text-muted-foreground">🛠 {info.tool}</span>
          <span className="glass rounded-full px-3 py-1 text-muted-foreground">🤖 {info.model}</span>
          <span className="glass rounded-full px-3 py-1 text-muted-foreground hidden sm:inline-flex">
            🕐 {info.timestamp.toLocaleTimeString()}
          </span>
        </div>
        {info.augmentedPrompt && (
          <div className="glass rounded-lg p-2.5 space-y-1">
            <p className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-wider">Augmented Prompt</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{info.augmentedPrompt}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="ghost" className="glass rounded-lg gap-1.5 text-xs">
            <DownloadCloud className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Download</span> All
          </Button>
          <Button size="sm" variant="ghost" className="glass rounded-lg gap-1.5 text-xs" onClick={onRegenerate}>
            <RotateCcw className="h-3.5 w-3.5" /> Regenerate
          </Button>
          <Button size="sm" variant="ghost" className="glass rounded-lg gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Save to Library
          </Button>
        </div>
      </div>

      <ImageLightbox
        image={lightboxImage}
        open={!!lightboxImage}
        onOpenChange={(open) => !open && setLightboxImage(null)}
      />
    </div>
  );
}
