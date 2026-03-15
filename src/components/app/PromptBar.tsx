import { Plus, Send, ChevronUp, Camera, Clapperboard, LayoutGrid, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AISuggestions } from "./AISuggestions";
import { useRef } from "react";

const tools = [
  { id: "catalog", name: "Generate Catalog", desc: "Professional ecommerce product images", icon: LayoutGrid },
  { id: "photo", name: "Product Photography", desc: "Studio-quality product scenes", icon: Camera },
  { id: "cinematic", name: "Cinematic Ads", desc: "CGI-style cinematic product ads", icon: Clapperboard },
  { id: "creative", name: "Ad Creatives", desc: "Social media ad designs", icon: Megaphone },
];

interface PromptBarProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  disabled?: boolean;
}

export function PromptBar({ prompt, onPromptChange, onGenerate, disabled }: PromptBarProps) {
  const selectedTool = tools[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && prompt.trim()) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="sticky bottom-0 p-4 pt-2 space-y-2">
      <div className="max-w-4xl mx-auto">
        <AISuggestions onSelect={onPromptChange} />
      </div>
      <div className="glass rounded-2xl p-2 flex items-center gap-2 max-w-4xl mx-auto glow-accent">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass-hover))]"
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus className="h-5 w-5" />
        </Button>

        <input
          type="text"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the product scene you want to create..."
          className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground px-2"
          disabled={disabled}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-1.5 px-3 rounded-xl text-sm text-muted-foreground hover:text-foreground"
            >
              <selectedTool.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{selectedTool.name}</span>
              <ChevronUp className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-64 bg-popover border-[hsl(var(--glass-border))]">
            {tools.map((tool) => (
              <DropdownMenuItem
                key={tool.id}
                className="flex items-start gap-3 cursor-pointer py-2.5"
              >
                <tool.icon className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">{tool.name}</p>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!prompt.trim() || disabled}
          onClick={onGenerate}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
