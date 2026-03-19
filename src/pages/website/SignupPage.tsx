import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeIcon, EyeSlashIcon, ArrowLeftIcon, CheckCircleIcon, StarIcon,
  EnvelopeIcon, PhoneIcon, EnvelopeOpenIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

import { PixaleraIcon } from "@/components/PixaleraIcon";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { isTempEmail } from "@/lib/authErrors";
import { PhoneAuthPanel } from "@/components/app/PhoneAuthPanel";

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);
const Eye = EyeIcon;
const EyeOff = EyeSlashIcon;
const ArrowLeft = ArrowLeftIcon;
const CheckCircle2 = CheckCircleIcon;
const Star = StarIcon;
const Mail = EnvelopeIcon;
const Phone = PhoneIcon;
const MailCheck = EnvelopeOpenIcon;

type AuthTab = "email" | "phone";

const PERKS = [
  "3 free credits on signup — no card needed",
  "Generate catalog shots, ads & social creatives",
  "Flash AI model with professional results",
];

export default function SignupPage() {
  const [tab, setTab] = useState<AuthTab>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate("/app");
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setAppleLoading(true);
    try {
      await signInWithApple();
      navigate("/app");
    } catch (err: any) {
      toast.error(err.message || "Apple sign-in failed");
    } finally {
      setAppleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please enter your full name."); return; }
    if (!email || !password) return;
    if (isTempEmail(email)) {
      toast.error("Disposable email addresses are not allowed. Please use a real email.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(email, password, name);
      if (result.needsVerification) {
        setVerificationSent(true);
      } else {
        toast.success("Account created! Welcome to Pixalera AI");
        navigate("/app");
      }
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    try {
      const { signInWithEmailAndPassword, sendEmailVerification, signOut } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      await signOut(auth);
      toast.success("Verification email resent!");
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) { clearInterval(interval); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch {
      toast.error("Could not resend. Please try signing up again.");
    } finally {
      setResendLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111111] px-6">
        <div className="w-full max-w-[400px] text-center space-y-6">
          <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center" style={{ background: "rgba(137,233,0,0.12)", border: "1px solid rgba(137,233,0,0.2)" }}>
            <MailCheck className="h-9 w-9 text-[#89E900]" />
          </div>
          <div>
            <h1 className="text-[1.75rem] font-bold text-white leading-tight">Check your inbox!</h1>
            <p className="text-[14px] text-white/45 mt-3 leading-relaxed">
              We've sent a verification link to<br />
              <span className="text-white/70 font-medium">{email}</span>
            </p>
          </div>
          <div className="rounded-2xl p-5 border border-white/[0.07] text-left space-y-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-[13px] text-white/55">
              1. Open the email from <strong className="text-white/70">Pixalera AI</strong>
            </p>
            <p className="text-[13px] text-white/55">
              2. Click <strong className="text-white/70">"Verify your email address"</strong>
            </p>
            <p className="text-[13px] text-white/55">
              3. Return here and <Link to="/login" className="text-[#89E900] hover:underline">sign in</Link>
            </p>
          </div>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full h-12 rounded-2xl text-[14px] font-semibold text-black flex items-center justify-center transition-all duration-150"
              style={{
                background: "linear-gradient(135deg, #89E900 0%, #6BBF00 100%)",
                boxShadow: "0 4px 24px rgba(137,233,0,0.25)",
              }}
            >
              Go to Sign in
            </Link>
            <button
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              className="w-full h-11 rounded-2xl text-[13px] text-white/40 hover:text-white/65 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {resendLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive it? Resend"}
            </button>
          </div>
          <p className="text-[12px] text-white/20">Check your spam/junk folder if you don't see it.</p>
        </div>
      </div>
    );
  }

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#111111]">

      {/* ── LEFT — Form Panel ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 relative">

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

        <div className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-[380px] space-y-6">

            {/* Logo + heading */}
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <PixaleraIcon size={32} />
                <span className="text-[15px] font-bold text-white tracking-tight">
                  Pixalera<span className="text-[#89E900]"> AI</span>
                </span>
              </div>
              <h1 className="text-[2rem] font-bold text-white leading-tight">Create your account</h1>
              <p className="text-[14px] text-white/45 mt-2 leading-relaxed">
                Join thousands of creators generating pro visuals with AI.
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex p-1 rounded-2xl gap-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <button
                type="button"
                onClick={() => setTab("email")}
                className="flex-1 h-9 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all duration-200"
                style={tab === "email"
                  ? { background: "rgba(255,255,255,0.10)", color: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }
                  : { color: "rgba(255,255,255,0.35)" }
                }
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setTab("phone")}
                className="flex-1 h-9 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all duration-200"
                style={tab === "phone"
                  ? { background: "rgba(255,255,255,0.10)", color: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }
                  : { color: "rgba(255,255,255,0.35)" }
                }
              >
                <Phone className="h-3.5 w-3.5" />
                Phone
              </button>
            </div>

            {/* Form area — Email or Phone */}
            {tab === "email" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-white/60">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 8 characters"
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
                  {password.length > 0 && (
                    <div className="flex gap-1.5 mt-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background: pwStrength >= level
                              ? level === 1 ? "#ef4444" : level === 2 ? "#f59e0b" : "#89E900"
                              : "rgba(255,255,255,0.08)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-3 cursor-pointer group mt-1">
                  <div
                    onClick={() => setAgreedToTerms((v) => !v)}
                    className="flex-shrink-0 h-5 w-5 rounded-md border mt-0.5 flex items-center justify-center transition-all duration-150"
                    style={{
                      background: agreedToTerms ? "#89E900" : "rgba(255,255,255,0.05)",
                      borderColor: agreedToTerms ? "#89E900" : "rgba(255,255,255,0.15)",
                    }}
                  >
                    {agreedToTerms && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#0D0F14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[12px] text-white/40 leading-relaxed group-hover:text-white/55 transition-colors select-none" onClick={() => setAgreedToTerms((v) => !v)}>
                    I agree to the{" "}
                    <span className="text-white/65 underline" onClick={e => e.stopPropagation()}>Terms of Service</span>{" "}
                    and{" "}
                    <span className="text-white/65 underline" onClick={e => e.stopPropagation()}>Privacy Policy</span>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading || !agreedToTerms}
                  className="w-full h-12 rounded-2xl text-[14px] font-semibold text-black transition-all duration-150 flex items-center justify-center gap-2 mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #89E900 0%, #6BBF00 100%)",
                    boxShadow: agreedToTerms ? "0 4px 24px rgba(137,233,0,0.25)" : "none",
                  }}
                  onMouseEnter={e => (!loading && agreedToTerms) && ((e.currentTarget as HTMLElement).style.boxShadow = "0 6px 32px rgba(137,233,0,0.40)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = agreedToTerms ? "0 4px 24px rgba(137,233,0,0.25)" : "none")}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>
            ) : (
              <PhoneAuthPanel mode="signup" nameForSignup={name || undefined} />
            )}

            {/* Divider + Social (only on email tab) */}
            {tab === "email" && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/[0.07]" />
                  <span className="text-[12px] text-white/25 font-medium">or continue with</span>
                  <div className="flex-1 h-px bg-white/[0.07]" />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={googleLoading}
                    className="flex-1 h-12 rounded-2xl border border-white/[0.09] bg-white/[0.04] flex items-center justify-center transition-all duration-150 hover:bg-white/[0.08] hover:border-white/[0.15] disabled:opacity-60"
                    aria-label="Continue with Google"
                  >
                    {googleLoading ? <Loader2 className="h-4 w-4 animate-spin text-white/50" /> : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleAppleSignUp}
                    disabled={appleLoading}
                    className="flex-1 h-12 rounded-2xl border border-white/[0.09] bg-white/[0.04] flex items-center justify-center transition-all duration-150 hover:bg-white/[0.08] hover:border-white/[0.15] disabled:opacity-60"
                    aria-label="Continue with Apple"
                  >
                    {appleLoading ? <Loader2 className="h-4 w-4 animate-spin text-white/50" /> : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04l-.07.28zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </>
            )}

            <p className="text-center text-[13px] text-white/35">
              Already have an account?{" "}
              <Link to="/login" className="text-[#89E900] hover:text-[#a5f030] font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Visual Panel ── */}
      <div
        className="hidden lg:flex lg:w-[50%] xl:w-[55%] flex-col items-center justify-center relative overflow-hidden p-12"
        style={{ background: "linear-gradient(135deg, #0f1a00 0%, #111111 40%, #0d1500 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(137,233,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(137,233,0,1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full blur-[130px] opacity-15" style={{ background: "#89E900" }} />
        <div className="absolute bottom-1/4 left-1/4 h-40 w-40 rounded-full blur-[90px] opacity-10" style={{ background: "#89E900" }} />

        <div className="relative z-10 flex flex-col items-center text-center max-w-md space-y-8">
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-[#89E900] text-[#89E900]" />
            ))}
            <span className="text-[12px] text-white/50 ml-1">Loved by 2,000+ creators</span>
          </div>

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

          <div
            className="w-full p-5 rounded-2xl border border-white/[0.07] text-left"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <p className="text-[13px] text-white/55 leading-relaxed italic">
              "Pixalera AI saved me hours every week. The catalog shots look like they were done by a pro studio."
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
