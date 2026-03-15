import { Gem, Layers, Flower2, LayoutGrid, Zap, Palmtree } from "lucide-react";

const styles = [
  { id: "luxury", name: "Luxury Studio", icon: Gem, color: "hsl(45, 80%, 60%)" },
  { id: "marble", name: "Marble Scene", icon: Layers, color: "hsl(0, 0%, 75%)" },
  { id: "floral", name: "Floral Background", icon: Flower2, color: "hsl(330, 60%, 65%)" },
  { id: "minimal", name: "Minimal Catalog", icon: LayoutGrid, color: "hsl(0, 0%, 90%)" },
  { id: "neon", name: "Neon Futuristic", icon: Zap, color: "hsl(270, 80%, 65%)" },
  { id: "beach", name: "Beach Lifestyle", icon: Palmtree, color: "hsl(195, 70%, 55%)" },
];

interface StyleSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function StyleSelector({ selected, onSelect }: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Choose a style</p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={`glass rounded-xl p-4 min-w-[130px] text-left transition-all duration-200 cursor-pointer group shrink-0 ${
              selected === style.id
                ? "border-primary bg-primary/10"
                : "hover:bg-[hsl(var(--glass-hover))]"
            }`}
          >
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${style.color}20` }}
            >
              <style.icon className="h-4 w-4" style={{ color: style.color }} />
            </div>
            <p className="text-sm font-medium text-foreground">{style.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
