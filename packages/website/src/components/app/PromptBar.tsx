import { Plus, Send, ChevronUp, Camera, Clapperboard, LayoutGrid, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AISuggestions } from "./AISuggestions";
import { useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useImageUpload } from "@/hooks/useImageUpload";

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
  const [selectedTool, setSelectedTool] = useState(tools[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, progress: uploadProgress, previewUrl, clearUpload } = useImageUpload();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && prompt.trim()) {
      e.preventDefault();
      onGenerate();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await upload(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="sticky bottom-0 p-3 sm:p-4 pt-2 space-y-2">
      <div className="max-w-4xl mx-auto">
        <AISuggestions onSelect={onPromptChange} />
      </div>

      {/* Upload preview */}
      {previewUrl && (
        <div className="max-w-4xl mx-auto flex items-center gap-2 glass rounded-xl px-3 py-2">
          <img src={previewUrl} alt="Upload" className="h-10 w-10 rounded-lg object-cover" />
          <span className="text-xs text-muted-foreground flex-1 truncate">Image attached</span>
          {uploading && <Progress value={uploadProgress} className="w-20 h-1.5" />}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearUpload}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="glass rounded-2xl p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 max-w-4xl mx-auto glow-accent">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass-hover))]"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Plus className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 sm:h-10 gap-1.5 px-2 sm:px-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground shrink-0"
            >
              <selectedTool.icon className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline text-xs">Tools</span>
              <ChevronUp className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-64 bg-popover border-[hsl(var(--glass-border))]">
            {tools.map((tool) => (
              <DropdownMenuItem
                key={tool.id}
                className={`flex items-start gap-3 cursor-pointer py-2.5 ${
                  selectedTool.id === tool.id ? "bg-primary/10" : ""
                }`}
                onClick={() => setSelectedTool(tool)}
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

        <input
          type="text"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the product scene..."
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground px-1 sm:px-2"
          disabled={disabled}
        />

        <Button
          size="icon"
          className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!prompt.trim() || disabled || uploading}
          onClick={onGenerate}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
