import { BarChart3 } from "lucide-react";

const dailyData = [
  { day: "Mon", count: 42 }, { day: "Tue", count: 68 }, { day: "Wed", count: 55 },
  { day: "Thu", count: 80 }, { day: "Fri", count: 95 }, { day: "Sat", count: 60 }, { day: "Sun", count: 45 },
];

const toolData = [
  { name: "Catalog", count: 420, color: "hsl(85 100% 45%)" },
  { name: "Photography", count: 280, color: "hsl(200 80% 50%)" },
  { name: "Cinematic Ads", count: 190, color: "hsl(280 60% 50%)" },
  { name: "Ad Creatives", count: 150, color: "hsl(30 80% 50%)" },
];

const maxDaily = Math.max(...dailyData.map(d => d.count));
const maxTool = Math.max(...toolData.map(d => d.count));

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">AI Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Daily Generations
          </h3>
          <div className="flex items-end gap-2 h-40">
            {dailyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{d.count}</span>
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all"
                  style={{ height: `${(d.count / maxDaily) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Model Usage</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Flash</span>
              <span className="text-foreground font-medium">68%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: "68%" }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pro</span>
              <span className="text-foreground font-medium">32%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary/60" style={{ width: "32%" }} />
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Tool Usage Breakdown</h3>
          <div className="space-y-3">
            {toolData.map((t) => (
              <div key={t.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="text-foreground font-medium">{t.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(t.count / maxTool) * 100}%`, background: t.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
