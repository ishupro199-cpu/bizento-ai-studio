import { auth } from "@/lib/firebase";

export interface GenerationRequest {
  imageUrl?: string;
  prompt: string;
  tool: string;
  style: string;
  model: string;
  quality?: string;
  aspectRatio?: string;
  numOutputs?: number;
  userId?: string;
  autoDetect?: boolean;
}

export interface BrainInsightsData {
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

export interface SEOData {
  seoTitle?: string;
  description?: string;
  bulletPoints?: string[];
  keywords?: string[];
  metaDescription?: string;
  category?: string;
  attributes?: Record<string, string | null | string[]>;
  headline?: string;
  subheadline?: string;
  cta?: string;
  offer?: string;
  bodyText?: string;
  hashtagSuggestions?: string[];
  platforms?: Record<string, string>;
}

export interface CatalogShot {
  type: "hero" | "back" | "angle" | "detail" | "lifestyle" | "infographic";
  label: string;
  description: string;
  prompt: string;
  imageUrl: string | null;
}

export interface PlatformSEO {
  title: string;
  description: string;
  keywords: string[];
  bulletPoints?: string[];
  attributes: Record<string, string | string[]>;
  caption?: string;
  storyText?: string;
  productTag?: string;
}

export interface CatalogSEO {
  platforms: {
    amazon: PlatformSEO;
    flipkart: PlatformSEO;
    meesho: PlatformSEO;
    myntra: PlatformSEO;
    instagram: PlatformSEO & { caption: string; storyText: string; productTag: string; hashtags: string };
  };
  seoTitle: string;
  description: string;
  keywords: string[];
  bulletPoints: string[];
  attributes: Record<string, string | string[]>;
  category: string;
}

export interface GenerationResponse {
  success: boolean;
  intent?: "generate" | "chat" | "attribute_update";
  aiReply?: string;
  images: string[];
  bgRemovedUrl?: string;
  productInfo?: {
    type?: string;
    category?: string;
    description?: string;
    colors?: string[];
    product_name?: string;
    product_category?: string;
    primary_color?: string;
    material?: string;
    key_features?: string[];
  };
  augmentedPrompt?: string;
  hasRealImages: boolean;
  requiresApiKey?: boolean;
  error?: string;
  code?: string;
  generationId?: string;
  creditsConsumed?: number;
  creditsRemaining?: number;
  refunded?: boolean;
  requiredPlan?: string;
  catalogAttributes?: Record<string, unknown>;
  catalogShots?: CatalogShot[];
  catalogSEO?: CatalogSEO;
  attributeUpdates?: Record<string, string | boolean>;
  seoData?: SEOData;
  brainInsights?: BrainInsightsData;
  variantPrompts?: string[];
  generationTime?: number;
}

async function getAuthToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

export async function callGenerationApi(req: GenerationRequest): Promise<GenerationResponse> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("/api/generate", {
      method: "POST",
      headers,
      body: JSON.stringify(req),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        images: [],
        hasRealImages: false,
        error: data.error || `API error ${res.status}`,
        code: data.code,
        requiredPlan: data.requiredPlan,
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      images: [],
      hasRealImages: false,
      error: err.message,
    };
  }
}

export async function createPaymentOrder(plan: string): Promise<{
  success: boolean;
  orderId?: string;
  paymentDocId?: string;
  keyId?: string;
  amount?: number;
  planDetails?: {
    plan: string;
    name: string;
    credits: number;
    bonusCredits: number;
    baseAmount: number;
    gstAmount: number;
    totalAmount: number;
  };
  error?: string;
  testMode?: boolean;
}> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      headers,
      body: JSON.stringify({ plan }),
    });

    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function verifyPayment(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentDocId: string;
  plan: string;
}): Promise<{ success: boolean; error?: string; plan?: string; newBalance?: number }> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("/api/payment/verify", {
      method: "POST",
      headers,
      body: JSON.stringify(params),
    });

    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── Photography Tool Types ────────────────────────────────────────────────────
export interface PhotographyStyle {
  id: string;
  label: string;
  desc: string;
  thumbnail: string;
}

export interface PhotographyLightingMood {
  id: string;
  label: string;
  desc: string;
}

export interface PhotographyStyleSuggestion {
  styleId: string;
  style: PhotographyStyle;
  reason: string;
}

export interface PhotographyAnalysis {
  product_name: string;
  product_category: string;
  product_subcategory: string;
  primary_color: string;
  material_feel: string;
  size_class: string;
  premium_budget_signal: string;
  target_audience: string;
  image_quality: string;
}

export interface PhotographyAnalyzeResponse {
  success: boolean;
  analysis: PhotographyAnalysis;
  suggestions: PhotographyStyleSuggestion[];
  allStyles: PhotographyStyle[];
  styleBackgrounds: Record<string, string[]>;
  lightingMoods: PhotographyLightingMood[];
  defaultStyle: string;
  defaultBackground: string;
  defaultLighting: string;
  error?: string;
}

export interface PhotographyBuildResponse {
  success: boolean;
  prompt: string;
  negativePrompt: string;
  style: string;
  background: string;
  lighting: string;
  analysis: PhotographyAnalysis;
  refinementsApplied: string[];
  imageUrls: string[];
  hasRealImages: boolean;
  requiresApiKey: boolean;
  error?: string;
}

export async function analyzeForPhotography(
  imageUrl: string | undefined,
  prompt: string
): Promise<PhotographyAnalyzeResponse> {
  try {
    const res = await fetch("/api/generate/photograph/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, prompt }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false, error: err.message,
      analysis: {} as PhotographyAnalysis,
      suggestions: [],
      allStyles: [],
      styleBackgrounds: {},
      lightingMoods: [],
      defaultStyle: "studio",
      defaultBackground: "Pure White",
      defaultLighting: "natural",
    };
  }
}

export async function buildPhotographyPrompt(params: {
  imageUrl?: string;
  prompt: string;
  style: string;
  background: string;
  lighting: string;
  analysis?: PhotographyAnalysis | null;
  refinementText?: string;
}): Promise<PhotographyBuildResponse> {
  try {
    const res = await fetch("/api/generate/photograph/build-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false, error: err.message,
      prompt: "", negativePrompt: "",
      style: params.style, background: params.background, lighting: params.lighting,
      analysis: params.analysis as PhotographyAnalysis,
      refinementsApplied: [],
      imageUrls: [],
      hasRealImages: false,
      requiresApiKey: true,
    };
  }
}

export async function checkApiHealth(): Promise<{
  available: boolean;
  hasReplicateToken: boolean;
  hasRazorpay?: boolean;
  hasGemini?: boolean;
}> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return { available: false, hasReplicateToken: false };
    const data = await res.json();
    return {
      available: true,
      hasReplicateToken: data.hasReplicateToken ?? false,
      hasRazorpay: data.hasRazorpay ?? false,
      hasGemini: data.hasGemini ?? false,
    };
  } catch {
    return { available: false, hasReplicateToken: false };
  }
}
