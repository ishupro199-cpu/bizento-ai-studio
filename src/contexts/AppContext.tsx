import { createContext, useContext, useState, useCallback, ReactNode } from "react";

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
  id: number;
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
  deleteGeneration: (id: number) => void;
  catalogs: GenerationRecord[];
  ads: GenerationRecord[];
  allImages: GenerationRecord[];
  showUpgradeModal: boolean;
  setShowUpgradeModal: (v: boolean) => void;
  switchPlan: (plan: PlanId) => void;
  canGenerate: boolean;
  creditCost: number;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>({
    name: "John Doe",
    email: "john@example.com",
    plan: "pro",
    creditsRemaining: 50,
    creditsUsed: 0,
    flashGenerations: 0,
    proGenerations: 0,
  });

  const [selectedModel, setSelectedModelState] = useState<ModelId>("flash");
  const [generations, setGenerations] = useState<GenerationRecord[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
    const newRecord: GenerationRecord = {
      ...record,
      id: Date.now() + Math.random(),
      creditsConsumed: cost,
    };
    setGenerations(prev => [newRecord, ...prev]);
    setUser(prev => ({
      ...prev,
      creditsRemaining: Math.max(0, prev.creditsRemaining - cost),
      creditsUsed: prev.creditsUsed + cost,
      flashGenerations: record.model === "flash" ? prev.flashGenerations + 1 : prev.flashGenerations,
      proGenerations: record.model === "pro" ? prev.proGenerations + 1 : prev.proGenerations,
    }));
  }, []);

  const deleteGeneration = useCallback((id: number) => {
    setGenerations(prev => prev.filter(g => g.id !== id));
  }, []);

  const switchPlan = useCallback((plan: PlanId) => {
    const planConfig = PLANS[plan];
    setUser(prev => ({
      ...prev,
      plan,
      creditsRemaining: planConfig.credits,
      creditsUsed: 0,
    }));
    if (!planConfig.allowPro && selectedModel === "pro") {
      setSelectedModelState("flash");
    }
  }, [selectedModel]);

  const catalogs = generations.filter(g => g.tool === "Generate Catalog");
  const ads = generations.filter(g => g.tool === "Cinematic Ads" || g.tool === "Ad Creatives");
  const allImages = generations;

  return (
    <AppContext.Provider value={{
      user, selectedModel, setSelectedModel, generations, addGeneration, deleteGeneration,
      catalogs, ads, allImages, showUpgradeModal, setShowUpgradeModal, switchPlan, canGenerate, creditCost,
    }}>
      {children}
    </AppContext.Provider>
  );
}
