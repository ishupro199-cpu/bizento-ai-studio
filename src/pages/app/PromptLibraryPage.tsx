import { BookOpen, Copy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = ["All", "Product", "Lifestyle", "Cinematic", "Minimal", "Luxury"];

const prompts = [
  { id: 1, text: "Luxury perfume bottle on marble surface with golden hour lighting", category: "Luxury", uses: 1240 },
  { id: 2, text: "Minimal white background catalog shot with soft shadows", category: "Minimal", uses: 980 },
  { id: 3, text: "Skincare product surrounded by fresh flowers and petals", category: "Product", uses: 870 },
  { id: 4, text: "Sneaker floating on neon gradient background with particles", category: "Cinematic", uses: 1560 },
  { id: 5, text: "Watch with water splash effect cinematic advertisement", category: "Cinematic", uses: 2100 },
  { id: 6, text: "Organic food packaging on rustic wooden table outdoor setting", category: "Lifestyle", uses: 640 },
  { id: 7, text: "Headphones on concrete surface with moody studio lighting", category: "Product", uses: 750 },
  { id: 8, text: "Sunglasses on beach sand with ocean waves in background", category: "Lifestyle", uses: 920 },
  { id: 9, text: "Lipstick collection arranged in geometric pattern minimal style", category: "Minimal", uses: 510 },
  { id: 10, text: "Coffee bag product shot with steam and beans scattered around", category: "Product", uses: 1100 },
  { id: 11, text: "Diamond ring on velvet cushion with dramatic spotlight", category: "Luxury", uses: 1800 },
  { id: 12, text: "Smartphone floating with holographic UI elements around it", category: "Cinematic", uses: 1350 },
];

export default function PromptLibraryPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? prompts
    : prompts.filter((p) => p.category === activeCategory);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied to clipboard!");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Prompt Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and use curated prompts for stunning product visuals</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((c) => (
          <Button
            key={c}
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory(c)}
            className={`glass rounded-lg text-xs sm:text-sm h-8 ${
              activeCategory === c ? "bg-primary/10 text-primary border-primary" : ""
            }`}
          >
            {c}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="glass rounded-xl p-4 space-y-3 hover:border-primary/30 transition-all duration-200 group"
          >
            <p className="text-sm text-foreground leading-relaxed">{p.text}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
                <span className="text-[10px] text-muted-foreground">{p.uses.toLocaleString()} uses</span>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => handleCopy(p.text)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
