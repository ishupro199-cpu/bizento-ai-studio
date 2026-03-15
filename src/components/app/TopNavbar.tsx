import { Sparkles, Bell, HelpCircle, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const models = [
  { id: "flash", name: "Nano Bana Flash", desc: "Fast generation" },
  { id: "pro", name: "Nano Bana Pro", desc: "Highest quality" },
];

export function TopNavbar() {
  const [selectedModel, setSelectedModel] = useState(models[0]);

  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-4 border-b border-[hsl(var(--glass-border))]">
      <div className="flex items-center gap-2 sm:gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="glass gap-1.5 sm:gap-2 h-9 px-2.5 sm:px-3 rounded-lg">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">{selectedModel.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-popover border-[hsl(var(--glass-border))]">
            {models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`flex flex-col items-start gap-0.5 cursor-pointer ${
                  selectedModel.id === model.id ? "bg-primary/10" : ""
                }`}
              >
                <span className="text-sm font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">{model.desc}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="glass rounded-lg px-2 sm:px-3 py-1.5 flex items-center gap-1.5 sm:gap-2">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs sm:text-sm font-medium">250</span>
          <span className="hidden sm:inline text-xs sm:text-sm font-medium">credits</span>
        </div>

        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 text-xs font-semibold hidden sm:flex">
          Upgrade
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
