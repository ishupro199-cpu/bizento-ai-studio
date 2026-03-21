import { useState, useRef, useCallback } from "react";
import {
  analyzeForCinematicAds,
  buildCinematicAdsPrompt,
  CinematicAdsAnalyzeResponse,
  CinematicAdsBuildResponse,
  CinematicAdsAnalysis,
} from "@/lib/generationApi";
import {
  CinematicFormatPicker,
  CinematicConfigPicker,
  CinematicLoadingAnimation,
  CinematicAdResult,
} from "@/components/app/CinematicAdsWorkflow";
import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Progress } from "@/components/ui/progress";
import {
  Clapperboard,
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
  | "format_picker"
  | "config_picker"
  | "generating"
  | "result";

const EXAMPLE_PROMPTS = [
  "luxury perfume bottle",
  "wireless headphones",
  "leather handbag",
  "protein supplement jar",
  "diamond ring",
  "sneakers",
  "face serum",
  "smartwatch",
];

export default function CinematicAdsPage() {
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState<Step>("prompt");
  const [analysisData, setAnalysisData] = useState<CinematicAdsAnalyzeResponse | null>(null);
  const [buildResult, setBuildResult] = useState<CinematicAdsBuildResponse | null>(null);
  const [approved, setApproved] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedSubFormat, setSelectedSubFormat] = useState("");
  const [selectedColorGrade, setSelectedColorGrade] = useState("warm_cinematic");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("4:5");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, progress: uploadProgress, previewUrl, clearUpload, uploadedUrl } = useImageUpload();

  const loadingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLoadingCycle = useCallback(() => {
    setLoadingStep(0);
    loadingRef.current = setInterval(() => {
      setLoadingStep(s => s + 1);
    }, 2200);
  }, []);

  const stopLoadingCycle = useCallback(() => {
    if (loadingRef.current) {
      clearInterval(loadingRef.current);
      loadingRef.current = null;
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await upload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!prompt.trim() && !uploadedUrl) {
      toast.error("Please describe your product or upload an image");
      return;
    }
    setStep("analyzing");
    startLoadingCycle();
    try {
      const result = await analyzeForCinematicAds(uploadedUrl || undefined, prompt);
      if (!result.success) {
        toast.error(result.error || "Analysis failed");
        setStep("prompt");
        return;
      }
      setAnalysisData(result);
      setSelectedColorGrade(result.defaultColorGrade || "warm_cinematic");
      setSelectedAspectRatio(result.defaultAspectRatio || "4:5");
      setStep("format_picker");
    } catch {
      toast.error("Something went wrong during analysis");
      setStep("prompt");
    } finally {
      stopLoadingCycle();
    }
  };

  const handleFormatSelect = (formatId: string, subFormatId: string) => {
    setSelectedFormat(formatId);
    setSelectedSubFormat(subFormatId);
    setStep("config_picker");
  };

  const handleGenerate = async () => {
    if (!analysisData) return;
    setStep("generating");
    startLoadingCycle();
    try {
      const result = await buildCinematicAdsPrompt({
        imageUrl: uploadedUrl || undefined,
        prompt,
        format: selectedFormat,
        subFormat: selectedSubFormat,
        colorGrade: selectedColorGrade,
        aspectRatio: selectedAspectRatio,
        analysis: analysisData.analysis,
      });
      if (!result.success) {
        toast.error(result.error || "Generation failed");
        setStep("config_picker");
        return;
      }
      setBuildResult(result);
      setApproved(false);
      setStep("result");
    } catch {
      toast.error("Generation failed. Please try again.");
      setStep("config_picker");
    } finally {
      stopLoadingCycle();
    }
  };

  const handleRefine = async (refinementText: string) => {
    if (!analysisData || !buildResult) return;
    setStep("generating");
    startLoadingCycle();
    try {
      const result = await buildCinematicAdsPrompt({
        imageUrl: uploadedUrl || undefined,
        prompt,
        format: selectedFormat,
        subFormat: selectedSubFormat,
        colorGrade: selectedColorGrade,
        aspectRatio: selectedAspectRatio,
        analysis: analysisData.analysis,
        refinementText,
      });
      if (!result.success) {
        toast.error(result.error || "Refinement failed");
        setStep("result");
        return;
      }
      // Apply any format/grade/ratio switches from refinement
      if (result.format !== selectedFormat) setSelectedFormat(result.format);
      if (result.subFormat !== selectedSubFormat) setSelectedSubFormat(result.subFormat);
      if (result.colorGrade !== selectedColorGrade) setSelectedColorGrade(result.colorGrade);
      if (result.aspectRatio !== selectedAspectRatio) setSelectedAspectRatio(result.aspectRatio);
      setBuildResult(result);
      setApproved(false);
      setStep("result");
    } catch {
      toast.error("Refinement failed. Please try again.");
      setStep("result");
    } finally {
      stopLoadingCycle();
    }
  };

  const handleReset = () => {
    setStep("prompt");
    setPrompt("");
    setAnalysisData(null);
    setBuildResult(null);
    setApproved(false);
    clearUpload();
    setSelectedFormat("");
    setSelectedSubFormat("");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex-none px-4 sm:px-6 pt-5 pb-4 border-b border-white/6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Clapperboard className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground">Cinematic Ads</h1>
                <p className="text-[10px] text-muted-foreground/70">
                  Professional ad agency quality · 4 formats · AI-powered
                </p>
              </div>
            </div>
            {step !== "prompt" && (
              <button
                onClick={handleReset}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/25 transition-colors">
                <Plus className="h-3.5 w-3.5" /> New Ad
              </button>
            )}
          </div>

          {/* Breadcrumb */}
          {step !== "prompt" && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-3">
              <span className={step === "analyzing" ? "text-primary font-semibold" : "line-through opacity-40"}>Analyze</span>
              <ChevronRight className="h-3 w-3 opacity-40" />
              <span className={step === "format_picker" ? "text-primary font-semibold" : ["config_picker","generating","result"].includes(step) ? "line-through opacity-40" : "opacity-30"}>Format</span>
              <ChevronRight className="h-3 w-3 opacity-40" />
              <span className={step === "config_picker" ? "text-primary font-semibold" : ["generating","result"].includes(step) ? "line-through opacity-40" : "opacity-30"}>Style</span>
              <ChevronRight className="h-3 w-3 opacity-40" />
              <span className={["generating","result"].includes(step) ? (step === "generating" ? "text-primary font-semibold animate-pulse" : "line-through opacity-40") : "opacity-30"}>Generate</span>
              <ChevronRight className="h-3 w-3 opacity-40" />
              <span className={step === "result" ? "text-primary font-semibold" : "opacity-30"}>Result</span>
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
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 via-primary/20 to-blue-500/20 border border-white/10 mb-4">
                  <Clapperboard className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Create Cinematic Ad</h2>
                <p className="text-sm text-muted-foreground/70 mt-1 max-w-md mx-auto">
                  Professional advertising campaign quality — not just product photos. Think Nike, Dior, Zara campaign frames.
                </p>
              </div>

              {/* Format preview cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { icon: "👤", label: "Model / Influencer", desc: "Real-looking AI person with product", gradient: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)" },
                  { icon: "✨", label: "CGI / Cinematic", desc: "Liquid, particles, dramatic light", gradient: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)" },
                  { icon: "🏠", label: "Scene Builder", desc: "Aspirational lifestyle scenes", gradient: "linear-gradient(135deg, #78350f 0%, #92400e 100%)" },
                  { icon: "❤️", label: "Brand Story", desc: "Emotion-driven concept imagery", gradient: "linear-gradient(135deg, #991b1b 0%, #c2410c 100%)" },
                ].map(f => (
                  <div key={f.label} className="rounded-2xl overflow-hidden border border-white/8">
                    <div className="h-12 flex items-center justify-center" style={{ background: f.gradient }}>
                      <span className="text-xl">{f.icon}</span>
                    </div>
                    <div className="p-2 bg-white/3">
                      <p className="text-[10px] font-bold text-foreground">{f.label}</p>
                      <p className="text-[8px] text-muted-foreground/60 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Image upload */}
              {previewUrl && (
                <div className="flex items-center gap-3 glass rounded-xl px-3 py-2.5">
                  <img src={previewUrl} alt="Product" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground font-medium">Product image attached</p>
                    {uploading && <Progress value={uploadProgress} className="w-32 h-1 mt-1" />}
                    {!uploading && <p className="text-[10px] text-muted-foreground/60 mt-0.5">AI will analyze this for optimal ad strategy</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearUpload}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* Prompt + generate */}
              <div className="glass rounded-2xl p-1.5 flex items-center gap-2 glow-accent">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                <Button
                  variant="ghost" size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  title="Upload product image">
                  <Plus className="h-5 w-5" />
                </Button>
                <input
                  type="text"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleAnalyze()}
                  placeholder="Describe your product (e.g. luxury perfume bottle, leather sneakers)..."
                  className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground/50 px-2"
                />
                <Button
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 gap-2 shrink-0"
                  onClick={handleAnalyze}
                  disabled={uploading || (!prompt.trim() && !uploadedUrl)}>
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
                      className="text-[11px] px-3 py-1 rounded-full border border-white/10 text-muted-foreground/70 hover:border-white/25 hover:text-foreground transition-colors">
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
                <p className="text-sm font-semibold text-foreground">Analyzing product...</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Detecting brand feel, target audience, best ad formats</p>
              </div>
            </div>
          )}

          {/* ── STEP: Format Picker ── */}
          {step === "format_picker" && analysisData && (
            <CinematicFormatPicker
              data={analysisData}
              onSelect={handleFormatSelect}
            />
          )}

          {/* ── STEP: Config Picker ── */}
          {step === "config_picker" && analysisData && (
            <CinematicConfigPicker
              data={analysisData}
              formatId={selectedFormat}
              subFormatId={selectedSubFormat}
              selectedColorGrade={selectedColorGrade}
              selectedAspectRatio={selectedAspectRatio}
              onColorGradeChange={setSelectedColorGrade}
              onAspectRatioChange={setSelectedAspectRatio}
              onGenerate={handleGenerate}
              isBuilding={false}
              onBack={() => setStep("format_picker")}
            />
          )}

          {/* ── STEP: Generating ── */}
          {step === "generating" && (
            <CinematicLoadingAnimation format={selectedFormat} step={loadingStep} />
          )}

          {/* ── STEP: Result ── */}
          {step === "result" && buildResult && analysisData && (
            <div className="px-3 sm:px-6 pb-4">
              <CinematicAdResult
                result={buildResult}
                data={analysisData}
                onApprove={() => setApproved(true)}
                onRefine={handleRefine}
                onRegenerate={handleGenerate}
                approved={approved}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
