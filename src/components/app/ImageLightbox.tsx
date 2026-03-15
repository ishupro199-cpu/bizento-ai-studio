import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Edit3, X, Image as ImageIcon } from "lucide-react";
import type { GenerationResult } from "@/hooks/useGenerationState";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ImageLightboxProps {
  image: GenerationResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageLightbox({ image, open, onOpenChange }: ImageLightboxProps) {
  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-card border-[hsl(var(--glass-border))] p-0 overflow-hidden">
        <VisuallyHidden><DialogTitle>Image Preview</DialogTitle></VisuallyHidden>
        <div
          className="aspect-video flex items-center justify-center relative"
          style={{ background: image.gradient }}
        >
          <ImageIcon className="h-20 w-20 text-foreground/20" />
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">{image.prompt}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="glass rounded-full px-2 py-0.5">{image.tool}</span>
            <span className="glass rounded-full px-2 py-0.5">{image.style}</span>
            <span className="glass rounded-full px-2 py-0.5">{image.model}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="glass rounded-lg gap-1.5">
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
