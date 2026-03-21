import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Edit3, Image as ImageIcon, Sparkles } from "lucide-react";
import type { GenerationResult } from "@/hooks/useGenerationState";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ImageLightboxProps {
  image: GenerationResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function handleDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.target = "_blank";
  a.click();
}

export function ImageLightbox({ image, open, onOpenChange }: ImageLightboxProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!image) return null;

  const displayUrl = image.imageUrl && !imgError ? image.imageUrl : null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setImgLoaded(false); setImgError(false); } onOpenChange(v); }}>
      <DialogContent className="max-w-3xl bg-card border-[hsl(var(--glass-border))] p-0 overflow-hidden">
        <VisuallyHidden><DialogTitle>Image Preview</DialogTitle></VisuallyHidden>
        <div
          className="aspect-square sm:aspect-video flex items-center justify-center relative overflow-hidden"
          style={{ background: image.gradient }}
        >
          {displayUrl ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              )}
              <img
                src={displayUrl}
                alt={image.prompt}
                className={`w-full h-full object-contain transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
              {image.isReal && imgLoaded && (
                <div className="absolute top-3 right-3 flex items-center gap-1 glass rounded-full px-2.5 py-1 text-xs text-primary">
                  <Sparkles className="h-3 w-3" /> AI Generated
                </div>
              )}
            </>
          ) : image.uploadedImageUrl ? (
            <img
              src={image.uploadedImageUrl}
              alt={image.prompt}
              className="w-full h-full object-contain p-6 drop-shadow-2xl"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-foreground/20">
              <ImageIcon className="h-20 w-20" />
              <p className="text-sm text-muted-foreground">Preview not available</p>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{image.prompt}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="glass rounded-full px-2 py-0.5">{image.tool}</span>
            <span className="glass rounded-full px-2 py-0.5">{image.style}</span>
            <span className="glass rounded-full px-2 py-0.5">{image.model}</span>
            {image.generationTime && (
              <span className="glass rounded-full px-2 py-0.5">⚡ {image.generationTime}s</span>
            )}
            {image.isReal && image.imageUrl && !imgError && (
              <span className="glass rounded-full px-2 py-0.5 text-primary">✓ Real AI</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="glass rounded-lg gap-1.5"
              onClick={() => {
                const url = image.imageUrl || image.uploadedImageUrl;
                if (url) handleDownload(url, `pixalera-${image.style}-v${image.variantIndex + 1}.webp`);
              }}
            >
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
            <Button size="sm" variant="ghost" className="glass rounded-lg gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </Button>
            <Button size="sm" variant="ghost" className="glass rounded-lg gap-1.5">
              <Edit3 className="h-3.5 w-3.5" /> Edit Prompt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
