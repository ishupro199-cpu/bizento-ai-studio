import { useNavigate } from "react-router-dom";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";

const ACCENT = "#89E900";

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "rgba(248,113,113,0.12)",
            border: "1px solid rgba(248,113,113,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <ShieldExclamationIcon style={{ width: 36, height: 36, color: "#f87171" }} />
        </div>

        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.5px",
            margin: "0 0 10px",
          }}
        >
          Access Denied
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.6,
            margin: "0 0 32px",
          }}
        >
          You don't have permission to access the admin panel. Only users with an{" "}
          <span style={{ color: ACCENT, fontWeight: 600 }}>admin role</span> can view this area.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={() => navigate("/app")}
            style={{
              padding: "10px 22px",
              borderRadius: 10,
              background: ACCENT,
              border: "none",
              color: "#000",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "10px 22px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.11)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
          >
            Sign in as Admin
          </button>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 28 }}>
          Contact your administrator if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}
