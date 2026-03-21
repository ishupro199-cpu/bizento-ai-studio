import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  UserGroupIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  status: "pending" | "completed";
  reward_given: boolean;
  created_at: string;
  completed_at?: string;
  milestoneBonus?: number;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-xl border border-white/8 p-4 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
        <Icon className="h-4.5 w-4.5" style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function AdminReferralsPage() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => { fetchReferrals(); }, []);

  const fetchReferrals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/referral/all", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referrals || []);
      }
    } catch (err) {
      console.error("Failed to fetch referrals:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = referrals.filter(r => {
    const matchesSearch = !search || r.referrer_id.includes(search) || r.referred_user_id.includes(search);
    const matchesFilter = filter === "all" || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalCompleted = referrals.filter(r => r.status === "completed").length;
  const totalPending = referrals.filter(r => r.status === "pending").length;
  const totalCreditsGiven = referrals.filter(r => r.reward_given).reduce((sum, r) => sum + 20 + (r.milestoneBonus || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Referrals</h1>
            <p className="text-sm text-muted-foreground mt-1">Track all user referrals and reward distribution</p>
          </div>
          <button
            onClick={fetchReferrals}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-white/10 bg-white/4 text-muted-foreground hover:bg-white/8 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Referrals" value={referrals.length} icon={UserGroupIcon} color="#89E900" />
          <StatCard label="Completed" value={totalCompleted} icon={CheckCircleIcon} color="#22C55E" />
          <StatCard label="Pending" value={totalPending} icon={ClockIcon} color="#F59E0B" />
          <StatCard label="Credits Distributed" value={`+${totalCreditsGiven}`} icon={BoltIcon} color="#6366F1" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by user ID or email..."
              style={{ background: "#1e1e1e", color: "#fff", borderColor: "rgba(255,255,255,0.12)" }}
              className="w-full border rounded-xl pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground/40 outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", "pending", "completed"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${filter === f ? "border-primary/40 text-primary bg-primary/10" : "border-white/10 text-muted-foreground bg-white/4 hover:bg-white/8"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-3 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Referrer ID</th>
                  <th className="text-left px-4 py-3 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Referred ID</th>
                  <th className="text-left px-4 py-3 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Reward</th>
                  <th className="text-left px-4 py-3 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded-md animate-pulse bg-white/6" style={{ width: j === 2 ? 60 : j === 4 ? 80 : "100%" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      {search ? "No referrals match your search" : "No referrals yet"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((ref) => (
                    <tr key={ref.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-foreground/70">{ref.referrer_id.slice(0, 16)}...</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground/70">{ref.referred_user_id.slice(0, 16)}...</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${ref.status === "completed" ? "text-green-400 bg-green-400/10 border border-green-400/20" : "text-amber-400 bg-amber-400/10 border border-amber-400/20"}`}>
                          {ref.status === "completed" ? <CheckCircleIcon className="h-3 w-3" /> : <ClockIcon className="h-3 w-3" />}
                          {ref.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {ref.reward_given ? (
                          <span className="text-xs text-primary font-semibold">+{20 + (ref.milestoneBonus || 0)} cr</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground/60">
                        {new Date(ref.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/50 text-center">
          Showing {filtered.length} of {referrals.length} referrals
        </p>
      </div>
    </div>
  );
}
