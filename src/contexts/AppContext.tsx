import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useGenerations, updateAdminStats } from "@/hooks/useFirestore";

export type PlanId = "free" | "starter" | "pro";
export type ModelId = "flash" | "pro";
export type ToolId = "catalog" | "photo" | "creative" | "cinematic";
export type QualityId = "720p" | "1K" | "2K" | "4K";

export interface PlanConfig {
  id: PlanId;
  name: string;
  credits: number;
  bonusCredits: number;
  price: string;
  priceAmount: number;
  billingPeriod: string;
  features: string[];
  allowPro: boolean;
  watermark: boolean;
  maxQuality: QualityId;
  allowedTools: ToolId[];
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    credits: 15,
    bonusCredits: 0,
    price: "₹0",
    priceAmount: 0,
    billingPeriod: "month",
    features: [
      "15 credits/month",
      "Catalog generation (limited)",
      "Flash model only",
      "Max quality: 1080p",
      "No prompt library",
    ],
    allowPro: false,
    watermark: true,
    maxQuality: "1K",
    allowedTools: ["catalog", "photo", "creative"],
  },
  starter: {
    id: "starter",
    name: "Starter",
    credits: 100,
    bonusCredits: 20,
    price: "₹99",
    priceAmount: 99,
    billingPeriod: "month",
    features: [
      "100 credits/month",
      "+20 bonus credits on purchase",
      "Catalog, Photography, Ad Creatives",
      "Flash + Pro models",
      "Max quality: 2K",
      "Basic Prompt Library",
      "SEO title & description",
      "Full history access",
    ],
    allowPro: true,
    watermark: false,
    maxQuality: "2K",
    allowedTools: ["catalog", "photo", "creative"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    credits: 450,
    bonusCredits: 50,
    price: "₹399",
    priceAmount: 399,
    billingPeriod: "3 months",
    features: [
      "450 credits (3 months)",
      "+50 bonus credits",
      "All tools unlocked",
      "Cinematic Ads (CGI Ads)",
      "Flash + Pro models",
      "Max quality: 4K",
      "Full Prompt Library",
      "AI prompt suggestions",
      "Advanced SEO listings",
      "Priority processing",
    ],
    allowPro: true,
    watermark: false,
    maxQuality: "4K",
    allowedTools: ["catalog", "photo", "creative", "cinematic"],
  },
};

export const TOOL_CREDIT_COSTS: Record<ToolId, Record<ModelId, number>> = {
  catalog:   { flash: 5,  pro: 10 },
  photo:     { flash: 3,  pro: 5  },
  creative:  { flash: 3,  pro: 5  },
  cinematic: { flash: 30, pro: 50 },
};

export const QUALITY_ADDON_COSTS: Record<QualityId, number> = {
  "720p": 0,
  "1K":   0,
  "2K":   4,
  "4K":   8,
};

export function calculateCreditCost(
  tool: ToolId,
  model: ModelId,
  quality: QualityId
): number {
  const base = TOOL_CREDIT_COSTS[tool]?.[model] ?? 3;
  const addon = QUALITY_ADDON_COSTS[quality] ?? 0;
  return base + addon;
}

export interface GenerationRecord {
  id: string;
  prompt: string;
  augmentedPrompt?: string;
  tool: string;
  style: string;
  model: ModelId;
  date: Date;
  creditsConsumed: number;
  gradient: string;
  uploadedImageUrl?: string;
  variantCount?: number;
  imageUrls?: string[];
  hasRealImages?: boolean;
  generationTime?: number;
}

interface UserProfile {
  name: string;
  email: string;
  photoURL: string;
  plan: PlanId;
  creditsRemaining: number;
  creditsUsed: number;
  flashGenerations: number;
  proGenerations: number;
}

interface AppContextType {
  user: UserProfile;
  selectedModel: ModelId;
  setSelectedModel: (model: ModelId) => boolean;
  generations: GenerationRecord[];
  addGeneration: (record: Omit<GenerationRecord, "id" | "creditsConsumed">, serverDeducted?: boolean) => void;
  deleteGeneration: (id: string) => void;
  catalogs: GenerationRecord[];
  ads: GenerationRecord[];
  allImages: GenerationRecord[];
  showUpgradeModal: boolean;
  setShowUpgradeModal: (v: boolean) => void;
  switchPlan: (plan: PlanId) => void;
  canGenerate: boolean;
  creditCost: number;
  getCreditCost: (tool: ToolId, model: ModelId, quality: QualityId) => number;
  firestoreLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

const DEFAULT_USER: UserProfile = {
  name: "User",
  email: "",
  photoURL: "",
  plan: "free",
  creditsRemaining: 15,
  creditsUsed: 0,
  flashGenerations: 0,
  proGenerations: 0,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const { profile, updateCredits, switchPlan: firestoreSwitchPlan } = useUserProfile();
  const { generations: firestoreGens, addGeneration: firestoreAdd, removeGeneration: firestoreRemove } = useGenerations();

  const [selectedModel, setSelectedModelState] = useState<ModelId>("flash");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const user: UserProfile = profile
    ? {
        name: profile.name || authUser?.displayName || "User",
        email: profile.email || authUser?.email || "",
        photoURL: profile.photoURL || authUser?.photoURL || "",
        plan: (profile.plan as PlanId) || "free",
        creditsRemaining: profile.creditsRemaining ?? 15,
        creditsUsed: profile.creditsUsed ?? 0,
        flashGenerations: profile.flashGenerations ?? 0,
        proGenerations: profile.proGenerations ?? 0,
      }
    : { ...DEFAULT_USER, photoURL: authUser?.photoURL || "" };

  const generations: GenerationRecord[] = firestoreGens.map((g) => ({
    id: g.id,
    prompt: g.prompt,
    augmentedPrompt: g.augmentedPrompt,
    tool: g.tool,
    style: g.style,
    model: g.model,
    date: g.createdAt,
    creditsConsumed: g.creditsConsumed,
    gradient: g.gradient,
    uploadedImageUrl: g.uploadedImageUrl,
    imageUrls: g.imageUrls,
  }));

  const creditCost = calculateCreditCost("catalog", selectedModel, "1K");
  const canGenerate = user.creditsRemaining >= creditCost;

  const setSelectedModel = useCallback((model: ModelId): boolean => {
    if (model === "pro" && !PLANS[user.plan].allowPro) {
      setShowUpgradeModal(true);
      return false;
    }
    setSelectedModelState(model);
    return true;
  }, [user.plan]);

  const addGeneration = useCallback(
    (record: Omit<GenerationRecord, "id" | "creditsConsumed">, serverDeducted = false) => {
      const toolId = Object.entries({
        "Generate Catalog": "catalog",
        "Product Photography": "photo",
        "Ad Creatives": "creative",
        "Cinematic Ads": "cinematic",
      }).find(([name]) => record.tool === name)?.[1] as ToolId ?? "catalog";
      const quality = (record as any).quality as QualityId || "1K";
      const cost = calculateCreditCost(toolId, record.model, quality);
      firestoreAdd({
        prompt: record.prompt,
        augmentedPrompt: record.augmentedPrompt || "",
        tool: record.tool,
        style: record.style,
        model: record.model,
        creditsConsumed: cost,
        gradient: record.gradient,
        imageUrls: record.imageUrls ?? [],
        uploadedImageUrl: record.uploadedImageUrl || "",
        status: "completed",
        hasRealImages: record.hasRealImages ?? false,
        generationTime: record.generationTime,
        createdAt: new Date(),
      });
      if (!serverDeducted) {
        updateCredits(cost, record.model);
        updateAdminStats(record.tool, record.model, cost, {
          hasRealImages: record.hasRealImages ?? false,
          generationTime: record.generationTime,
        });
      }
    },
    [firestoreAdd, updateCredits]
  );

  const deleteGeneration = useCallback((id: string) => {
    firestoreRemove(id);
  }, [firestoreRemove]);

  const switchPlan = useCallback((plan: PlanId) => {
    const planConfig = PLANS[plan];
    firestoreSwitchPlan(plan, planConfig.credits + planConfig.bonusCredits);
    if (!planConfig.allowPro && selectedModel === "pro") {
      setSelectedModelState("flash");
    }
  }, [selectedModel, firestoreSwitchPlan]);

  const catalogs = generations.filter((g) => g.tool === "Generate Catalog");
  const ads = generations.filter(
    (g) => g.tool === "Cinematic Ads" || g.tool === "Ad Creatives"
  );
  const allImages = generations;

  return (
    <AppContext.Provider
      value={{
        user, selectedModel, setSelectedModel, generations, addGeneration, deleteGeneration,
        catalogs, ads, allImages, showUpgradeModal, setShowUpgradeModal, switchPlan,
        canGenerate, creditCost, getCreditCost: calculateCreditCost, firestoreLoading: false,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
