import { Brain, ChevronDown, ChevronUp, Zap, Target, Lightbulb } from "lucide-react";
import { useState } from "react";

interface BrainInsightsData {
  tool: string;
  toolName: string;
  confidence: number;
  reasoning: string;
  suggestion: string;
  productType?: string;
  productCategory?: string;
  styleRecommendation?: string;
  hinglishDetected?: boolean;
  source?: string;
  imageAnalysis?: { description?: string; colors?: string[]; material?: string };
}

interface BrainInsightsProps {
  data: BrainInsightsData;
  compact?: boolean;
}

const TOOL_COLORS: Record<string, string> = {
  catalog:  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  photo:    "text-purple-400 bg-purple-500/10 border-purple-500/20",
  creative: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  cinematic:"text-pink-400 bg-pink-500/10 border-pink-500/20",
};

const TOOL_ICONS: Record<string, string> = {
  catalog: "🛒",
  photo: "📸",
  creative: "🎯",
  cinematic: "🎬",
};

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-primary" : pct >= 60 ? "bg-yellow-500" : "bg-orange-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground w-7 text-right">{pct}%</span>
    </div>
  );
}

export function BrainInsights({ data, compact = false }: BrainInsightsProps) {
  const [expanded, setExpanded] = useState(false);
  const toolColor = TOOL_COLORS[data.tool] || TOOL_COLORS.catalog;
  const toolIcon = TOOL_ICONS[data.tool] || "🛒";
  const pct = Math.round(data.confidence * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${toolColor}`}>
          <Brain className="h-3 w-3" />
          <span>AI → {data.toolName}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
          <Zap className="h-3 w-3" />
          <span>{pct}% confident</span>
        </div>
        {data.suggestion && (
          <span className="text-[11px] text-muted-foreground italic truncate max-w-[200px]">{data.suggestion}</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Brain className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-foreground">AI Brain Analysis</span>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${toolColor}`}>
                <span>{toolIcon}</span>
                <span>{data.toolName}</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{data.suggestion}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-primary font-medium hidden sm:block">{pct}%</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/6 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">Selected Tool</p>
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium w-fit ${toolColor}`}>
                <span>{toolIcon}</span>
                <span>{data.toolName}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">Confidence</p>
              <ConfidenceBar value={data.confidence} />
            </div>
          </div>

          {data.productType && data.productType !== "product" && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">Detected Product</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-white/5 border border-white/8 rounded-full px-2.5 py-1 capitalize">
                  {data.productType}
                </span>
                {data.productCategory && (
                  <span className="text-xs text-muted-foreground">{data.productCategory}</span>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider flex items-center gap-1">
              <Target className="h-3 w-3" /> Reasoning
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{data.reasoning}</p>
          </div>

          {data.imageAnalysis?.description && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">Image Analysis</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{data.imageAnalysis.description}</p>
              {data.imageAnalysis.colors && data.imageAnalysis.colors.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.imageAnalysis.colors.slice(0, 4).map(c => (
                    <span key={c} className="text-[10px] bg-white/5 border border-white/8 rounded-full px-2 py-0.5 capitalize">{c}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="h-3 w-3" /> Suggestion
            </p>
            <p className="text-xs text-primary/80 italic">{data.suggestion}</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
              <Brain className="h-3 w-3" />
              <span>Source: {data.source === "ai" ? "Gemini AI" : "Keyword Analysis"}</span>
            </div>
            {data.hinglishDetected && (
              <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full px-2 py-0.5">
                Hinglish detected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
