export interface GenerationRequest {
  imageUrl?: string;
  prompt: string;
  tool: string;
  style: string;
  model: string;
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
}

export async function callGenerationApi(req: GenerationRequest): Promise<GenerationResponse> {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      images: [],
      hasRealImages: false,
      error: err.message,
    };
  }
}

export async function checkApiHealth(): Promise<{
  available: boolean;
  hasReplicateToken: boolean;
}> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return { available: false, hasReplicateToken: false };
    const data = await res.json();
    return { available: true, hasReplicateToken: data.hasReplicateToken ?? false };
  } catch {
    return { available: false, hasReplicateToken: false };
  }
}
