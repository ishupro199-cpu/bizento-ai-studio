import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Shield, CheckCircle, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext, PLANS, PlanId } from "@/contexts/AppContext";
import { createPaymentOrder, verifyPayment } from "@/lib/generationApi";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planId = (searchParams.get("plan") || "starter") as PlanId;
  const plan = PLANS[planId];

  if (planId === "free" || !plan) {
    navigate("/app/plan");
    return null;
  }

  const baseAmount = plan.priceAmount;
  const gstRate = 0.18;
  const gstAmount = parseFloat((baseAmount * gstRate).toFixed(2));
  const totalAmount = parseFloat((baseAmount + gstAmount).toFixed(2));
  const totalCredits = plan.credits + plan.bonusCredits;

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);

    try {
      const orderRes = await createPaymentOrder(planId);

      if (!orderRes.success && !orderRes.testMode) {
        setError(orderRes.error || "Failed to create payment order");
        setLoading(false);
        return;
      }

      if (orderRes.testMode) {
        toast.info("Razorpay not configured — running in test mode. Plan will not actually change.");
        setLoading(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway. Please try again.");
        setLoading(false);
        return;
      }

      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: "INR",
        name: "PixaLera",
        description: `${plan.name} Plan — ${totalCredits} Credits`,
        order_id: orderRes.orderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#89E900" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentDocId: orderRes.paymentDocId || "",
              plan: planId,
            });

            if (verifyRes.success) {
              toast.success(`Payment successful! ${totalCredits} credits added to your account.`);
              navigate("/app/credits");
            } else {
              setError(verifyRes.error || "Payment verification failed");
            }
          } catch {
            setError("Payment verification failed. Contact support.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/app/plan")}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Checkout</h1>
          <p className="text-sm text-muted-foreground">Complete your subscription</p>
        </div>
      </div>

      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">{plan.name} Plan</span>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            {plan.billingPeriod}
          </Badge>
        </div>

        <div className="space-y-2">
          {plan.features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Credits Breakdown</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base credits</span>
          <span className="text-foreground font-medium">{plan.credits}</span>
        </div>
        {plan.bonusCredits > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-400">Bonus credits</span>
            <span className="text-green-400 font-medium">+{plan.bonusCredits}</span>
          </div>
        )}
        <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-semibold">
          <span className="text-foreground">Total credits</span>
          <span className="text-primary">{totalCredits}</span>
        </div>
      </div>

      <div className="glass rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Price Breakdown</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base price</span>
          <span className="text-foreground">₹{baseAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">GST (18%)</span>
          <span className="text-foreground">₹{gstAmount.toFixed(2)}</span>
        </div>
        <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
          <span className="text-foreground">Total payable</span>
          <span className="text-primary text-lg">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <Button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full h-12 text-base font-semibold"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pay ₹{totalAmount.toFixed(2)} with Razorpay
          </span>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5" />
        <span>Secured by Razorpay · 256-bit encryption · GST included</span>
      </div>
    </div>
  );
}
