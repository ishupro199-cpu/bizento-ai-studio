import { Download, RefreshCw, Edit3, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface MockImage {
  id: number;
  prompt: string;
  tool: string;
  date: string;
  gradient: string;
}

const GRADIENTS = [
  "linear-gradient(135deg, hsl(85 100% 45% / 0.25), hsl(200 80% 40% / 0.15))",
  "linear-gradient(135deg, hsl(280 60% 50% / 0.25), hsl(85 100% 45% / 0.15))",
  "linear-gradient(135deg, hsl(30 80% 50% / 0.25), hsl(350 60% 50% / 0.15))",
  "linear-gradient(135deg, hsl(195 70% 50% / 0.25), hsl(85 100% 45% / 0.15))",
  "linear-gradient(135deg, hsl(45 80% 60% / 0.25), hsl(30 60% 40% / 0.15))",
  "linear-gradient(135deg, hsl(330 60% 50% / 0.25), hsl(280 50% 40% / 0.15))",
];

const TOOLS = ["Catalog", "Photography", "Cinematic Ad", "Ad Creative"];

interface ImageGridPageProps {
  title: string;
  description: string;
  defaultFilter?: string;
  mockData?: MockImage[];
}

function generateMockData(count: number, toolFilter?: string): MockImage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    prompt: `Generated product image ${i + 1}`,
    tool: toolFilter || TOOLS[i % TOOLS.length],
    date: new Date(Date.now() - i * 3600000).toLocaleDateString(),
    gradient: GRADIENTS[i % GRADIENTS.length],
  }));
}

const FILTERS = ["All", "Catalog", "Photography", "Cinematic Ad", "Ad Creative"];

export default function ImageGridPage({ title, description, defaultFilter, mockData }: ImageGridPageProps) {
  const [activeFilter, setActiveFilter] = useState(defaultFilter || "All");
  const images = mockData || generateMockData(6, defaultFilter === "All" ? undefined : defaultFilter);

  const filtered = activeFilter === "All"
    ? images
    : images.filter((img) => img.tool === activeFilter);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <Button
            key={f}
            variant="ghost"
            size="sm"
            onClick={() => setActiveFilter(f)}
            className={`glass rounded-lg text-sm h-8 ${
              activeFilter === f ? "bg-primary/10 text-primary border-primary" : ""
            }`}
          >
            {f}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No images yet. Start generating!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((img) => (
            <div
              key={img.id}
              className="glass rounded-xl overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-200"
            >
              <div
                className="aspect-square flex items-center justify-center relative"
                style={{ background: img.gradient }}
              >
                <ImageIcon className="h-10 w-10 text-foreground/15" />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="ghost" className="h-9 w-9 glass rounded-lg">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 glass rounded-lg">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 glass rounded-lg">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground truncate">{img.prompt}</p>
                <Badge variant="secondary" className="text-[10px] shrink-0">{img.tool}</Badge>
              </div>
              <div className="px-3 pb-2">
                <p className="text-[10px] text-muted-foreground/60">{img.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
