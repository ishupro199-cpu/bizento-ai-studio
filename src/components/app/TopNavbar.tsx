import { Sparkles, Bell, HelpCircle, Zap, ChevronDown, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/contexts/AppContext";

const models = [
  { id: "flash" as const, name: "Nano Bana Flash", desc: "Fast generation (1 credit)", icon: Zap },
  { id: "pro" as const, name: "Nano Bana Pro", desc: "Highest quality (2 credits)", icon: Sparkles },
];

export function TopNavbar() {
  const { selectedModel, setSelectedModel, user, setShowUpgradeModal } = useAppContext();
  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-4 border-b border-[hsl(var(--glass-border))]">
      <div className="flex items-center gap-2 sm:gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="glass gap-1.5 sm:gap-2 h-9 px-2.5 sm:px-3 rounded-lg">
              <currentModel.icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">{currentModel.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-popover border-[hsl(var(--glass-border))]">
            {models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`flex flex-col items-start gap-0.5 cursor-pointer ${
                  selectedModel === model.id ? "bg-primary/10" : ""
                }`}
              >
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <model.icon className="h-3.5 w-3.5" />
                  {model.name}
                  {model.id === "pro" && <Crown className="h-3 w-3 text-primary" />}
                </span>
                <span className="text-xs text-muted-foreground">{model.desc}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="glass rounded-lg px-2 sm:px-3 py-1.5 flex items-center gap-1.5 sm:gap-2">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs sm:text-sm font-medium">{user.creditsRemaining}</span>
          <span className="hidden sm:inline text-xs sm:text-sm font-medium">credits</span>
        </div>

        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 text-xs font-semibold hidden sm:flex" onClick={() => setShowUpgradeModal(true)}>
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
