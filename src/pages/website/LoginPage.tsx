import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Loader2, Eye, EyeOff, ArrowLeft, Zap, ImageIcon, Layers,
  Mail, Phone, RefreshCw,
} from "lucide-react";
import { PixaleraIcon } from "@/components/PixaleraIcon";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { isTempEmail } from "@/lib/authErrors";
import { PhoneAuthPanel } from "@/components/app/PhoneAuthPanel";

type AuthTab = "email" | "phone";

export default function LoginPage() {
  const [tab, setTab] = useState<AuthTab>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { signIn, signInWithGoogle, signInWithApple, sendPasswordReset } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isTempEmail(email)) {
      toast.error("Disposable email addresses are not allowed.");
      return;
    }
    setLoading(true);
    setUnverifiedEmail(false);
    try {
      await signIn(email, password);
      navigate("/app");
    } catch (err: any) {
      if (err.message?.includes("verify your email") || err.code === "auth/unverified-email") {
        setUnverifiedEmail(true);
      } else {
        toast.error(err.message || "Sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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

  const handleAppleSignIn = async () => {
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

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Enter your email address first");
      return;
    }
    if (isTempEmail(email)) {
      toast.error("Cannot send reset link to a disposable email.");
      return;
    }
    try {
      await sendPasswordReset(email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const { signInWithEmailAndPassword, sendEmailVerification, signOut } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      await signOut(auth);
      toast.success("Verification email resent! Check your inbox.");
      setUnverifiedEmail(false);
    } catch {
      toast.error("Could not resend verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

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
              <h1 className="text-[2rem] font-bold text-white leading-tight">Welcome back!</h1>
              <p className="text-[14px] text-white/45 mt-2 leading-relaxed">
                Sign in to start creating stunning AI-powered visuals.
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
                onClick={() => { setTab("phone"); setUnverifiedEmail(false); }}
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
              <div className="space-y-4">
                {/* Unverified email notice */}
                {unverifiedEmail && (
                  <div className="rounded-2xl p-4 border border-yellow-500/20 space-y-3" style={{ background: "rgba(234,179,8,0.07)" }}>
                    <p className="text-[13px] text-yellow-400/90 leading-snug">
                      Your email <strong>{email}</strong> hasn't been verified yet. Check your inbox for the verification link.
                    </p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="flex items-center gap-1.5 text-[12px] text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                    >
                      {resendLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      Resend verification email
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-white/60">Email address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-12 rounded-2xl bg-white/[0.06] border border-white/[0.09] px-4 text-[14px] text-white placeholder-white/25 outline-none transition-all duration-150 focus:border-[#89E900]/50 focus:bg-white/[0.08] focus:ring-0"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] font-medium text-white/60">Password</label>
                      <button
                        type="button"
                        className="text-[12px] text-[#89E900]/80 hover:text-[#89E900] transition-colors"
                        onClick={handleForgotPassword}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        placeholder="••••••••"
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
                  </div>

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
                    {loading ? "Signing in…" : "Sign in"}
                  </button>
                </form>
              </div>
            ) : (
              <PhoneAuthPanel mode="login" />
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
                    onClick={handleGoogleSignIn}
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
                    onClick={handleAppleSignIn}
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
              Not a member?{" "}
              <Link to="/signup" className="text-[#89E900] hover:text-[#a5f030] font-medium transition-colors">
                Create an account
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full blur-[120px] opacity-20" style={{ background: "#89E900" }} />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full blur-[100px] opacity-10" style={{ background: "#89E900" }} />

        <div className="relative z-10 flex flex-col items-center text-center max-w-md space-y-8">
          <div className="relative w-full max-w-sm h-64">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 rounded-2xl p-4 border border-white/10"
              style={{ background: "rgba(25,25,25,0.85)", backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-xl bg-[#89E900]/20 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-[#89E900]" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-white leading-none">Catalog Shot</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Flash model</p>
                </div>
              </div>
              <div className="h-24 rounded-xl overflow-hidden mb-3" style={{ background: "linear-gradient(135deg, #1a2a00 0%, #89E900 100%)", opacity: 0.7 }} />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/50">4 credits used</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(137,233,0,0.15)", color: "#89E900" }}>Done</span>
              </div>
            </div>
            <div
              className="absolute top-2 right-0 rounded-xl px-3 py-2 border border-white/10 flex items-center gap-2"
              style={{ background: "rgba(20,20,20,0.90)", backdropFilter: "blur(8px)" }}
            >
              <Zap className="h-3.5 w-3.5 text-[#89E900] fill-[#89E900]" />
              <span className="text-[11px] font-semibold text-white">12 generated</span>
            </div>
            <div
              className="absolute bottom-4 left-0 rounded-xl px-3 py-2 border border-white/10 flex items-center gap-2"
              style={{ background: "rgba(20,20,20,0.90)", backdropFilter: "blur(8px)" }}
            >
              <Layers className="h-3.5 w-3.5 text-[#89E900]" />
              <span className="text-[11px] font-semibold text-white">3 styles</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-[1.6rem] font-bold text-white leading-snug">
              Turn product photos into{" "}
              <span style={{ color: "#89E900" }}>pro visuals</span>{" "}
              in seconds
            </h2>
            <p className="text-[14px] text-white/40 leading-relaxed">
              Upload a simple photo and let Pixalera AI generate professional catalog images, cinematic ads, and social media creatives.
            </p>
          </div>

          <div className="flex gap-1.5">
            <span className="h-1.5 w-5 rounded-full" style={{ background: "#89E900" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
