import { Users, Zap, CreditCard, TrendingUp, DollarSign, BarChart3 } from "lucide-react";

const stats = [
  { label: "Total Users", value: "12,483", change: "+12%", icon: Users },
  { label: "Total Generations", value: "284,912", change: "+24%", icon: Zap },
  { label: "Credits Used", value: "1.2M", change: "+18%", icon: CreditCard },
  { label: "Revenue", value: "$48,290", change: "+31%", icon: TrendingUp },
  { label: "AI Cost", value: "$12,840", change: "+15%", icon: DollarSign },
];

const dailyData = [
  { day: "Mon", count: 42 }, { day: "Tue", count: 68 }, { day: "Wed", count: 55 },
  { day: "Thu", count: 80 }, { day: "Fri", count: 95 }, { day: "Sat", count: 60 }, { day: "Sun", count: 45 },
];
const maxDaily = Math.max(...dailyData.map(d => d.count));

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-primary font-medium">{stat.change}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
            <BarChart3 className="h-4 w-4 text-primary" /> Daily Generations
          </h3>
          <div className="flex items-end gap-2 h-32">
            {dailyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{d.count}</span>
                <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${(d.count / maxDaily) * 100}%` }} />
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Recent Activity</h3>
          <div className="space-y-3">
            {["New user signup: jane@example.com", "Pro subscription: mike@example.com", "1000 credits purchased", "New user signup: alex@example.com"].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="text-muted-foreground">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
