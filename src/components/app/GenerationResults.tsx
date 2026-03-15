import { useState } from "react";
import { Download, RefreshCw, Edit3, Megaphone, Image as ImageIcon, DownloadCloud, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageLightbox } from "./ImageLightbox";
import type { GenerationResult } from "@/hooks/useGenerationState";

interface GenerationResultsProps {
  results: GenerationResult[];
  onRegenerate: () => void;
}

export function GenerationResults({ results, onRegenerate }: GenerationResultsProps) {
  const [lightboxImage, setLightboxImage] = useState<GenerationResult | null>(null);

  if (results.length === 0) return null;

  const info = results[0];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-4 sm:p-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-foreground">Generation Complete</h2>
        <p className="text-sm text-muted-foreground mt-1">Here are your generated visuals</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {results.map((img) => (
          <div
            key={img.id}
            onClick={() => setLightboxImage(img)}
            className="glass rounded-xl overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-200"
          >
            <div
              className="aspect-square flex items-center justify-center relative"
              style={{ background: img.gradient }}
            >
              <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 text-foreground/15" />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-9 sm:w-9 glass rounded-lg" onClick={(e) => e.stopPropagation()}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-9 sm:w-9 glass rounded-lg" onClick={(e) => e.stopPropagation()}>
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
            <div className="p-2 sm:p-3">
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{img.prompt}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Results info panel */}
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
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="ghost" className="glass rounded-lg gap-1.5 text-xs">
            <DownloadCloud className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Download</span> All
          </Button>
          <Button size="sm" variant="ghost" className="glass rounded-lg gap-1.5 text-xs" onClick={onRegenerate}>
            <RotateCcw className="h-3.5 w-3.5" /> Regenerate
          </Button>
          <Button size="sm" variant="ghost" className="glass rounded-lg gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Save
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
