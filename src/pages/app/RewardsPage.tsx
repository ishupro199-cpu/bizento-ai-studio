import { useState, useEffect } from "react";
import {
  GiftIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  UserGroupIcon,
  BoltIcon,
  ClockIcon,
  ShareIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ReferralStats {
  totalReferrals: number;
  creditsEarned: number;
  pendingRewards: number;
  referralCode: string;
  referrals: Array<{
    id: string;
    referred_user_id: string;
    status: "pending" | "completed";
    reward_given: boolean;
    created_at: string;
    milestoneBonus?: number;
  }>;
  nextMilestone: { count: number; bonus: number } | null;
}

const MILESTONES = [
  { count: 3, bonus: 10, label: "First Batch" },
  { count: 10, bonus: 50, label: "Growth" },
  { count: 25, bonus: 150, label: "Champion" },
];

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-2xl p-4 border border-white/8 flex items-center gap-4" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralLink = user?.uid
    ? `${window.location.origin}/signup?ref=${user.uid}`
    : "";

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/referral/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareVia = (platform: string) => {
    const msg = encodeURIComponent(`Create AI product ads in seconds 🚀\nTry Pixalera AI: ${referralLink}`);
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${msg}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${msg}`,
      twitter: `https://twitter.com/intent/tweet?text=${msg}`,
    };
    window.open(urls[platform], "_blank");
  };

  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(137,233,0,0.1)", border: "1px solid rgba(137,233,0,0.2)" }}>
              <GiftIcon className="h-5 w-5" style={{ color: "#89E900" }} />
            </div>
            <h1 className="text-xl font-bold text-foreground">Invite & Earn Credits</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-11.5">
            Invite friends and earn free credits when they join and generate images.
          </p>
        </div>

        {/* Referral Link */}
        <div className="rounded-2xl p-5 border border-white/10" style={{ background: "rgba(137,233,0,0.04)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Referral Link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-background/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground/80 font-mono truncate">
              {loading ? "Loading..." : referralLink || "Sign in to get your link"}
            </div>
            <button
              onClick={handleCopy}
              disabled={!referralLink}
              className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl border transition-all duration-200 disabled:opacity-40"
              style={{
                background: copied ? "rgba(137,233,0,0.2)" : "rgba(255,255,255,0.06)",
                borderColor: copied ? "rgba(137,233,0,0.4)" : "rgba(255,255,255,0.12)",
              }}
            >
              {copied ? <CheckIcon className="h-4 w-4" style={{ color: "#89E900" }} /> : <ClipboardDocumentIcon className="h-4 w-4 text-muted-foreground" />}
            </button>
          </div>

          {/* Share buttons */}
          <div className="flex gap-2 mt-3">
            {[
              { id: "whatsapp", label: "WhatsApp", color: "#25D366" },
              { id: "telegram", label: "Telegram", color: "#229ED9" },
              { id: "twitter", label: "Twitter / X", color: "#1DA1F2" },
            ].map(({ id, label, color }) => (
              <button
                key={id}
                onClick={() => shareVia(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border border-white/8 transition-all hover:border-white/15"
                style={{ background: `${color}10`, color }}
              >
                <ShareIcon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl h-20 animate-pulse border border-white/8" style={{ background: "rgba(255,255,255,0.03)" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={UserGroupIcon} label="Total Referrals" value={stats?.totalReferrals ?? 0} color="#89E900" />
            <StatCard icon={BoltIcon} label="Credits Earned" value={stats?.creditsEarned ?? 0} color="#F59E0B" />
            <StatCard icon={ClockIcon} label="Pending" value={stats?.pendingRewards ?? 0} color="#6366F1" />
          </div>
        )}

        {/* How it works */}
        <div className="rounded-2xl p-5 border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">How It Works</p>
          <div className="space-y-3">
            {[
              { step: "1", text: "Share your unique referral link with friends" },
              { step: "2", text: "Friend signs up and completes their first generation" },
              { step: "3", text: "You earn +20 credits • Friend earns +10 credits" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: "rgba(137,233,0,0.12)", color: "#89E900", border: "1px solid rgba(137,233,0,0.2)" }}>
                  {step}
                </div>
                <p className="text-sm text-foreground/70 pt-0.5">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="rounded-2xl p-5 border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrophyIcon className="h-4 w-4" style={{ color: "#F59E0B" }} />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bonus Milestones</p>
          </div>
          <div className="space-y-3">
            {MILESTONES.map(({ count, bonus, label }) => {
              const reached = (stats?.totalReferrals ?? 0) >= count;
              return (
                <div key={count} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${reached ? "border-primary/30" : "border-white/8"}`}
                  style={{ background: reached ? "rgba(137,233,0,0.06)" : "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-3">
                    {reached
                      ? <CheckIcon className="h-4 w-4 shrink-0" style={{ color: "#89E900" }} />
                      : <div className="h-4 w-4 rounded-full border border-white/20 shrink-0" />}
                    <div>
                      <p className={`text-sm font-medium ${reached ? "text-primary" : "text-foreground/70"}`}>{count} Referrals — {label}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: reached ? "#89E900" : "rgba(255,255,255,0.4)" }}>+{bonus} credits</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Referral history */}
        {stats?.referrals && stats.referrals.length > 0 && (
          <div className="rounded-2xl p-5 border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Recent Referrals</p>
            <div className="space-y-2">
              {stats.referrals.slice(0, 10).map((ref) => (
                <div key={ref.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 border border-white/6" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-white/8 flex items-center justify-center text-xs text-muted-foreground font-medium">
                      {ref.referred_user_id.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-foreground/70 font-mono">{ref.referred_user_id.slice(0, 12)}...</p>
                      <p className="text-[10px] text-muted-foreground/50">{new Date(ref.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${ref.status === "completed" ? "text-primary bg-primary/10 border border-primary/20" : "text-amber-400 bg-amber-400/10 border border-amber-400/20"}`}>
                    {ref.status === "completed" ? `+${20 + (ref.milestoneBonus || 0)} cr` : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
