import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PERKS = [
  "3 free credits on signup — no card needed",
  "Generate catalog shots, ads & social creatives",
  "Flash AI model with professional results",
];

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, name);
      toast.success("Account created! Welcome to PixaLera 🎉");
      navigate("/app");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#111111]">

      {/* ── LEFT — Form Panel ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 relative">

        {/* Back button */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white/80 transition-colors duration-150 group"
          >
            <span className="flex items-center justify-center h-7 w-7 rounded-full border border-white/10 group-hover:border-white/25 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
            </span>
            Back
          </Link>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-[380px] space-y-8">

            {/* Logo + heading */}
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="h-8 w-8 rounded-lg bg-[#89E900] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-black" />
                </div>
                <span className="text-[15px] font-bold text-white tracking-tight">
                  Pixa<span className="text-[#89E900]">Lera</span>
                </span>
              </div>
              <h1 className="text-[2rem] font-bold text-white leading-tight">Create your account</h1>
              <p className="text-[14px] text-white/45 mt-2 leading-relaxed">
                Join thousands of creators generating<br className="hidden sm:block" /> pro visuals with AI.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-white/60">Full name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-12 rounded-2xl bg-white/[0.06] border border-white/[0.09] px-4 text-[14px] text-white placeholder-white/25 outline-none transition-all duration-150 focus:border-[#89E900]/50 focus:bg-white/[0.08]"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-white/60">Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 rounded-2xl bg-white/[0.06] border border-white/[0.09] px-4 text-[14px] text-white placeholder-white/25 outline-none transition-all duration-150 focus:border-[#89E900]/50 focus:bg-white/[0.08]"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-white/60">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-12 rounded-2xl bg-white/[0.06] border border-white/[0.09] px-4 pr-12 text-[14px] text-white placeholder-white/25 outline-none transition-all duration-150 focus:border-[#89E900]/50 focus:bg-white/[0.08]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password strength hint */}
                {password.length > 0 && (
                  <div className="flex gap-1.5 mt-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: password.length >= (i === 0 ? 1 : i === 1 ? 6 : 10)
                            ? i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : "#89E900"
                            : "rgba(255,255,255,0.08)",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl text-[14px] font-semibold text-black transition-all duration-150 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #89E900 0%, #6BBF00 100%)",
                  boxShadow: "0 4px 24px rgba(137,233,0,0.25)",
                }}
                onMouseEnter={e => !loading && ((e.currentTarget as HTMLElement).style.boxShadow = "0 6px 32px rgba(137,233,0,0.40)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(137,233,0,0.25)")}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Creating account…" : "Create account"}
              </button>

              <p className="text-center text-[11px] text-white/25 leading-relaxed">
                By creating an account you agree to our{" "}
                <span className="text-white/40 underline cursor-pointer">Terms of Service</span>{" "}
                and{" "}
                <span className="text-white/40 underline cursor-pointer">Privacy Policy</span>.
              </p>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-[12px] text-white/25 font-medium">or continue with</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            {/* Social */}
            <div className="flex gap-3">
              {[
                {
                  label: "Google",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  ),
                },
                {
                  label: "Apple",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04l-.07.28zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  ),
                },
                {
                  label: "GitHub",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                  ),
                },
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toast.info(`${label} sign-up coming soon`)}
                  className="flex-1 h-12 rounded-2xl border border-white/[0.09] bg-white/[0.04] flex items-center justify-center transition-all duration-150 hover:bg-white/[0.08] hover:border-white/[0.15]"
                  aria-label={`Continue with ${label}`}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Footer link */}
            <p className="text-center text-[13px] text-white/35">
              Already have an account?{" "}
              <Link to="/login" className="text-[#89E900] hover:text-[#a5f030] font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Visual Panel (hidden on mobile) ── */}
      <div
        className="hidden lg:flex lg:w-[50%] xl:w-[55%] flex-col items-center justify-center relative overflow-hidden p-12"
        style={{
          background: "linear-gradient(135deg, #0f1a00 0%, #111111 40%, #0d1500 100%)",
        }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(137,233,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(137,233,0,1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full blur-[130px] opacity-15" style={{ background: "#89E900" }} />
        <div className="absolute bottom-1/4 left-1/4 h-40 w-40 rounded-full blur-[90px] opacity-10" style={{ background: "#89E900" }} />

        <div className="relative z-10 flex flex-col items-center text-center max-w-md space-y-8">

          {/* Star rating */}
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-[#89E900] text-[#89E900]" />
            ))}
            <span className="text-[12px] text-white/50 ml-1">Loved by 2,000+ creators</span>
          </div>

          {/* Perks list */}
          <div className="w-full space-y-3">
            {PERKS.map((perk) => (
              <div
                key={perk}
                className="flex items-start gap-3 p-4 rounded-2xl border border-white/[0.07] text-left"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <CheckCircle2 className="h-4 w-4 text-[#89E900] shrink-0 mt-0.5" />
                <span className="text-[13px] text-white/65 leading-snug">{perk}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div
            className="w-full p-5 rounded-2xl border border-white/[0.07] text-left"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <p className="text-[13px] text-white/55 leading-relaxed italic">
              "PixaLera saved me hours every week. The catalog shots look like they were done by a pro studio."
            </p>
            <div className="flex items-center gap-2.5 mt-4">
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold text-black" style={{ background: "#89E900" }}>
                R
              </div>
              <div>
                <p className="text-[12px] font-semibold text-white/70">Rahul M.</p>
                <p className="text-[11px] text-white/30">E-commerce founder</p>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <span className="h-1.5 w-5 rounded-full" style={{ background: "#89E900" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
