import { CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const services = [
  { name: "API Server", status: "Operational", uptime: "99.98%" },
  { name: "AI Pipeline", status: "Operational", uptime: "99.95%" },
  { name: "Storage (S3)", status: "Operational", uptime: "99.99%" },
  { name: "CDN", status: "Operational", uptime: "99.99%" },
  { name: "Database", status: "Operational", uptime: "99.97%" },
  { name: "Auth Service", status: "Degraded", uptime: "98.50%" },
];

const metrics = [
  { label: "Total Generations Today", value: "1,248" },
  { label: "Flash Generations", value: "892" },
  { label: "Pro Generations", value: "356" },
  { label: "Avg Generation Time", value: "3.2s" },
  { label: "Queue Size", value: "12" },
  { label: "Error Rate", value: "0.3%" },
];

export default function AdminSystemPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">System Monitoring</h1>

      <div className="glass rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Service Status</h3>
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {s.status === "Operational" ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm text-foreground">{s.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{s.uptime}</span>
                <Badge variant={s.status === "Operational" ? "default" : "secondary"} className="text-[10px]">
                  {s.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="glass rounded-xl p-4">
            <p className="text-xl font-bold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
