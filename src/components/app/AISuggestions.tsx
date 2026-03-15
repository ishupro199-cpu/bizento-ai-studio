import { Sparkles } from "lucide-react";

const suggestions = [
  "Luxury perfume bottle on marble with golden light",
  "Minimal white background catalog shot",
  "Floral skincare product photography",
  "Sneaker on neon gradient background",
  "Watch with water splash cinematic ad",
  "Organic food packaging studio shot",
];

interface AISuggestionsProps {
  onSelect: (prompt: string) => void;
}

export function AISuggestions({ onSelect }: AISuggestionsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="glass rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass-hover))] transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
