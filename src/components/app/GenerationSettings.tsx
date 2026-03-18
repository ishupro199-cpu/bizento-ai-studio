import { Settings2, Lock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface GenSettings {
  aspectRatio: string;
  numOutputs: number;
  quality: string;
}

interface GenerationSettingsProps {
  settings: GenSettings;
  onChange: (s: GenSettings) => void;
  isPro: boolean;
}

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1", desc: "Square" },
  { id: "4:5", label: "4:5", desc: "Portrait" },
  { id: "16:9", label: "16:9", desc: "Landscape" },
  { id: "9:16", label: "9:16", desc: "Story" },
  { id: "3:2", label: "3:2", desc: "Standard" },
];

const QUALITIES = [
  { id: "720p", label: "720p", pro: false },
  { id: "1K", label: "1K", pro: false },
  { id: "2K", label: "2K", pro: true },
  { id: "4K", label: "4K", pro: true },
];

export function GenerationSettings({ settings, onChange, isPro }: GenerationSettingsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          title="Generation Settings"
          className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground mb-0.5"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        className="w-72 p-4 rounded-2xl bg-popover border border-white/10 space-y-5"
      >
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Generation Settings</p>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Aspect Ratio</p>
          <div className="flex flex-wrap gap-1.5">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.id}
                onClick={() => onChange({ ...settings, aspectRatio: ar.id })}
                className={`flex flex-col items-center px-3 py-1.5 rounded-lg text-xs transition-all duration-150 border ${
                  settings.aspectRatio === ar.id
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8 hover:text-foreground"
                }`}
              >
                <span className="font-semibold">{ar.label}</span>
                <span className="text-[9px] opacity-60">{ar.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Number of Outputs */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Number of Outputs</p>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => onChange({ ...settings, numOutputs: n })}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150 border ${
                  settings.numOutputs === n
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8 hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Image Quality */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Image Quality</p>
          <div className="grid grid-cols-2 gap-1.5">
            {QUALITIES.map((q) => {
              const locked = q.pro && !isPro;
              const isActive = settings.quality === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    if (!locked) onChange({ ...settings, quality: q.id });
                  }}
                  disabled={locked}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-150 border ${
                    locked
                      ? "bg-white/3 text-muted-foreground/30 border-white/5 cursor-not-allowed"
                      : isActive
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8 hover:text-foreground"
                  }`}
                >
                  <span className="font-semibold">{q.label}</span>
                  {locked ? (
                    <span className="flex items-center gap-0.5 text-[9px] text-amber-500/70">
                      <Lock className="h-2.5 w-2.5" /> Pro
                    </span>
                  ) : (
                    <span className="text-[9px] opacity-50">Free</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
