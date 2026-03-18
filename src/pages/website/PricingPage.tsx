import { Link } from "react-router-dom";
import { Check, X, Zap, ArrowRight } from "lucide-react";
import { PixaleraIcon } from "@/components/PixaleraIcon";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    credits: 15,
    bonusCredits: 0,
    desc: "Try Pixalera AI with no commitment.",
    popular: false,
    cta: "Get Started Free",
    ctaLink: "/signup",
    features: [
      "15 credits / month",
      "Flash model only",
      "720p exports",
      "Basic tools access",
      "Watermark on images",
      "Community support",
    ],
  },
  {
    name: "Starter",
    price: "₹49",
    period: "/month",
    credits: 100,
    bonusCredits: 20,
    desc: "For creators who want consistent output.",
    popular: false,
    cta: "Start with Starter",
    ctaLink: "/signup",
    features: [
      "100 credits / month",
      "+20 bonus credits",
      "Flash model",
      "1K & 2K exports",
      "All tools access",
      "No watermark",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    price: "₹399",
    period: "/ 3 months",
    credits: 450,
    bonusCredits: 50,
    desc: "Best value for power users & brands.",
    popular: true,
    cta: "Go Pro",
    ctaLink: "/signup",
    features: [
      "450 credits total",
      "+50 bonus credits",
      "Flash + Pro models",
      "Up to 4K exports",
      "All tools + priority speed",
      "Prompt library access",
      "SEO optimization features",
      "No watermark",
      "Dedicated support",
    ],
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Credits",
    free: "15 / month",
    starter: "100 + 20 bonus",
    pro: "450 + 50 bonus",
  },
  {
    feature: "Models access",
    free: "Flash only",
    starter: "Flash",
    pro: "Flash + Pro",
  },
  {
    feature: "Tools access",
    free: "Basic",
    starter: "All tools",
    pro: "All tools",
  },
  {
    feature: "Max quality",
    free: "720p",
    starter: "2K",
    pro: "4K",
  },
  {
    feature: "Prompt library",
    free: false,
    starter: false,
    pro: true,
  },
  {
    feature: "SEO features",
    free: false,
    starter: false,
    pro: true,
  },
  {
    feature: "Priority speed",
    free: false,
    starter: false,
    pro: true,
  },
  {
    feature: "No watermark",
    free: false,
    starter: true,
    pro: true,
  },
];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value
      ? <Check className="h-4 w-4 mx-auto" style={{ color: "#89E900" }} />
      : <X className="h-4 w-4 mx-auto text-white/20" />;
  }
  return <span className="text-[13px] text-white/70">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen font-bricolage" style={{ background: "#0D0F14", color: "#E8EAF0" }}>

      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40M0 40h40M0 0v40M40 0v40' stroke='%2389E900' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto relative z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <PixaleraIcon size={32} />
          <span className="text-[17px] font-black tracking-tight" style={{ color: "#F0EBD8", letterSpacing: "-0.02em" }}>
            Pixalera<span style={{ color: "#89E900" }}>.</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-[14px] font-medium px-4 py-2 rounded-xl transition-colors" style={{ color: "#8A8F9E" }}>
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-[14px] font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
            style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 0 24px rgba(137,233,0,0.2)" }}
          >
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border text-[13px] font-medium"
            style={{ background: "rgba(137,233,0,0.07)", borderColor: "rgba(137,233,0,0.25)", color: "#89E900" }}
          >
            <Zap className="h-3.5 w-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Choose your plan
          </h1>
          <p className="text-[17px] max-w-xl mx-auto" style={{ color: "#8A8F9E" }}>
            Start free and scale as your creative needs grow.
            No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl border flex flex-col relative overflow-hidden transition-all duration-300"
              style={{
                background: plan.popular ? "rgba(137,233,0,0.04)" : "#12141A",
                borderColor: plan.popular ? "rgba(137,233,0,0.35)" : "#1E2028",
                boxShadow: plan.popular ? "0 0 40px rgba(137,233,0,0.08)" : "none",
                padding: "28px 24px 24px",
              }}
            >
              {plan.popular && (
                <div
                  className="absolute top-0 right-0 text-[11px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl"
                  style={{ background: "#89E900", color: "#0D0F14" }}
                >
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-[15px] font-semibold mb-1" style={{ color: plan.popular ? "#89E900" : "#8A8F9E" }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[36px] font-extrabold leading-none text-white">{plan.price}</span>
                  <span className="text-[13px]" style={{ color: "#8A8F9E" }}>{plan.period}</span>
                </div>
                {plan.bonusCredits > 0 && (
                  <div
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mt-1"
                    style={{ background: "rgba(137,233,0,0.1)", color: "#89E900", border: "1px solid rgba(137,233,0,0.2)" }}
                  >
                    +{plan.bonusCredits} bonus credits
                  </div>
                )}
                <p className="text-[13px] mt-3" style={{ color: "#8A8F9E" }}>{plan.desc}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: "#C8CDD7" }}>
                    <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#89E900" }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.ctaLink}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold transition-all duration-150"
                style={plan.popular
                  ? { background: "#89E900", color: "#0D0F14", boxShadow: "0 4px 20px rgba(137,233,0,0.25)" }
                  : { background: "rgba(255,255,255,0.06)", color: "#E8EAF0", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mb-16">
          <h2 className="text-2xl font-extrabold mb-8 text-center">Compare plans</h2>
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#1E2028" }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: "#12141A", borderBottom: "1px solid #1E2028" }}>
                  <th className="text-left px-5 py-4 text-[13px] font-semibold" style={{ color: "#8A8F9E", width: "36%" }}>
                    Feature
                  </th>
                  {PLANS.map(p => (
                    <th key={p.name} className="px-4 py-4 text-center text-[13px] font-semibold"
                      style={{ color: p.popular ? "#89E900" : "#E8EAF0" }}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    style={{
                      background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                      borderBottom: i < COMPARISON_ROWS.length - 1 ? "1px solid #1E2028" : "none",
                    }}
                  >
                    <td className="px-5 py-3.5 text-[13px] font-medium" style={{ color: "#C8CDD7" }}>
                      {row.feature}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Cell value={row.free} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Cell value={row.starter} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Cell value={row.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center rounded-2xl py-12 px-8 border" style={{ background: "#12141A", borderColor: "#1E2028" }}>
          <h3 className="text-2xl font-extrabold mb-3">Not sure which plan is right for you?</h3>
          <p className="mb-6" style={{ color: "#8A8F9E" }}>Start free — no credit card required. Upgrade anytime.</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-bold transition-all"
            style={{ background: "#89E900", color: "#0D0F14", boxShadow: "0 4px 30px rgba(137,233,0,0.3)" }}
          >
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
