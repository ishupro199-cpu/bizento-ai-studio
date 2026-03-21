import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface MaintenanceData {
  isActive: boolean;
  message: string;
  estimatedTime: string;
}

export default function MaintenancePage() {
  const [data, setData] = useState<MaintenanceData>({
    isActive: true,
    message: "We're upgrading our servers for a better experience!",
    estimatedTime: "2 hours",
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "maintenance_mode"), (snap) => {
      if (snap.exists()) {
        const d = snap.data() as MaintenanceData;
        setData(d);
        if (!d.isActive) {
          window.location.href = "/";
        }
      }
    });
    return () => unsub();
  }, []);

  return (
    <>
      <style>{`
        @keyframes rotateCog {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0px); }
          20% { opacity: 0.6; }
          80% { opacity: 0.4; }
          100% { opacity: 0; transform: translateY(-100vh); }
        }
        .cog-spin {
          animation: rotateCog 8s linear infinite;
          transform-origin: center;
        }
        .shimmer-bar {
          background: linear-gradient(90deg, rgba(137,233,0,0.1) 0%, rgba(137,233,0,0.5) 50%, rgba(137,233,0,0.1) 100%);
          background-size: 200% auto;
          animation: shimmer 2s ease infinite;
        }
        .fade-in-up {
          animation: fadeInUp 0.8s ease forwards;
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(137,233,0,0.3);
          animation: floatUp linear infinite;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0a0a14 0%, #0d0d1a 50%, #000008 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
        }}
      >
        {/* Floating particles */}
        {[
          { left: "10%", size: 8, delay: "0s", duration: "8s" },
          { left: "20%", size: 5, delay: "1.5s", duration: "11s" },
          { left: "35%", size: 10, delay: "3s", duration: "9s" },
          { left: "55%", size: 6, delay: "0.5s", duration: "13s" },
          { left: "70%", size: 9, delay: "2s", duration: "10s" },
          { left: "80%", size: 5, delay: "4s", duration: "12s" },
          { left: "90%", size: 7, delay: "1s", duration: "7s" },
          { left: "45%", size: 4, delay: "3.5s", duration: "14s" },
        ].map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: p.left,
              bottom: "-20px",
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}

        {/* Glow effect */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: 400, height: 400, background: "radial-gradient(ellipse, rgba(137,233,0,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div
          className="fade-in-up"
          style={{
            textAlign: "center",
            maxWidth: 480,
            padding: "40px 32px",
            zIndex: 10,
          }}
        >
          {/* Animated Gear SVG */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <svg
              className="cog-spin"
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M40 25a15 15 0 1 0 0 30 15 15 0 0 0 0-30zm0 24a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"
                fill="#89E900"
                fillOpacity="0.9"
              />
              <path
                d="M67.6 43.2l-4.8-1.1a24.3 24.3 0 0 0-.7-3.4l3.6-3.3-4-6.9-4.6 1.5a24 24 0 0 0-2.6-2.4l1.1-4.8-6.9-4-3.3 3.6a24.3 24.3 0 0 0-3.4-.7L40.8 17h-8l-1.1 4.8a24.3 24.3 0 0 0-3.4.7l-3.3-3.6-6.9 4 1.5 4.6a24 24 0 0 0-2.4 2.6l-4.8-1.1-4 6.9 3.6 3.3a24.3 24.3 0 0 0-.7 3.4L7 43.2v8l4.8 1.1a24.3 24.3 0 0 0 .7 3.4l-3.6 3.3 4 6.9 4.6-1.5a24 24 0 0 0 2.6 2.4l-1.1 4.8 6.9 4 3.3-3.6a24.3 24.3 0 0 0 3.4.7l1.1 4.8h8l1.1-4.8a24.3 24.3 0 0 0 3.4-.7l3.3 3.6 6.9-4-1.5-4.6a24 24 0 0 0 2.4-2.6l4.8 1.1 4-6.9-3.6-3.3a24.3 24.3 0 0 0 .7-3.4l4.8-1.1v-8z"
                fill="#89E900"
                fillOpacity="0.25"
              />
            </svg>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 36, fontWeight: 500, color: "#fff", margin: "0 0 12px 0", letterSpacing: "-0.5px" }}>
            We'll be right back
          </h1>

          {/* Custom message */}
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", margin: "0 0 8px 0", lineHeight: 1.6 }}>
            {data.message}
          </p>

          {/* Estimated time */}
          <p style={{ fontSize: 14, color: "rgba(137,233,0,0.7)", margin: "0 0 32px 0", fontWeight: 500 }}>
            Estimated time: {data.estimatedTime}
          </p>

          {/* Animated progress bar */}
          <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 32 }}>
            <div
              className="shimmer-bar"
              style={{ height: "100%", borderRadius: 4 }}
            />
          </div>

          {/* Follow text */}
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", margin: 0 }}>
            Follow us{" "}
            <span style={{ color: "rgba(137,233,0,0.5)", fontWeight: 500 }}>@pixalera</span>{" "}
            for updates
          </p>

          {/* Logo */}
          <div style={{ marginTop: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: 0.5 }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: "#89E900" }} />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, letterSpacing: "0.05em" }}>PIXALERA</span>
          </div>
        </div>
      </div>
    </>
  );
}
