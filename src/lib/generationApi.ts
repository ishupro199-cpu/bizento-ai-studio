import { auth } from "@/lib/firebase";

export interface GenerationRequest {
  imageUrl?: string;
  prompt: string;
  tool: string;
  style: string;
  model: string;
  quality?: string;
  userId?: string;
}

export interface GenerationResponse {
  success: boolean;
  images: string[];
  bgRemovedUrl?: string;
  productInfo?: { category?: string; description?: string };
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

export async function checkApiHealth(): Promise<{
  available: boolean;
  hasReplicateToken: boolean;
  hasRazorpay?: boolean;
}> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return { available: false, hasReplicateToken: false };
    const data = await res.json();
    return {
      available: true,
      hasReplicateToken: data.hasReplicateToken ?? false,
      hasRazorpay: data.hasRazorpay ?? false,
    };
  } catch {
    return { available: false, hasReplicateToken: false };
  }
}
