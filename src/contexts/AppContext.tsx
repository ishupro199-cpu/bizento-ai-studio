import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useGenerations } from "@/hooks/useFirestore";

export type PlanId = "free" | "starter" | "pro";
export type ModelId = "flash" | "pro";

export interface PlanConfig {
  id: PlanId;
  name: string;
  credits: number;
  price: string;
  features: string[];
  allowPro: boolean;
  watermark: boolean;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: { id: "free", name: "Free", credits: 3, price: "$0", features: ["3 credits/month", "Flash model only", "Watermark on images", "Basic support"], allowPro: false, watermark: true },
  starter: { id: "starter", name: "Starter", credits: 20, price: "$9", features: ["20 credits/month", "Flash model only", "No watermark", "Priority support"], allowPro: false, watermark: false },
  pro: { id: "pro", name: "Pro", credits: 50, price: "$29", features: ["50 credits/month", "Flash + Pro models", "No watermark", "Priority support", "Early access to features"], allowPro: true, watermark: false },
};

export const CREDIT_COSTS: Record<ModelId, number> = { flash: 1, pro: 2 };

export interface GenerationRecord {
  id: string;
  prompt: string;
  tool: string;
  style: string;
  model: ModelId;
  date: Date;
  creditsConsumed: number;
  gradient: string;
}

interface UserProfile {
  name: string;
  email: string;
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
  addGeneration: (record: Omit<GenerationRecord, "id" | "creditsConsumed">) => void;
  deleteGeneration: (id: string) => void;
  catalogs: GenerationRecord[];
  ads: GenerationRecord[];
  allImages: GenerationRecord[];
  showUpgradeModal: boolean;
  setShowUpgradeModal: (v: boolean) => void;
  switchPlan: (plan: PlanId) => void;
  canGenerate: boolean;
  creditCost: number;
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
  plan: "free",
  creditsRemaining: 3,
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

  // Derive user profile from Firestore or fallback
  const user: UserProfile = profile
    ? {
        name: profile.name || authUser?.displayName || "User",
        email: profile.email || authUser?.email || "",
        plan: (profile.plan as PlanId) || "free",
        creditsRemaining: profile.creditsRemaining ?? 3,
        creditsUsed: profile.creditsUsed ?? 0,
        flashGenerations: profile.flashGenerations ?? 0,
        proGenerations: profile.proGenerations ?? 0,
      }
    : DEFAULT_USER;

  // Map Firestore generations to local format
  const generations: GenerationRecord[] = firestoreGens.map((g) => ({
    id: g.id,
    prompt: g.prompt,
    tool: g.tool,
    style: g.style,
    model: g.model,
    date: g.createdAt,
    creditsConsumed: g.creditsConsumed,
    gradient: g.gradient,
  }));

  const creditCost = CREDIT_COSTS[selectedModel];
  const canGenerate = user.creditsRemaining >= creditCost;

  const setSelectedModel = useCallback((model: ModelId): boolean => {
    if (model === "pro" && !PLANS[user.plan].allowPro) {
      setShowUpgradeModal(true);
      return false;
    }
    setSelectedModelState(model);
    return true;
  }, [user.plan]);

  const addGeneration = useCallback((record: Omit<GenerationRecord, "id" | "creditsConsumed">) => {
    const cost = CREDIT_COSTS[record.model];
    // Save to Firestore
    firestoreAdd({
      prompt: record.prompt,
      tool: record.tool,
      style: record.style,
      model: record.model,
      creditsConsumed: cost,
      gradient: record.gradient,
      imageUrls: [],
      status: "completed",
      createdAt: new Date(),
    });
    // Deduct credits in Firestore
    updateCredits(cost, record.model);
  }, [firestoreAdd, updateCredits]);

  const deleteGeneration = useCallback((id: string) => {
    firestoreRemove(id);
  }, [firestoreRemove]);

  const switchPlan = useCallback((plan: PlanId) => {
    const planConfig = PLANS[plan];
    firestoreSwitchPlan(plan, planConfig.credits);
    if (!planConfig.allowPro && selectedModel === "pro") {
      setSelectedModelState("flash");
    }
  }, [selectedModel, firestoreSwitchPlan]);

  const catalogs = generations.filter(g => g.tool === "Generate Catalog");
  const ads = generations.filter(g => g.tool === "Cinematic Ads" || g.tool === "Ad Creatives");
  const allImages = generations;

  return (
    <AppContext.Provider value={{
      user, selectedModel, setSelectedModel, generations, addGeneration, deleteGeneration,
      catalogs, ads, allImages, showUpgradeModal, setShowUpgradeModal, switchPlan, canGenerate, creditCost,
      firestoreLoading: false,
    }}>
      {children}
    </AppContext.Provider>
  );
}
