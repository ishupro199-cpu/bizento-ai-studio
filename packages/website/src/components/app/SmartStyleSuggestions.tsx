import { useState } from "react";
import { Sparkles, ArrowRight, SkipForward } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface StyleSuggestion {
  id: string;
  label: string;
  sublabel: string;
  gradient: string;
  description: string;
  tag: string;
}

const STYLE_SUGGESTIONS: StyleSuggestion[] = [
  {
    id: "high-conversion",
    label: "High Conversion Ad Style",
    sublabel: "Proven to drive clicks",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    description: "Dramatic lighting with bold product placement — optimized for maximum click-through rate.",
    tag: "Best for Ads",
  },
  {
    id: "amazon-bestseller",
    label: "Amazon Best Seller Look",
    sublabel: "Marketplace optimized",
    gradient: "linear-gradient(135deg, #f8f9fa 0%, #dee2e6 100%)",
    description: "Clean white backgrounds with perfect shadows. The standard that sells on Amazon and Flipkart.",
    tag: "Marketplace",
  },
  {
    id: "premium-brand",
    label: "Premium Brand Style",
    sublabel: "Luxury positioning",
    gradient: "linear-gradient(135deg, #1a1400 0%, #3d2b00 40%, #7a5500 100%)",
    description: "Gold and marble aesthetic that positions any product as a premium, high-value offering.",
    tag: "Luxury",
  },
  {
    id: "minimal-catalog",
    label: "Minimal Catalog",
    sublabel: "Clean and versatile",
    gradient: "linear-gradient(135deg, #f1f3f5 0%, #ffffff 100%)",
    description: "Crisp minimalist styling that works universally — the reliable choice for any product category.",
    tag: "Universal",
  },
  {
    id: "lifestyle-scene",
    label: "Lifestyle Scene",
    sublabel: "Emotional connection",
    gradient: "linear-gradient(135deg, #f9c74f 0%, #f8961e 40%, #f3722c 100%)",
    description: "Warm, aspirational settings that tell a story and build emotional connection with buyers.",
    tag: "Social Media",
  },
  {
    id: "cinematic-cgi",
    label: "Cinematic CGI",
    sublabel: "Premium visual impact",
    gradient: "linear-gradient(135deg, #03045e 0%, #0077b6 60%, #00b4d8 100%)",
    description: "Hollywood-grade CGI visuals that create a premium, memorable brand experience.",
    tag: "CGI",
  },
  {
    id: "viral-social",
    label: "Viral Social Style",
    sublabel: "Scroll-stopping",
    gradient: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
    description: "Eye-catching colors and bold compositions designed to stop the scroll and drive engagement.",
    tag: "Trending",
  },
];

interface SmartStyleSuggestionsProps {
  open: boolean;
  onSelect: (styleId: string) => void;
  onSkip: () => void;
}

export function SmartStyleSuggestions({ open, onSelect, onSkip }: SmartStyleSuggestionsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    } else {
      onSkip();
    }
    setSelected(null);
  };

  const handleSkip = () => {
    setSelected(null);
    onSkip();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleSkip()}>
      <DialogContent className="max-w-2xl bg-[#111] border border-white/10 rounded-2xl p-0 overflow-hidden">
        <div className="p-5 sm:p-6">
          <DialogHeader className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs text-primary font-medium uppercase tracking-wider">AI Style Recommendation</span>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-foreground leading-snug">
              Choose your visual style
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Select a style preset or skip to let AI choose the best one for your product.
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1 sidebar-scroll">
            {STYLE_SUGGESTIONS.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelected(style.id === selected ? null : style.id)}
                className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 border ${
                  selected === style.id
                    ? "border-primary/50 bg-primary/8"
                    : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                {/* Gradient swatch */}
                <div
                  className="h-12 w-12 rounded-lg shrink-0 flex items-center justify-center"
                  style={{ background: style.gradient }}
                >
                  {selected === style.id && (
                    <div className="h-4 w-4 rounded-full bg-primary/90 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-black" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-foreground leading-snug">{style.label}</p>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
                      style={{
                        background: "rgba(137,233,0,0.12)",
                        color: "#89E900",
                        border: "1px solid rgba(137,233,0,0.2)",
                      }}
                    >
                      {style.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{style.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/8">
            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward className="h-3.5 w-3.5" />
              Skip — AI selects best style
            </button>
            <Button
              onClick={handleConfirm}
              disabled={!selected}
              className="gap-2 rounded-xl px-5"
            >
              {selected ? "Apply Style" : "Select a Style"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
