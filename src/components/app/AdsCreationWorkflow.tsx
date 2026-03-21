import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AdsCreationAnalyzeResponse,
  AdsCreationBuildResponse,
  AdsCopyVersion1,
  AdsCopyVersion2,
  AdsCopyVersion3,
} from "@/lib/generationApi";
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Star,
  Hash,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

// ── Marketing Brief Cards ─────────────────────────────────────────────────────
export function MarketingBriefCards({ data }: { data: AdsCreationAnalyzeResponse }) {
  const a = data.analysis;
  const cards = [
    { icon: "🏷️", label: "Product", value: a.product_name || "Analyzing..." },
    { icon: "👥", label: "Target Audience", value: a.target_audience || "Detecting..." },
    { icon: "⭐", label: "Core USP", value: a.primary_usp || "Identifying..." },
    { icon: "🎯", label: "Best Hook", value: a.best_hook_style || "Optimizing..." },
    { icon: "📱", label: "Best Platform", value: (a.platform_fit?.[0] || "instagram").charAt(0).toUpperCase() + (a.platform_fit?.[0] || "instagram").slice(1) },
  ];

  return (
    <div className="px-4 sm:px-6 space-y-4 animate-fade-in">
      <div className="text-center py-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 via-primary/20 to-blue-500/20 border border-white/10 mb-3">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Marketing Brief Ready</h2>
        <p className="text-[11px] text-muted-foreground/60 mt-1">AI ne aapke product ko deep analyze kiya</p>
      </div>

      <div className="grid gap-2">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12, duration: 0.35 }}
            className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/8"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <span className="text-lg shrink-0">{card.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-semibold">{card.label}</p>
              <p className="text-sm font-medium text-foreground truncate">{card.value}</p>
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          </motion.div>
        ))}
      </div>

      {a.seasonal_relevance && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-xl px-4 py-3 border border-amber-500/20 flex items-center gap-3"
          style={{ background: "rgba(245,158,11,0.06)" }}
        >
          <span className="text-xl">🎉</span>
          <div>
            <p className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-wider">Festival Opportunity</p>
            <p className="text-xs text-foreground/80">{a.seasonal_relevance} — special version available!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Platform Picker ────────────────────────────────────────────────────────────
interface PlatformPickerProps {
  data: AdsCreationAnalyzeResponse;
  selectedPlatform: string;
  selectedFormat: string;
  onSelect: (platformId: string, formatId: string) => void;
  onNext: () => void;
}

export function PlatformPicker({ data, selectedPlatform, selectedFormat, onSelect, onNext }: PlatformPickerProps) {
  const platforms = data.platforms || data.allPlatforms || [];

  return (
    <div className="px-4 sm:px-6 space-y-5 animate-fade-in">
      <div>
        <h3 className="text-sm font-bold text-foreground">Platform & Format</h3>
        <p className="text-[11px] text-muted-foreground/60 mt-0.5">Kahan post karoge? Top 2 platforms AI ne recommend kiye hain</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {platforms.map((platform) => {
          const isSelected = selectedPlatform === platform.id;
          return (
            <button
              key={platform.id}
              onClick={() => onSelect(platform.id, platform.formats[0]?.id || "")}
              className={`relative rounded-xl border p-3 text-left transition-all duration-150 ${
                isSelected ? "border-primary/60 shadow-[0_0_0_1px_rgba(137,233,0,0.3)]" : "border-white/8 hover:border-white/20"
              }`}
              style={{ background: isSelected ? "rgba(137,233,0,0.06)" : "rgba(255,255,255,0.02)" }}
            >
              {platform.recommended && (
                <div className="absolute -top-2 right-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold"
                  style={{ background: "rgba(137,233,0,0.15)", color: "#89E900", border: "1px solid rgba(137,233,0,0.3)" }}>
                  <Star className="h-2.5 w-2.5 fill-current" /> Recommended
                </div>
              )}
              <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-2 text-sm"
                style={{ background: platform.gradient }}>
                {platform.icon}
              </div>
              <p className="text-xs font-bold text-foreground">{platform.label}</p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">{platform.formats.length} format{platform.formats.length > 1 ? "s" : ""}</p>
            </button>
          );
        })}
      </div>

      {selectedPlatform && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Format</p>
          <div className="flex flex-wrap gap-2">
            {platforms
              .find(p => p.id === selectedPlatform)
              ?.formats.map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => onSelect(selectedPlatform, fmt.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedFormat === fmt.id
                      ? "border-primary/50 text-primary font-semibold"
                      : "border-white/10 text-muted-foreground/70 hover:border-white/25"
                  }`}
                  style={{ background: selectedFormat === fmt.id ? "rgba(137,233,0,0.08)" : "rgba(255,255,255,0.02)" }}
                >
                  {fmt.label}
                </button>
              ))}
          </div>
        </motion.div>
      )}

      <Button
        className="w-full h-10 rounded-xl bg-primary text-black font-bold gap-2"
        onClick={onNext}
        disabled={!selectedPlatform}
      >
        Continue <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ── Campaign Config ────────────────────────────────────────────────────────────
interface CampaignConfigProps {
  data: AdsCreationAnalyzeResponse;
  selectedGoal: string;
  selectedTone: string;
  selectedLanguage: string;
  onGoalChange: (g: string) => void;
  onToneChange: (t: string) => void;
  onLanguageChange: (l: string) => void;
  onGenerate: () => void;
  onBack: () => void;
}

export function CampaignConfig({
  data, selectedGoal, selectedTone, selectedLanguage,
  onGoalChange, onToneChange, onLanguageChange, onGenerate, onBack,
}: CampaignConfigProps) {
  const goals = data.campaignGoals || [];
  const tones = data.adTones || [];

  return (
    <div className="px-4 sm:px-6 space-y-6 animate-fade-in">
      <div>
        <h3 className="text-sm font-bold text-foreground">Campaign Configuration</h3>
        <p className="text-[11px] text-muted-foreground/60 mt-0.5">Campaign ka goal aur tone choose karo</p>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Campaign Goal</p>
        <div className="grid grid-cols-2 gap-2">
          {goals.map(goal => (
            <button
              key={goal.id}
              onClick={() => onGoalChange(goal.id)}
              className={`rounded-xl border p-3 text-left transition-all ${
                selectedGoal === goal.id ? "border-primary/50" : "border-white/8 hover:border-white/20"
              }`}
              style={{ background: selectedGoal === goal.id ? "rgba(137,233,0,0.06)" : "rgba(255,255,255,0.02)" }}
            >
              <span className="text-base">{goal.icon}</span>
              <p className="text-xs font-bold text-foreground mt-1">{goal.label}</p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5 leading-snug">{goal.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Ad Tone</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {tones.map(tone => (
            <button
              key={tone.id}
              onClick={() => onToneChange(tone.id)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                selectedTone === tone.id ? "border-primary/50" : "border-white/8 hover:border-white/20"
              }`}
              style={{ background: selectedTone === tone.id ? "rgba(137,233,0,0.06)" : "rgba(255,255,255,0.02)" }}
            >
              <span className="text-sm">{tone.icon}</span>
              <p className="text-[11px] font-bold text-foreground mt-1">{tone.label}</p>
              <p className="text-[9px] text-muted-foreground/50 leading-snug mt-0.5">{tone.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Copy Language</p>
        <div className="flex gap-2">
          {[
            { id: "hinglish", label: "Hinglish 🇮🇳", desc: "Best for Indian market" },
            { id: "hindi", label: "Hindi", desc: "Pure Hindi" },
            { id: "english", label: "English", desc: "International" },
          ].map(lang => (
            <button
              key={lang.id}
              onClick={() => onLanguageChange(lang.id)}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-center transition-all ${
                selectedLanguage === lang.id ? "border-primary/50" : "border-white/8 hover:border-white/20"
              }`}
              style={{ background: selectedLanguage === lang.id ? "rgba(137,233,0,0.06)" : "rgba(255,255,255,0.02)" }}
            >
              <p className="text-xs font-bold text-foreground">{lang.label}</p>
              <p className="text-[9px] text-muted-foreground/50 mt-0.5">{lang.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-none h-10 px-4 rounded-xl border-white/15 text-muted-foreground" onClick={onBack}>
          Back
        </Button>
        <Button className="flex-1 h-10 rounded-xl bg-primary text-black font-bold gap-2" onClick={onGenerate}>
          <Sparkles className="h-4 w-4" /> Generate Campaign
        </Button>
      </div>
    </div>
  );
}

// ── Generating Animation ──────────────────────────────────────────────────────
const LOADING_TEXTS = [
  "Aapke product ka marketing brief taiyaar ho raha hai...",
  "Target audience identify ki ja rahi hai...",
  "3 ad copy versions likh rahe hain...",
  "Ad creative design ho raha hai...",
  "Hashtag strategy build ho rahi hai...",
  "Platform-specific formats optimize ho rahe hain...",
  "Final touch-ups chal rahe hain...",
  "Bas kuch seconds aur...",
];

export function AdsGeneratingAnimation({ step }: { step: number }) {
  const text = LOADING_TEXTS[step % LOADING_TEXTS.length];
  const bars = [
    { label: "Ad Creative", color: "#89E900" },
    { label: "Copy Writing", color: "#60a5fa" },
    { label: "Hashtags + Extras", color: "#f472b6" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-8 px-4 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
        <div className="relative h-16 w-16 rounded-full border-2 border-primary/60 flex items-center justify-center"
          style={{ background: "rgba(137,233,0,0.08)" }}>
          <Sparkles className="h-7 w-7 text-primary animate-pulse" />
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {bars.map((bar, i) => (
          <div key={bar.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground/60 font-medium">{bar.label}</span>
              <span className="text-[10px] text-muted-foreground/40">Generating...</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: bar.color }}
                initial={{ width: "0%" }}
                animate={{ width: ["0%", "85%", "95%", "85%"] }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={text}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          className="text-xs text-muted-foreground/60 text-center max-w-xs leading-relaxed"
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ── Copy Card ─────────────────────────────────────────────────────────────────
function CopyCard({ version, versionNum, isSelected, onClick }: {
  version: AdsCopyVersion1 | AdsCopyVersion2 | AdsCopyVersion3;
  versionNum: 1 | 2 | 3;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const v1 = version as AdsCopyVersion1;
  const v2 = version as AdsCopyVersion2;
  const v3 = version as AdsCopyVersion3;

  const labels = { 1: "Emotional", 2: "Benefit-Led", 3: "Urgency" };
  const icons = { 1: "💝", 2: "✨", 3: "⚡" };
  const colors = { 1: "rgba(244,114,182,0.15)", 2: "rgba(96,165,250,0.15)", 3: "rgba(251,146,60,0.15)" };
  const borders = { 1: "rgba(244,114,182,0.3)", 2: "rgba(96,165,250,0.3)", 3: "rgba(251,146,60,0.3)" };

  const getFullText = () => {
    if (versionNum === 1) {
      return `${v1.hook}\n\n${v1.body}\n\n${v1.product_line}\n\n${v1.cta}\n\n${v1.hashtags?.map(h => `#${h}`).join(" ")}`;
    }
    if (versionNum === 2) {
      return `${v2.hook}\n\n${v2.features?.join("\n")}\n\n${v2.social_proof}\n\n${v2.cta}\n\n${v2.hashtags?.map(h => `#${h}`).join(" ")}`;
    }
    return `${v3.urgency_hook}\n\n${v3.offer}\n\n${v3.value}\n\n${v3.cta}\n\n${v3.deadline}\n\n${v3.hashtags?.map(h => `#${h}`).join(" ")}`;
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(getFullText());
    setCopied(true);
    toast.success("Copy copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (versionNum - 1) * 0.15 }}
      onClick={onClick}
      className="rounded-xl border cursor-pointer transition-all duration-150"
      style={{
        background: isSelected ? colors[versionNum] : "rgba(255,255,255,0.02)",
        borderColor: isSelected ? borders[versionNum] : "rgba(255,255,255,0.08)",
        boxShadow: isSelected ? `0 0 0 1px ${borders[versionNum]}` : "none",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
        <div className="flex items-center gap-2">
          <span className="text-base">{icons[versionNum]}</span>
          <div>
            <p className="text-xs font-bold text-foreground">Version {versionNum} — {labels[versionNum]}</p>
            <p className="text-[10px] text-muted-foreground/50">{version.style}</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/8"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="px-4 py-3 space-y-2 text-xs">
        {versionNum === 1 && (
          <>
            <p className="font-bold text-foreground">{v1.hook}</p>
            <p className="text-muted-foreground/70 leading-relaxed">{v1.body}</p>
            <p className="text-muted-foreground/80 italic">{v1.product_line}</p>
            <p className="font-semibold" style={{ color: "#89E900" }}>{v1.cta}</p>
          </>
        )}
        {versionNum === 2 && (
          <>
            <p className="font-bold text-foreground">{v2.hook}</p>
            <ul className="space-y-1 text-muted-foreground/70">
              {v2.features?.map((f, i) => <li key={i}>• {f}</li>)}
            </ul>
            <p className="text-muted-foreground/60 italic">{v2.social_proof}</p>
            <p className="font-semibold" style={{ color: "#89E900" }}>{v2.cta}</p>
          </>
        )}
        {versionNum === 3 && (
          <>
            <p className="font-bold text-foreground">{v3.urgency_hook}</p>
            <p className="text-muted-foreground/70">{v3.offer}</p>
            <p className="text-muted-foreground/60 italic">{v3.value}</p>
            <p className="font-semibold" style={{ color: "#89E900" }}>{v3.cta}</p>
            <p className="text-[10px] text-muted-foreground/40">{v3.deadline}</p>
          </>
        )}

        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-2 border-t border-white/6 flex flex-wrap gap-1"
          >
            {(version as any).hashtags?.slice(0, 8).map((tag: string, i: number) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground/50">
                #{tag}
              </span>
            ))}
            {((version as any).hashtags?.length || 0) > 8 && (
              <span className="text-[10px] text-muted-foreground/40">+{(version as any).hashtags.length - 8} more</span>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ── Ads Result ────────────────────────────────────────────────────────────────
interface AdsResultProps {
  result: AdsCreationBuildResponse;
  data: AdsCreationAnalyzeResponse;
  onRegenerate: () => void;
  onRefine: (text: string) => void;
}

export function AdsResult({ result, data, onRegenerate, onRefine }: AdsResultProps) {
  const [selectedVersion, setSelectedVersion] = useState<1 | 2 | 3>(1);
  const [refinementText, setRefinementText] = useState("");
  const [activeTab, setActiveTab] = useState<"visual" | "copy" | "extras">("copy");

  const copy = result.copy;
  const a = result.analysis;

  const handleRefineSubmit = () => {
    if (!refinementText.trim()) return;
    onRefine(refinementText);
    setRefinementText("");
  };

  const downloadImage = () => {
    if (!result.imageUrls?.[0]) return;
    const a = document.createElement("a");
    a.href = result.imageUrls[0];
    a.download = `pixalera_${result.platform}_ad.jpg`;
    a.click();
  };

  const allHashtags = copy?.version1?.hashtags || [];

  return (
    <div className="px-3 sm:px-6 pb-6 space-y-4 animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Platform", value: result.platformLabel },
          { label: "Goal", value: result.goal?.charAt(0).toUpperCase() + result.goal?.slice(1) },
          { label: "Tone", value: result.tone?.charAt(0).toUpperCase() + result.tone?.slice(1) },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/8 px-3 py-2 text-center"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">{s.label}</p>
            <p className="text-xs font-bold text-foreground mt-0.5 truncate">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
        {(["visual", "copy", "extras"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs font-semibold py-2.5 transition-all ${
              activeTab === tab ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground/80"
            }`}
            style={{ background: activeTab === tab ? "rgba(137,233,0,0.1)" : "transparent" }}
          >
            {tab === "visual" ? "🖼️ Visual" : tab === "copy" ? "✍️ Copy" : "📊 Extras"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Visual Tab */}
        {activeTab === "visual" && (
          <motion.div key="visual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {result.hasRealImages && result.imageUrls?.[0] ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={result.imageUrls[0]}
                  alt="Ad Creative"
                  className="w-full object-contain"
                  style={{ maxHeight: 480 }}
                />
                <div className="absolute bottom-0 inset-x-0 p-3 flex gap-2"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>
                  <button
                    onClick={downloadImage}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(137,233,0,0.2)", color: "#89E900", border: "1px solid rgba(137,233,0,0.3)" }}
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                  <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 p-8 text-center"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="text-4xl mb-3">🖼️</div>
                <p className="text-sm font-semibold text-foreground">API Key Required</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">NVIDIA_API_KEY configure karein image generate karne ke liye</p>
                <p className="text-[10px] text-muted-foreground/40 mt-3 px-4 break-all">{result.imagePrompt?.slice(0, 120)}...</p>
              </div>
            )}

            {/* Brief summary */}
            <div className="rounded-xl border border-white/8 p-4 space-y-2"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Marketing Brief</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                <div><span className="text-muted-foreground/50">USP:</span> <span className="text-foreground/80">{a.primary_usp}</span></div>
                <div><span className="text-muted-foreground/50">Audience:</span> <span className="text-foreground/80 truncate">{a.target_audience?.split(" ").slice(0, 4).join(" ")}</span></div>
                <div><span className="text-muted-foreground/50">Price:</span> <span className="text-foreground/80">{a.price_segment}</span></div>
                <div><span className="text-muted-foreground/50">Gifting:</span> <span className="text-foreground/80">{a.gifting_potential}</span></div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Copy Tab */}
        {activeTab === "copy" && (
          <motion.div key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {copy?.version1 && (
              <CopyCard version={copy.version1} versionNum={1} isSelected={selectedVersion === 1} onClick={() => setSelectedVersion(1)} />
            )}
            {copy?.version2 && (
              <CopyCard version={copy.version2} versionNum={2} isSelected={selectedVersion === 2} onClick={() => setSelectedVersion(2)} />
            )}
            {copy?.version3 && (
              <CopyCard version={copy.version3} versionNum={3} isSelected={selectedVersion === 3} onClick={() => setSelectedVersion(3)} />
            )}

            {copy?.story_text && (
              <div className="rounded-xl border border-white/8 px-4 py-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">Story / Reel Text (Short)</p>
                <p className="text-sm text-foreground/80 whitespace-pre-line">{copy.story_text}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Extras Tab */}
        {activeTab === "extras" && (
          <motion.div key="extras" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {copy?.platform_extras && (
              <>
                {copy.platform_extras.headline_25 && (
                  <ExtraCard label="Facebook Ad Headline (25 chars)" value={copy.platform_extras.headline_25} />
                )}
                {copy.platform_extras.tweet && (
                  <ExtraCard label="Twitter / X Post" value={copy.platform_extras.tweet} multiline />
                )}
                {copy.platform_extras.whatsapp_broadcast && (
                  <ExtraCard label="WhatsApp Broadcast Message" value={copy.platform_extras.whatsapp_broadcast} multiline />
                )}
                {copy.platform_extras.youtube_titles?.length > 0 && (
                  <div className="rounded-xl border border-white/8 px-4 py-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">YouTube Title Options</p>
                    <ul className="space-y-2">
                      {copy.platform_extras.youtube_titles.map((t, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                          <span className="shrink-0 text-muted-foreground/40">#{i + 1}</span>
                          <span className="flex-1">{t}</span>
                          <button
                            onClick={() => { navigator.clipboard.writeText(t); toast.success("Copied!"); }}
                            className="shrink-0 h-6 w-6 flex items-center justify-center rounded hover:bg-white/8"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Hashtag cloud */}
            {allHashtags.length > 0 && (
              <div className="rounded-xl border border-white/8 px-4 py-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="h-3 w-3" /> Hashtags ({allHashtags.length})
                  </p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(allHashtags.map(h => `#${h}`).join(" ")); toast.success("Hashtags copied!"); }}
                    className="text-[10px] text-muted-foreground/50 hover:text-foreground flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" /> Copy All
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allHashtags.map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground/60">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refinement bar */}
      <div className="rounded-xl border border-white/8 p-1 flex items-center gap-2"
        style={{ background: "rgba(255,255,255,0.02)" }}>
        <input
          value={refinementText}
          onChange={e => setRefinementText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleRefineSubmit()}
          placeholder="e.g. 'Hindi mein chahiye', 'dark background', 'shorter copy'..."
          className="flex-1 bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted-foreground/40 px-3"
        />
        <Button
          size="sm"
          className="h-8 px-3 rounded-lg bg-primary text-black font-bold text-xs shrink-0"
          onClick={handleRefineSubmit}
          disabled={!refinementText.trim()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function ExtraCard({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="rounded-xl border border-white/8 px-4 py-3" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">{label}</p>
        <button
          onClick={() => { navigator.clipboard.writeText(value); toast.success("Copied!"); }}
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/8"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>
      <p className={`text-xs text-foreground/80 ${multiline ? "whitespace-pre-line leading-relaxed" : ""}`}>{value}</p>
    </div>
  );
}
