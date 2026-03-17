import { useState, useEffect } from "react";
import { doc, onSnapshot, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";

export interface AdminStats {
  totalGenerations: number;
  totalUsers: number;
  totalCreditsUsed: number;
  flashGenerations: number;
  proGenerations: number;
  dailyCounts: Record<string, number>;
  toolUsage: Record<string, number>;
  loading: boolean;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  tool: string;
  model: string;
  timestamp: Date;
}

const DEFAULT_STATS: AdminStats = {
  totalGenerations: 0,
  totalUsers: 0,
  totalCreditsUsed: 0,
  flashGenerations: 0,
  proGenerations: 0,
  dailyCounts: {},
  toolUsage: {},
  loading: true,
};

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>(DEFAULT_STATS);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const unsubscribeStats = onSnapshot(
      doc(db, "admin", "stats"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setStats({
            totalGenerations: data.totalGenerations || 0,
            totalUsers: data.totalUsers || 0,
            totalCreditsUsed: data.totalCreditsUsed || 0,
            flashGenerations: data.flashGenerations || 0,
            proGenerations: data.proGenerations || 0,
            dailyCounts: data.dailyCounts || {},
            toolUsage: data.toolUsage || {},
            loading: false,
          });
        } else {
          setStats({ ...DEFAULT_STATS, loading: false });
        }
      },
      () => {
        setStats({ ...DEFAULT_STATS, loading: false });
      }
    );

    const q = query(
      collection(db, "generations"),
      orderBy("createdAt", "desc"),
      limit(12)
    );
    getDocs(q)
      .then((snap) => {
        const activities: RecentActivity[] = snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt;
          return {
            id: d.id,
            type: "generation",
            description: data.prompt
              ? `"${data.prompt.slice(0, 42)}${data.prompt.length > 42 ? "…" : ""}"`
              : "Image generated",
            tool: data.tool || "Generate Catalog",
            model: data.model || "flash",
            timestamp:
              ts instanceof Timestamp ? ts.toDate() : ts ? new Date(ts) : new Date(),
          };
        });
        setRecentActivity(activities);
        setActivityLoading(false);
      })
      .catch(() => setActivityLoading(false));

    return () => unsubscribeStats();
  }, []);

  const last7Days = (): { day: string; label: string; count: number }[] => {
    const days: { day: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      days.push({ day: key, label, count: stats.dailyCounts[key] || 0 });
    }
    return days;
  };

  const toolBreakdown = () => {
    const TOOLS = [
      { name: "Generate Catalog", key: "Generate Catalog", color: "hsl(85 100% 45%)" },
      { name: "Product Photography", key: "Product Photography", color: "hsl(200 80% 50%)" },
      { name: "Cinematic Ads", key: "Cinematic Ads", color: "hsl(280 60% 50%)" },
      { name: "Ad Creatives", key: "Ad Creatives", color: "hsl(30 80% 50%)" },
    ];
    return TOOLS.map((t) => ({ ...t, count: stats.toolUsage[t.key] || 0 }));
  };

  const modelSplit = () => {
    const total = stats.flashGenerations + stats.proGenerations || 1;
    return {
      flashPct: Math.round((stats.flashGenerations / total) * 100),
      proPct: Math.round((stats.proGenerations / total) * 100),
    };
  };

  return { stats, recentActivity, activityLoading, last7Days, toolBreakdown, modelSplit };
}
