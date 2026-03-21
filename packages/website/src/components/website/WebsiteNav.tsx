import { Link, useLocation } from "react-router-dom";
import { BizentoIcon } from "@/components/BizentoIcon";

const NAV_LINKS = [
  { label: "Features", to: "/features" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Pricing", to: "/pricing" },
  { label: "Resources", to: "/resources" },
];

export function WebsiteNav() {
  const location = useLocation();

  return (
    <nav className="border-b" style={{ borderColor: "#1E2028", background: "rgba(13,15,20,0.95)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <BizentoIcon size={30} />
          <span className="text-[16px] font-black" style={{ color: "#F0EBD8" }}>
            Pixalera<span style={{ color: "#89E900" }}>.</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.label}
                to={l.to}
                className="text-[14px] font-medium transition-colors duration-150 hover:text-white"
                style={{ color: active ? "#89E900" : "#8A8F9E" }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-[14px] font-medium hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>
            Log in
          </Link>
          <Link to="/signup"
            className="text-[14px] font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
            style={{ background: "#89E900", color: "#0D0F14" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#9FFF00")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#89E900")}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
