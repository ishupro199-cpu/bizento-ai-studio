import { useState, useRef, useCallback } from "react";
import {
  analyzeForAdsCreation,
  buildAdsCreation,
  AdsCreationAnalyzeResponse,
  AdsCreationBuildResponse,
  AdsCreationAnalysis,
} from "@/lib/generationApi";
import {
  MarketingBriefCards,
  PlatformPicker,
  CampaignConfig,
  AdsGeneratingAnimation,
  AdsResult,
} from "@/components/app/AdsCreationWorkflow";
import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Progress } from "@/components/ui/progress";
import {
  Megaphone,
  Plus,
  X,
  Sparkles,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type Step =
  | "prompt"
  | "analyzing"
  | "brief"
  | "platform_picker"
  | "campaign_config"
  | "generating"
  | "result";

const EXAMPLE_PROMPTS = [
  "ceramic coffee mug",
  "face serum bottle",
  "wireless earbuds",
  "handmade leather wallet",
  "protein powder jar",
  "silk kurta",
  "aromatic candle",
  "vitamin supplements",
];

export default function AdsPage() {
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState<Step>("prompt");
  const [analyzeData, setAnalyzeData] = useState<AdsCreationAnalyzeResponse | null>(null);
  const [buildResult, setBuildResult] = useState<AdsCreationBuildResponse | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [selectedFormat, setSelectedFormat] = useState("feed_square");
  const [selectedGoal, setSelectedGoal] = useState("sales");
  const [selectedTone, setSelectedTone] = useState("emotional");
  const [selectedLanguage, setSelectedLanguage] = useState("hinglish");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, progress: uploadProgress, previewUrl, clearUpload, uploadedUrl } = useImageUpload();

  const loadingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLoadingCycle = useCallback(() => {
    setLoadingStep(0);
    loadingRef.current = setInterval(() => setLoadingStep(s => s + 1), 2000);
  }, []);

  const stopLoadingCycle = useCallback(() => {
    if (loadingRef.current) { clearInterval(loadingRef.current); loadingRef.current = null; }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await upload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!prompt.trim() && !uploadedUrl) {
      toast.error("Product describe karo ya image upload karo");
      return;
    }
    setStep("analyzing");
    startLoadingCycle();
    try {
      const result = await analyzeForAdsCreation(uploadedUrl || undefined, prompt);
      if (!result.success) {
        toast.error(result.error || "Analysis failed");
        setStep("prompt");
        return;
      }
      setAnalyzeData(result);
      setSelectedPlatform(result.defaultPlatform || "instagram");
      setSelectedFormat(result.defaultFormat || "feed_square");
      setSelectedGoal(result.defaultGoal || "sales");
      setSelectedTone(result.defaultTone || "emotional");
      setStep("brief");
    } catch {
      toast.error("Analysis failed. Please try again.");
      setStep("prompt");
    } finally {
      stopLoadingCycle();
    }
  };

  const handlePlatformSelect = (platformId: string, formatId: string) => {
    setSelectedPlatform(platformId);
    setSelectedFormat(formatId);
  };

  const handleGenerate = async (analysis?: AdsCreationAnalysis | null, refinementText?: string) => {
    const effectiveAnalysis = analysis || analyzeData?.analysis || null;
    setStep("generating");
    startLoadingCycle();
    try {
      const result = await buildAdsCreation({
        imageUrl: uploadedUrl || undefined,
        prompt,
        platform: selectedPlatform,
        formatId: selectedFormat,
        goal: selectedGoal,
        tone: selectedTone,
        language: selectedLanguage,
        analysis: effectiveAnalysis,
        refinementText: refinementText || "",
      });
      if (!result.success) {
        toast.error(result.error || "Generation failed");
        setStep("result");
        return;
      }
      setBuildResult(result);
      setStep("result");
    } catch {
      toast.error("Generation failed. Please try again.");
      setStep("result");
    } finally {
      stopLoadingCycle();
    }
  };

  const handleRefine = async (refinementText: string) => {
    if (!analyzeData || !buildResult) return;
    setStep("generating");
    startLoadingCycle();
    try {
      const result = await buildAdsCreation({
        imageUrl: uploadedUrl || undefined,
        prompt,
        platform: selectedPlatform,
        formatId: selectedFormat,
        goal: selectedGoal,
        tone: selectedTone,
        language: selectedLanguage,
        analysis: buildResult.analysis || analyzeData.analysis,
        refinementText,
      });
      if (!result.success) {
        toast.error(result.error || "Refinement failed");
        setStep("result");
        return;
      }
      setBuildResult(result);
      setStep("result");
    } catch {
      toast.error("Refinement failed.");
      setStep("result");
    } finally {
      stopLoadingCycle();
    }
  };

  const handleReset = () => {
    setStep("prompt");
    setPrompt("");
    setAnalyzeData(null);
    setBuildResult(null);
    clearUpload();
    setSelectedPlatform("instagram");
    setSelectedFormat("feed_square");
    setSelectedGoal("sales");
    setSelectedTone("emotional");
  };

  const breadcrumbSteps: { key: Step; label: string }[] = [
    { key: "analyzing", label: "Analyze" },
    { key: "brief", label: "Brief" },
    { key: "platform_picker", label: "Platform" },
    { key: "campaign_config", label: "Campaign" },
    { key: "generating", label: "Generate" },
    { key: "result", label: "Result" },
  ];
  const stepOrder = breadcrumbSteps.map(s => s.key);
  const currentIdx = stepOrder.indexOf(step);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex-none px-4 sm:px-6 pt-5 pb-4 border-b border-white/6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Megaphone className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground">Ads Creation</h1>
                <p className="text-[10px] text-muted-foreground/70">
                  Full campaign pack · 3 copy versions · All platforms
                </p>
              </div>
            </div>
            {step !== "prompt" && (
              <button
                onClick={handleReset}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/25 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> New Campaign
              </button>
            )}
          </div>

          {/* Breadcrumb */}
          {step !== "prompt" && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-3 overflow-x-auto">
              {breadcrumbSteps.map((s, i) => {
                const idx = stepOrder.indexOf(s.key);
                const isDone = currentIdx > idx;
                const isCurrent = currentIdx === idx;
                return (
                  <div key={s.key} className="flex items-center gap-1 shrink-0">
                    <span className={
                      isCurrent ? "text-primary font-semibold" :
                      isDone ? "line-through opacity-40" : "opacity-30"
                    }>
                      {s.label}
                    </span>
                    {i < breadcrumbSteps.length - 1 && <ChevronRight className="h-3 w-3 opacity-40" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-4">

          {/* ── STEP: Prompt Input ── */}
          {step === "prompt" && (
            <div className="px-4 sm:px-6 space-y-6 animate-fade-in">
              {/* Hero */}
              <div className="text-center py-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 via-primary/20 to-blue-500/20 border border-white/10 mb-4">
                  <Megaphone className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Create Ads Campaign</h2>
                <p className="text-sm text-muted-foreground/70 mt-1 max-w-md mx-auto">
                  Performance marketer ki tarah sochta hai — product image + AI = complete campaign pack with image + 3 copy versions + hashtags.
                </p>
              </div>

              {/* What you get cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { icon: "🖼️", label: "Ad Creative", desc: "Platform-optimized visual", gradient: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)" },
                  { icon: "✍️", label: "3 Copy Versions", desc: "Emotional, benefit, urgency", gradient: "linear-gradient(135deg, #059669 0%, #0891b2 100%)" },
                  { icon: "#️⃣", label: "15-20 Hashtags", desc: "3-tier hashtag strategy", gradient: "linear-gradient(135deg, #d97706 0%, #dc2626 100%)" },
                  { icon: "📦", label: "Platform Extras", desc: "Tweets, WhatsApp, YouTube", gradient: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)" },
                ].map(f => (
                  <div key={f.label} className="rounded-2xl overflow-hidden border border-white/8">
                    <div className="h-10 flex items-center justify-center" style={{ background: f.gradient }}>
                      <span className="text-lg">{f.icon}</span>
                    </div>
                    <div className="p-2 bg-white/3">
                      <p className="text-[10px] font-bold text-foreground">{f.label}</p>
                      <p className="text-[8px] text-muted-foreground/60 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Image upload preview */}
              {previewUrl && (
                <div className="flex items-center gap-3 glass rounded-xl px-3 py-2.5">
                  <img src={previewUrl} alt="Product" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground font-medium">Product image attached</p>
                    {uploading && <Progress value={uploadProgress} className="w-32 h-1 mt-1" />}
                    {!uploading && <p className="text-[10px] text-muted-foreground/60 mt-0.5">AI will extract marketing intelligence from this image</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearUpload}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* Prompt input */}
              <div className="glass rounded-2xl p-1.5 flex items-center gap-2 glow-accent">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                <Button
                  variant="ghost" size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  title="Upload product image"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <input
                  type="text"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleAnalyze()}
                  placeholder="Apna product describe karo ya image upload karo..."
                  className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground/50 px-2"
                />
                <Button
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 gap-2 shrink-0"
                  onClick={handleAnalyze}
                  disabled={uploading || (!prompt.trim() && !uploadedUrl)}
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze
                </Button>
              </div>

              {/* Example prompts */}
              <div>
                <p className="text-[10px] text-muted-foreground/50 mb-2 font-medium">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PROMPTS.map(ex => (
                    <button
                      key={ex}
                      onClick={() => setPrompt(ex)}
                      className="text-[11px] px-3 py-1 rounded-full border border-white/10 text-muted-foreground/70 hover:border-white/25 hover:text-foreground transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: Analyzing ── */}
          {step === "analyzing" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                <div className="relative h-14 w-14 rounded-full border-2 border-primary/60 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Marketing brief ban raha hai...</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Product analyze ho raha hai — audience, USP, best platform detect kar rahe hain</p>
              </div>
            </div>
          )}

          {/* ── STEP: Brief Cards ── */}
          {step === "brief" && analyzeData && (
            <div className="space-y-6">
              <MarketingBriefCards data={analyzeData} />
              <div className="px-4 sm:px-6">
                <Button
                  className="w-full h-10 rounded-xl bg-primary text-black font-bold gap-2"
                  onClick={() => setStep("platform_picker")}
                >
                  Platform Choose Karo <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP: Platform Picker ── */}
          {step === "platform_picker" && analyzeData && (
            <PlatformPicker
              data={analyzeData}
              selectedPlatform={selectedPlatform}
              selectedFormat={selectedFormat}
              onSelect={handlePlatformSelect}
              onNext={() => setStep("campaign_config")}
            />
          )}

          {/* ── STEP: Campaign Config ── */}
          {step === "campaign_config" && analyzeData && (
            <CampaignConfig
              data={analyzeData}
              selectedGoal={selectedGoal}
              selectedTone={selectedTone}
              selectedLanguage={selectedLanguage}
              onGoalChange={setSelectedGoal}
              onToneChange={setSelectedTone}
              onLanguageChange={setSelectedLanguage}
              onGenerate={() => handleGenerate(analyzeData.analysis)}
              onBack={() => setStep("platform_picker")}
            />
          )}

          {/* ── STEP: Generating ── */}
          {step === "generating" && (
            <AdsGeneratingAnimation step={loadingStep} />
          )}

          {/* ── STEP: Result ── */}
          {step === "result" && buildResult && analyzeData && (
            <AdsResult
              result={buildResult}
              data={analyzeData}
              onRegenerate={() => handleGenerate(buildResult.analysis || analyzeData.analysis)}
              onRefine={handleRefine}
            />
          )}

        </div>
      </div>
    </div>
  );
}
