import { X, Clock, Sparkles } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

export function HistoryPanel({ open, onClose }: HistoryPanelProps) {
  const { generations } = useAppContext();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[hsl(var(--sidebar-background))] border-l border-[hsl(var(--sidebar-border))] z-50 flex flex-col transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Generation History</h2>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {generations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
              <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No generations yet.</p>
              <p className="text-xs text-muted-foreground/60">Your creations will appear here.</p>
            </div>
          ) : (
            generations.map((gen) => (
              <div
                key={gen.id}
                className="flex items-start gap-3 rounded-2xl p-3 hover:bg-white/5 transition-colors cursor-pointer"
              >
                {/* Thumbnail placeholder */}
                <div
                  className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center"
                  style={{ background: gen.gradient || "linear-gradient(135deg,#89E900,#222)" }}
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
