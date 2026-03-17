import { useRef, useState } from "react";
import { Phone, Loader2, ChevronLeft, ConfirmationResult } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
  nameForSignup?: string;
}

type Step = "phone" | "otp";

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", label: "IN" },
  { code: "+1", flag: "🇺🇸", label: "US" },
  { code: "+44", flag: "🇬🇧", label: "GB" },
  { code: "+971", flag: "🇦🇪", label: "AE" },
  { code: "+61", flag: "🇦🇺", label: "AU" },
  { code: "+49", flag: "🇩🇪", label: "DE" },
  { code: "+81", flag: "🇯🇵", label: "JP" },
  { code: "+65", flag: "🇸🇬", label: "SG" },
];

export function PhoneAuthPanel({ onBack, nameForSignup }: Props) {
  const { sendPhoneOtp, confirmPhoneOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<import("firebase/auth").ConfirmationResult | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const recaptchaId = "recaptcha-phone-container";

  const fullPhone = `${countryCode}${phone.replace(/\D/g, "")}`;

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) {
      toast.error("Enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      const result = await sendPhoneOtp(fullPhone, recaptchaId);
      setConfirmation(result);
      setStep("otp");
      toast.success(`OTP sent to ${fullPhone}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    if (!confirmation) return;
    setLoading(true);
    try {
      await confirmPhoneOtp(confirmation, code, nameForSignup);
      navigate("/app");
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
      {/* Invisible reCAPTCHA anchor */}
      <div id={recaptchaId} />

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={step === "otp" ? () => setStep("phone") : onBack}
          className="flex items-center justify-center h-8 w-8 rounded-full border border-white/10 text-white/40 hover:text-white/80 hover:border-white/25 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="text-[14px] font-semibold text-white">
            {step === "phone" ? "Sign in with phone" : "Enter verification code"}
          </p>
          {step === "otp" && (
            <p className="text-[11px] text-white/35 mt-0.5">Sent to {fullPhone}</p>
          )}
        </div>
      </div>

      {step === "phone" ? (
        <>
          {/* Country + Phone */}
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="h-12 rounded-2xl bg-white/[0.06] border border-white/[0.09] px-3 text-[13px] text-white outline-none focus:border-[#89E900]/50 cursor-pointer appearance-none w-24 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code} style={{ background: "#1a1a1a" }}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              className="flex-1 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.09] px-4 text-[14px] text-white placeholder-white/25 outline-none transition-all duration-150 focus:border-[#89E900]/50 focus:bg-white/[0.08]"
              autoFocus
            />
          </div>

          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full h-12 rounded-2xl text-[14px] font-semibold text-black flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #89E900 0%, #6BBF00 100%)",
              boxShadow: "0 4px 24px rgba(137,233,0,0.25)",
            }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
            {loading ? "Sending OTP…" : "Send OTP"}
          </button>
        </>
      ) : (
        <>
          {/* OTP boxes */}
          <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { otpRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKey(idx, e)}
                autoFocus={idx === 0}
                className="w-12 h-14 text-center text-[18px] font-bold rounded-2xl bg-white/[0.06] border border-white/[0.09] text-white outline-none transition-all duration-150 focus:border-[#89E900]/60 focus:bg-white/[0.09]"
                style={digit ? { borderColor: "rgba(137,233,0,0.5)" } : {}}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.join("").length < 6}
            className="w-full h-12 rounded-2xl text-[14px] font-semibold text-black flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #89E900 0%, #6BBF00 100%)",
              boxShadow: "0 4px 24px rgba(137,233,0,0.25)",
            }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Verifying…" : "Verify & Continue"}
          </button>

          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full text-[12px] text-white/30 hover:text-white/55 transition-colors text-center"
          >
            Didn't receive it? Resend OTP
          </button>
        </>
      )}
    </div>
  );
}
