import { Users, Zap, CreditCard, TrendingUp } from "lucide-react";

const stats = [
  { label: "Total Users", value: "12,483", change: "+12%", icon: Users },
  { label: "Total Generations", value: "284,912", change: "+24%", icon: Zap },
  { label: "Credits Used", value: "1.2M", change: "+18%", icon: CreditCard },
  { label: "Revenue", value: "$48,290", change: "+31%", icon: TrendingUp },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-xs text-primary font-medium">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {["New user signup: jane@example.com", "Pro subscription: mike@example.com", "1000 credits purchased", "New user signup: alex@example.com"].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="text-muted-foreground">{activity}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            {[
              { name: "API Server", status: "Operational" },
              { name: "AI Pipeline", status: "Operational" },
              { name: "Storage", status: "Operational" },
              { name: "CDN", status: "Operational" },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{s.name}</span>
                <span className="text-primary text-xs font-medium">{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
