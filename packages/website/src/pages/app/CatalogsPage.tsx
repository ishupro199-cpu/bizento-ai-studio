import { Download, Trash2, Image as ImageIcon, Coins, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAppContext, type GenerationRecord, type CatalogAttributes } from "@/contexts/AppContext";

function AttributesTable({ attrs }: { attrs: CatalogAttributes }) {
  const rows: { label: string; value: string | null | undefined }[] = [
    { label: "Product Name", value: attrs.productName },
    { label: "Category", value: attrs.category },
    { label: "Color", value: attrs.color },
    { label: "Material", value: attrs.material },
    { label: "Dimensions", value: attrs.dimensions },
    { label: "Weight", value: attrs.weight },
    { label: "Target Audience", value: attrs.targetAudience },
    { label: "Mood / Vibe", value: attrs.mood },
    { label: "Style", value: attrs.style },
  ].filter(r => r.value);

  const features = attrs.features?.filter(Boolean) ?? [];

  if (rows.length === 0 && features.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/8 border-b border-white/8">
        <Tag className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Product Attributes</span>
      </div>
      <table className="w-full text-[10px]">
        <tbody>
          {rows.map(({ label, value }) => (
            <tr key={label} className="border-b border-white/5 last:border-0">
              <td className="px-3 py-1.5 text-muted-foreground/60 font-medium w-2/5">{label}</td>
              <td className="px-3 py-1.5 text-foreground/80">{value}</td>
            </tr>
          ))}
          {features.length > 0 && (
            <tr className="border-b border-white/5 last:border-0">
              <td className="px-3 py-1.5 text-muted-foreground/60 font-medium align-top">Key Features</td>
              <td className="px-3 py-1.5">
                <ul className="space-y-0.5">
                  {features.map((f, i) => (
                    <li key={i} className="text-foreground/80 flex items-start gap-1">
                      <span className="text-primary mt-0.5">·</span> {f}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CatalogCard({ item, onDelete }: { item: GenerationRecord; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const attrs = item.catalogAttributes as CatalogAttributes | undefined;
  const hasAttrs = !!(attrs && (attrs.productName || attrs.color || attrs.material || attrs.features?.length));
  const firstImage = item.imageUrls?.[0];

  return (
    <div className="glass rounded-xl overflow-hidden border border-white/10 hover:border-primary/20 transition-all duration-200">
      <div className="aspect-square flex items-center justify-center relative group" style={{ background: item.gradient }}>
        {firstImage ? (
          <img src={firstImage} alt={item.prompt} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-foreground/15" />
        )}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {firstImage && (
            <a href={firstImage} download target="_blank" rel="noreferrer">
              <Button size="icon" variant="ghost" className="h-8 w-8 glass rounded-lg">
                <Download className="h-4 w-4" />
              </Button>
            </a>
          )}
          <Button size="icon" variant="ghost" className="h-8 w-8 glass rounded-lg"
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {item.imageUrls && item.imageUrls.length > 1 && (
          <span className="absolute top-1.5 right-1.5 text-[8px] bg-black/60 text-white/80 rounded-full px-1.5 py-0.5">
            {item.imageUrls.length} variants
          </span>
        )}
      </div>

      <div className="p-2 sm:p-3 space-y-2">
        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{item.prompt}</p>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="text-[10px] shrink-0">Catalog</Badge>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Coins className="h-3 w-3" />{item.creditsConsumed}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/50">{item.date.toLocaleDateString()}</p>

        {hasAttrs && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/15 text-[10px] text-primary hover:bg-primary/10 transition-colors">
            <span className="font-medium flex items-center gap-1">
              <Tag className="h-2.5 w-2.5" /> Product Attributes
            </span>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}

        {expanded && attrs && <AttributesTable attrs={attrs} />}
      </div>
    </div>
  );
}

export default function CatalogsPage() {
  const { catalogs, deleteGeneration } = useAppContext();

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Catalogs</h1>
        <p className="text-sm text-muted-foreground mt-1">Your generated product catalog images with AI-extracted attributes</p>
      </div>

      {catalogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No catalog images yet. Generate your first product catalog!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {catalogs.map((item) => (
            <CatalogCard key={item.id} item={item} onDelete={deleteGeneration} />
          ))}
        </div>
      )}
    </div>
  );
}
