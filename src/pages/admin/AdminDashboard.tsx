import { Users, Zap, CreditCard, TrendingUp, BarChart3, Clock, LayoutGrid, Camera, Clapperboard, Megaphone } from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminStats";

const TOOL_ICONS: Record<string, React.ElementType> = {
  "Generate Catalog": LayoutGrid,
  "Product Photography": Camera,
  "Cinematic Ads": Clapperboard,
  "Ad Creatives": Megaphone,
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminDashboard() {
  const { stats, recentActivity, activityLoading, last7Days, modelSplit } = useAdminStats();

  const dailyData = last7Days();
  const maxDaily = Math.max(...dailyData.map((d) => d.count), 1);
  const { flashPct, proPct } = modelSplit();

  const statCards = [
    { label: "Total Users", value: stats.loading ? "—" : stats.totalUsers.toLocaleString(), icon: Users },
    { label: "Total Generations", value: stats.loading ? "—" : stats.totalGenerations.toLocaleString(), icon: Zap },
    { label: "Credits Used", value: stats.loading ? "—" : stats.totalCreditsUsed.toLocaleString(), icon: CreditCard },
    { label: "Flash Gens", value: stats.loading ? "—" : stats.flashGenerations.toLocaleString(), icon: TrendingUp },
    { label: "Pro Gens", value: stats.loading ? "—" : stats.proGenerations.toLocaleString(), icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="h-4 w-4 text-primary" />
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
            <BarChart3 className="h-4 w-4 text-primary" /> Daily Generations (last 7 days)
          </h3>
          <div className="flex items-end gap-2 h-32">
            {dailyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{d.count}</span>
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all duration-500"
                  style={{ height: `${Math.max((d.count / maxDaily) * 100, d.count > 0 ? 6 : 0)}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
          {stats.totalGenerations === 0 && !stats.loading && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              No generations yet — data appears here in real time after users generate
            </p>
          )}
        </div>

        <div className="glass rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Model Usage</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Flash (Nano Bana Flash)</span>
                <span className="text-foreground font-medium">{flashPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${flashPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Pro (Nano Bana Pro)</span>
                <span className="text-foreground font-medium">{proPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/60 transition-all duration-700"
                  style={{ width: `${proPct}%` }}
                />
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-white/5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats.flashGenerations} Flash jobs</span>
              <span>{stats.proGenerations} Pro jobs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> Recent Activity
        </h3>
        {activityLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No activity yet — generations will appear here in real time
          </p>
        ) : (
          <div className="space-y-2.5">
            {recentActivity.slice(0, 8).map((a) => {
              const Icon = TOOL_ICONS[a.tool] || Zap;
              return (
                <div key={a.id} className="flex items-center gap-3 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-muted-foreground truncate block">{a.description}</span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {a.tool} · {a.model === "pro" ? "Pro" : "Flash"}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0">
                    {timeAgo(a.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
