import { BarChart3, Zap, TrendingUp } from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminStats";

export default function AdminAnalyticsPage() {
  const { stats, last7Days, toolBreakdown, modelSplit } = useAdminStats();

  const dailyData = last7Days();
  const maxDaily = Math.max(...dailyData.map((d) => d.count), 1);

  const tools = toolBreakdown();
  const maxTool = Math.max(...tools.map((t) => t.count), 1);

  const { flashPct, proPct } = modelSplit();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">AI Analytics</h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground glass rounded-full px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Live data from Firebase
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass rounded-xl p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {stats.loading ? "—" : stats.totalGenerations.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Generations</p>
          </div>
        </div>
        <div className="glass rounded-xl p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {stats.loading ? "—" : stats.flashGenerations.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Flash Generations</p>
          </div>
        </div>
        <div className="glass rounded-xl p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {stats.loading ? "—" : stats.proGenerations.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Pro Generations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Daily Generations
          </h3>
          <div className="flex items-end gap-2 h-40">
            {dailyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{d.count || ""}</span>
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all duration-500"
                  style={{ height: `${Math.max((d.count / maxDaily) * 100, d.count > 0 ? 5 : 0)}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
          {stats.totalGenerations === 0 && !stats.loading && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              No data yet — generates automatically as users create images
            </p>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Model Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Nano Bana Flash</span>
                <span className="text-foreground font-medium">{flashPct}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${flashPct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{stats.flashGenerations} jobs</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Nano Bana Pro</span>
                <span className="text-foreground font-medium">{proPct}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/60 transition-all duration-700"
                  style={{ width: `${proPct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{stats.proGenerations} jobs</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Tool Usage Breakdown</h3>
          <div className="space-y-4">
            {tools.map((t) => (
              <div key={t.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="text-foreground font-medium">{t.count} generations</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(t.count / maxTool) * 100}%`,
                      background: t.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {stats.totalGenerations === 0 && !stats.loading && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Tool breakdown populates automatically as generations occur
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
