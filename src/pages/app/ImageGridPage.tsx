import { Download, RefreshCw, Edit3, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockImages = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  prompt: `Generated product image ${i + 1}`,
}));

interface ImageGridPageProps {
  title: string;
  description: string;
}

export default function ImageGridPage({ title, description }: ImageGridPageProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["All", "Recent", "Favorites"].map((f) => (
          <Button key={f} variant="ghost" size="sm" className="glass rounded-lg text-sm h-8">
            {f}
          </Button>
        ))}
      </div>

      {mockImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No images yet. Start generating!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockImages.map((img) => (
            <div
              key={img.id}
              className="glass rounded-xl overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-200"
            >
              <div className="aspect-square bg-secondary/30 flex items-center justify-center relative">
                <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
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
              <div className="p-3">
                <p className="text-xs text-muted-foreground truncate">{img.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
