import { Sparkles, Bell, Zap, ChevronDown, Crown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/contexts/AppContext";

const models = [
  { id: "flash" as const, name: "Pixa Flash", desc: "Fast generation (1 credit)", icon: Zap },
  { id: "pro" as const, name: "Pixa Pro", desc: "Highest quality (2 credits)", icon: Sparkles },
];

interface TopNavbarProps {
  onMenuToggle?: () => void;
}

export function TopNavbar({ onMenuToggle }: TopNavbarProps) {
  const { selectedModel, setSelectedModel, user, setShowUpgradeModal } = useAppContext();
  const currentModel = models.find((m) => m.id === selectedModel) || models[0];

  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-4 sticky top-0 z-20 backdrop-blur-[10px] bg-transparent">
      <div className="flex items-center gap-2 sm:gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors sm:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="glass gap-2 h-9 px-3 rounded-lg hover:bg-white/8 border-white/10"
            >
              <currentModel.icon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-sm font-medium truncate max-w-[110px] sm:max-w-none">
                {currentModel.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-popover border-[hsl(var(--glass-border))]">
            {models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`flex flex-col items-start gap-0.5 cursor-pointer rounded-lg ${
                  selectedModel === model.id ? "bg-primary/10" : "hover:bg-white/5"
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
        <div className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium">{user.creditsRemaining}</span>
          <span className="hidden sm:inline text-muted-foreground">credits</span>
        </div>

        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 text-xs font-semibold hidden sm:flex"
          onClick={() => setShowUpgradeModal(true)}
        >
          Upgrade
        </Button>

        <button className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
