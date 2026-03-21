import { X, Clock, Sparkles, ArrowLeft } from "lucide-react";
import { useAppContext, GenerationRecord } from "@/contexts/AppContext";

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
  selectedId?: string | null;
}

export function HistoryPanel({ open, onClose, selectedId }: HistoryPanelProps) {
  const { generations } = useAppContext();
  const selected: GenerationRecord | undefined = selectedId
    ? generations.find((g) => g.id === selectedId)
    : undefined;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[hsl(var(--sidebar-background))] border-l border-[hsl(var(--sidebar-border))] z-50 flex flex-col transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--sidebar-border))] shrink-0">
          <div className="flex items-center gap-2">
            {selected && (
              <button
                onClick={onClose}
                className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors mr-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {selected ? selected.tool : "Generation History"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {selected ? (
            /* Detail view for a selected generation */
            <div className="space-y-4 p-2">
              {/* Gradient thumbnail */}
              <div
                className="w-full aspect-square rounded-xl flex items-center justify-center"
                style={{ background: selected.gradient || "linear-gradient(135deg,#89E900 0%,#222 100%)" }}
              >
                <Sparkles className="h-10 w-10 text-white/40" />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Prompt</p>
                  <p className="text-sm text-foreground leading-relaxed">{selected.prompt}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tool</p>
                    <p className="text-sm text-foreground">{selected.tool}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Style</p>
                    <p className="text-sm text-foreground capitalize">{selected.style}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Model</p>
                    <p className="text-sm text-foreground">{selected.model === "flash" ? "Pixa Flash" : "Pixa Pro"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Credits</p>
                    <p className="text-sm text-foreground">{selected.creditsConsumed}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm text-foreground">
                    {selected.date instanceof Date
                      ? selected.date.toLocaleString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          ) : generations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
              <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No generations yet.</p>
              <p className="text-xs text-muted-foreground/60">Your creations will appear here.</p>
            </div>
          ) : (
            /* List view */
            generations.map((gen) => (
              <div
                key={gen.id}
                className="flex items-start gap-3 rounded-xl p-3 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div
                  className="h-11 w-11 shrink-0 rounded-lg flex items-center justify-center"
                  style={{ background: gen.gradient || "linear-gradient(135deg,#89E900 0%,#222 100%)" }}
                >
                  <Sparkles className="h-4 w-4 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">{gen.tool}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{gen.prompt}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {gen.date instanceof Date
                      ? gen.date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
