import { Download, RefreshCw, Trash2, Image as ImageIcon, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAppContext, GenerationRecord } from "@/contexts/AppContext";

const FILTERS = ["All", "Generate Catalog", "Product Photography", "Cinematic Ads", "Ad Creatives"];

interface LibraryPageProps {
  title: string;
  description: string;
  dataSource: "all" | "catalogs" | "ads";
}

export default function ImageGridPage({ title, description, dataSource = "all" }: LibraryPageProps) {
  const { allImages, catalogs, ads, deleteGeneration } = useAppContext();
  const [activeFilter, setActiveFilter] = useState("All");

  const sourceData: GenerationRecord[] = dataSource === "catalogs" ? catalogs : dataSource === "ads" ? ads : allImages;

  const filtered = activeFilter === "All"
    ? sourceData
    : sourceData.filter((img) => img.tool === activeFilter);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {dataSource === "all" && (
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              onClick={() => setActiveFilter(f)}
              className={`glass rounded-lg text-xs sm:text-sm h-8 ${
                activeFilter === f ? "bg-primary/10 text-primary border-primary" : ""
              }`}
            >
              {f}
            </Button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No images yet. Start generating!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((img) => (
            <div key={img.id} className="glass rounded-xl overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-200">
              <div className="aspect-square flex items-center justify-center relative" style={{ background: img.gradient }}>
                <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-foreground/15" />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 glass rounded-lg"><Download className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 glass rounded-lg"><RefreshCw className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 glass rounded-lg" onClick={(e) => { e.stopPropagation(); deleteGeneration(img.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-2 sm:p-3 space-y-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{img.prompt}</p>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-[10px] shrink-0">{img.tool}</Badge>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Coins className="h-3 w-3" />{img.creditsConsumed}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/60">{img.date.toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
