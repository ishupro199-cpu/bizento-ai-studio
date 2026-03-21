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

// ── Cinematic Ads Tool Types ──────────────────────────────────────────────────

export interface CinematicAdFormat {
  id: string;
  label: string;
  desc: string;
  icon: string;
  gradient: string;
  subOptions: Array<{ id: string; label: string; icon: string }>;
}

export interface CinematicColorGrade {
  id: string;
  label: string;
  desc: string;
  prompt: string;
  preview: string;
}

export interface CinematicAspectRatio {
  id: string;
  label: string;
  desc: string;
  prompt: string;
}

export interface CinematicAdsFormatSuggestion {
  formatId: string;
  format: CinematicAdFormat;
  reason: string;
}

export interface CinematicAdsAnalysis {
  product_name: string;
  product_category: string;
  brand_feel: string;
  target_gender: string;
  target_age_group: string;
  primary_emotion: string;
  best_model_type: string;
  lifestyle_context: string;
  color_mood: string;
  primary_color: string;
  material_feel: string;
  premium_budget_signal: string;
}

export interface CinematicAdsAnalyzeResponse {
  success: boolean;
  analysis: CinematicAdsAnalysis;
  suggestions: CinematicAdsFormatSuggestion[];
  allFormats: CinematicAdFormat[];
  colorGrades: CinematicColorGrade[];
  aspectRatios: CinematicAspectRatio[];
  defaultFormat: string;
  defaultSubFormat: string;
  defaultColorGrade: string;
  defaultAspectRatio: string;
  error?: string;
}

export interface CinematicAdsBuildResponse {
  success: boolean;
  prompt: string;
  negativePrompt: string;
  format: string;
  subFormat: string;
  colorGrade: string;
  aspectRatio: string;
  analysis: CinematicAdsAnalysis;
  refinementsApplied: Record<string, string>;
  imageUrls: string[];
  hasRealImages: boolean;
  requiresApiKey: boolean;
  error?: string;
}

export async function analyzeForCinematicAds(
  imageUrl: string | undefined,
  prompt: string
): Promise<CinematicAdsAnalyzeResponse> {
  try {
    const res = await fetch("/api/generate/cinematic-ads/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, prompt }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false, error: err.message,
      analysis: {} as CinematicAdsAnalysis,
      suggestions: [],
      allFormats: [],
      colorGrades: [],
      aspectRatios: [],
      defaultFormat: "cgi",
      defaultSubFormat: "splash_liquid",
      defaultColorGrade: "warm_cinematic",
      defaultAspectRatio: "4:5",
    };
  }
}

export async function buildCinematicAdsPrompt(params: {
  imageUrl?: string;
  prompt: string;
  format: string;
  subFormat: string;
  colorGrade: string;
  aspectRatio: string;
  analysis?: CinematicAdsAnalysis | null;
  refinementText?: string;
}): Promise<CinematicAdsBuildResponse> {
  try {
    const res = await fetch("/api/generate/cinematic-ads/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false, error: err.message,
      prompt: "", negativePrompt: "",
      format: params.format, subFormat: params.subFormat,
      colorGrade: params.colorGrade, aspectRatio: params.aspectRatio,
      analysis: params.analysis as CinematicAdsAnalysis,
      refinementsApplied: {},
      imageUrls: [],
      hasRealImages: false,
      requiresApiKey: true,
    };
  }
}

// ── Ads Creation Tool Types ───────────────────────────────────────────────────

export interface AdsCreationPlatformFormat {
  id: string;
  label: string;
  aspectRatio: string;
}

export interface AdsCreationPlatform {
  id: string;
  label: string;
  icon: string;
  gradient: string;
  formats: AdsCreationPlatformFormat[];
  recommended?: boolean;
  recommendedRank?: number;
}

export interface AdsCreationGoal {
  id: string;
  label: string;
  icon: string;
  desc: string;
  defaultCTA: string;
}

export interface AdsCreationTone {
  id: string;
  label: string;
  icon: string;
  desc: string;
}

export interface AdsCreationAnalysis {
  product_name: string;
  product_category: string;
  primary_color: string;
  material: string;
  price_segment: string;
  primary_usp: string;
  secondary_usps: string[];
  target_audience: string;
  pain_point_solved: string;
  desire_triggered: string;
  gifting_potential: string;
  impulse_buy_score: string;
  best_hook_style: string;
  platform_fit: string[];
  seasonal_relevance: string | null;
  brand_feel: string;
}

export interface AdsCopyVersion1 {
  style: string;
  hook: string;
  body: string;
  product_line: string;
  cta: string;
  hashtags: string[];
}

export interface AdsCopyVersion2 {
  style: string;
  hook: string;
  features: string[];
  social_proof: string;
  cta: string;
  hashtags: string[];
}

export interface AdsCopyVersion3 {
  style: string;
  urgency_hook: string;
  offer: string;
  value: string;
  cta: string;
  deadline: string;
  hashtags: string[];
}

export interface AdsCopyResult {
  version1: AdsCopyVersion1;
  version2: AdsCopyVersion2;
  version3: AdsCopyVersion3;
  story_text: string;
  platform_extras: {
    headline_25: string;
    tweet: string;
    whatsapp_broadcast: string;
    youtube_titles: string[];
  };
}

export interface AdsCreationAnalyzeResponse {
  success: boolean;
  analysis: AdsCreationAnalysis;
  platforms: AdsCreationPlatform[];
  allPlatforms: AdsCreationPlatform[];
  campaignGoals: AdsCreationGoal[];
  adTones: AdsCreationTone[];
  defaultPlatform: string;
  defaultFormat: string;
  defaultGoal: string;
  defaultTone: string;
  error?: string;
}

export interface AdsCreationBuildResponse {
  success: boolean;
  imagePrompt: string;
  platform: string;
  platformLabel: string;
  formatId: string;
  formatLabel: string;
  aspectRatio: string;
  goal: string;
  tone: string;
  language: string;
  analysis: AdsCreationAnalysis;
  copy: AdsCopyResult;
  imageUrls: string[];
  hasRealImages: boolean;
  requiresApiKey: boolean;
  refinementsApplied: Record<string, boolean>;
  error?: string;
}

export async function analyzeForAdsCreation(
  imageUrl: string | undefined,
  prompt: string
): Promise<AdsCreationAnalyzeResponse> {
  try {
    const res = await fetch("/api/generate/ads-creation/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, prompt }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false, error: err.message,
      analysis: {} as AdsCreationAnalysis,
      platforms: [],
      allPlatforms: [],
      campaignGoals: [],
      adTones: [],
      defaultPlatform: "instagram",
      defaultFormat: "feed_square",
      defaultGoal: "sales",
      defaultTone: "emotional",
    };
  }
}

export async function buildAdsCreation(params: {
  imageUrl?: string;
  prompt: string;
  platform: string;
  formatId: string;
  goal: string;
  tone: string;
  language?: string;
  analysis?: AdsCreationAnalysis | null;
  refinementText?: string;
}): Promise<AdsCreationBuildResponse> {
  try {
    const res = await fetch("/api/generate/ads-creation/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false, error: err.message,
      imagePrompt: "", platform: params.platform, platformLabel: params.platform,
      formatId: params.formatId, formatLabel: params.formatId,
      aspectRatio: "1:1", goal: params.goal, tone: params.tone,
      language: params.language || "hinglish",
      analysis: params.analysis as AdsCreationAnalysis,
      copy: {} as AdsCopyResult,
      imageUrls: [], hasRealImages: false, requiresApiKey: true,
      refinementsApplied: {},
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
