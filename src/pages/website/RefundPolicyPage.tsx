import { Link } from "react-router-dom";
import { PixaleraIcon } from "@/components/PixaleraIcon";
import { Check, X } from "lucide-react";

function WebsiteNav() {
  return (
    <nav className="border-b" style={{ borderColor: "#1E2028", background: "rgba(13,15,20,0.95)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <PixaleraIcon size={30} />
          <span className="text-[16px] font-black" style={{ color: "#F0EBD8" }}>
            Pixalera<span style={{ color: "#89E900" }}>.</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-[13px] font-medium hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Log in</Link>
          <Link to="/signup" className="text-[13px] font-semibold px-4 py-2 rounded-xl" style={{ background: "#89E900", color: "#0D0F14" }}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-[19px] font-black text-white mb-3">{title}</h2>
      <div className="text-[14px] leading-relaxed space-y-3" style={{ color: "#9AA0AE" }}>{children}</div>
    </div>
  );
}

const ELIGIBLE = [
  "Service was unavailable for more than 24 hours due to Pixalera's fault",
  "You were charged incorrectly (duplicate charge, wrong amount)",
  "You cancelled your plan within 48 hours of initial purchase (first-time subscribers only)",
  "A technical issue prevented you from using the service and support could not resolve it",
];

const NOT_ELIGIBLE = [
  "Credits already consumed for image generations",
  "Dissatisfaction with AI-generated image quality",
  "Cancellation after the 48-hour window",
  "Free trial credits",
  "Accounts terminated for Terms of Service violations",
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0D0F14", color: "#F0EBD8" }}>
      <WebsiteNav />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color: "#89E900" }}>Legal</p>
          <h1 className="text-4xl font-black mb-3">Refund Policy</h1>
          <p style={{ color: "#8A8F9E" }}>Last updated: March 1, 2026</p>
        </div>

        <Section title="Our Commitment">
          <p>We want every Pixalera customer to have a great experience. While AI-generated content is inherently variable and we cannot guarantee specific creative outcomes, we are committed to fair and transparent refund handling for billing issues and technical failures.</p>
        </Section>

        {/* Eligible / Not eligible cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="rounded-2xl p-5" style={{ background: "rgba(137,233,0,0.05)", border: "1px solid rgba(137,233,0,0.15)" }}>
            <p className="text-[13px] font-black text-white mb-4 flex items-center gap-2">
              <Check className="h-4 w-4" style={{ color: "#89E900" }} /> Eligible for refund
            </p>
            <ul className="space-y-2.5">
              {ELIGIBLE.map(e => (
                <li key={e} className="flex items-start gap-2 text-[13px]" style={{ color: "#9AA0AE" }}>
                  <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "#89E900" }} />{e}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl p-5" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <p className="text-[13px] font-black text-white mb-4 flex items-center gap-2">
              <X className="h-4 w-4 text-red-400" /> Not eligible for refund
            </p>
            <ul className="space-y-2.5">
              {NOT_ELIGIBLE.map(e => (
                <li key={e} className="flex items-start gap-2 text-[13px]" style={{ color: "#9AA0AE" }}>
                  <X className="h-3.5 w-3.5 mt-0.5 shrink-0 text-red-400" />{e}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Section title="Subscription Plans">
          <p>Subscriptions are billed at the start of each billing cycle. If you cancel your plan, you will retain access and credits until the end of the current paid period. No partial refunds are issued for unused days in a billing cycle.</p>
          <p>First-time subscribers may request a full refund within 48 hours of their initial purchase if they are unsatisfied, provided they have not consumed more than 20 credits.</p>
        </Section>

        <Section title="Credit Top-ups">
          <p>One-time credit purchases are non-refundable once the credits have been added to your account. If credits were not delivered due to a payment processing error, please contact us and we will resolve the issue promptly.</p>
        </Section>

        <Section title="How to Request a Refund">
          <p>To request a refund, email <a href="mailto:billing@pixalera.com" className="underline" style={{ color: "#89E900" }}>billing@pixalera.com</a> with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your registered email address</li>
            <li>Order/transaction ID</li>
            <li>A brief description of the issue</li>
          </ul>
          <p>We will respond within 2 business days. Approved refunds are processed within 5–10 business days back to the original payment method.</p>
        </Section>

        <Section title="Disputes">
          <p>If you believe you have been incorrectly charged or a refund has been wrongly denied, you may escalate the matter to <a href="mailto:legal@pixalera.com" className="underline" style={{ color: "#89E900" }}>legal@pixalera.com</a>. We will work in good faith to resolve any disputes before they are escalated to your payment provider.</p>
        </Section>

        <div className="pt-8 border-t flex gap-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link to="/privacy" className="text-[13px] hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Privacy Policy</Link>
          <Link to="/terms" className="text-[13px] hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Terms & Conditions</Link>
          <Link to="/cookies" className="text-[13px] hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Cookies Policy</Link>
        </div>
      </div>
    </div>
  );
}
