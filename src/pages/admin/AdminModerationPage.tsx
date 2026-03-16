import { Image as ImageIcon, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const GRADIENTS = [
  "linear-gradient(135deg, hsl(85 100% 45% / 0.25), hsl(200 80% 40% / 0.15))",
  "linear-gradient(135deg, hsl(280 60% 50% / 0.25), hsl(85 100% 45% / 0.15))",
  "linear-gradient(135deg, hsl(30 80% 50% / 0.25), hsl(350 60% 50% / 0.15))",
  "linear-gradient(135deg, hsl(195 70% 50% / 0.25), hsl(85 100% 45% / 0.15))",
  "linear-gradient(135deg, hsl(45 80% 60% / 0.25), hsl(30 60% 40% / 0.15))",
  "linear-gradient(135deg, hsl(330 60% 50% / 0.25), hsl(280 50% 40% / 0.15))",
];

const statuses = ["Approved", "Pending", "Flagged"] as const;

const initialItems = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  user: ["jane@example.com", "mike@example.com", "alex@example.com"][i % 3],
  prompt: `Generated image ${i + 1}`,
  status: statuses[i % 3],
  gradient: GRADIENTS[i % GRADIENTS.length],
}));

export default function AdminModerationPage() {
  const [items, setItems] = useState(initialItems);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Content Moderation</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="glass rounded-xl overflow-hidden">
            <div className="aspect-square flex items-center justify-center" style={{ background: item.gradient }}>
              <ImageIcon className="h-10 w-10 text-foreground/15" />
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground truncate">{item.user}</p>
                <Badge
                  variant={item.status === "Approved" ? "default" : item.status === "Flagged" ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  {item.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.prompt}</p>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7 text-destructive hover:text-destructive"
                onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
