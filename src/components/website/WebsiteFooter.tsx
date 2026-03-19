import { Link } from "react-router-dom";
import { BizentoIcon } from "@/components/BizentoIcon";
import { Mail, Twitter, Instagram, Youtube } from "lucide-react";
import { useState } from "react";

const SOCIAL_LINKS = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

const FOOTER_COLS: Record<string, { label: string; to: string }[]> = {
  Product: [
    { label: "Features", to: "/features" },
    { label: "Pricing", to: "/pricing" },
    { label: "Demo", to: "/demo" },
    { label: "How It Works", to: "/how-it-works" },
  ],
  Tools: [
    { label: "Catalog Generator", to: "/tools/catalog" },
    { label: "Product Photography", to: "/tools/photo" },
    { label: "Cinematic Ads", to: "/tools/cinematic" },
    { label: "Ad Creatives", to: "/tools/creative" },
  ],
  Resources: [
    { label: "Help Center", to: "/help" },
    { label: "Guides", to: "/guides" },
    { label: "Blog", to: "/blog" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms & Conditions", to: "/terms" },
    { label: "Refund Policy", to: "/refund-policy" },
    { label: "Cookies Policy", to: "/cookies" },
  ],
};

export function WebsiteFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer style={{ background: "#0A0C11", borderTop: "1px solid #1E2028" }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <BizentoIcon size={28} />
              <span className="font-black text-[16px]" style={{ color: "#F0EBD8" }}>
                Pixalera<span style={{ color: "#89E900" }}>.</span>
              </span>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: "#8A8F9E" }}>
              AI-powered product photography and catalog generation for ecommerce sellers.
            </p>
            <div className="flex gap-2.5">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#8A8F9E" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(137,233,0,0.12)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(137,233,0,0.3)";
                    (e.currentTarget as HTMLElement).style.color = "#89E900";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLElement).style.color = "#8A8F9E";
                  }}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_COLS).map(([category, links]) => (
            <div key={category}>
              <p className="text-[12px] font-bold uppercase tracking-wider mb-4" style={{ color: "#8A8F9E" }}>{category}</p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[13px] transition-colors"
                      style={{ color: "rgba(138,143,158,0.65)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#89E900")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(138,143,158,0.65)")}
                    >{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ background: "linear-gradient(135deg, rgba(137,233,0,0.06) 0%, rgba(137,233,0,0.02) 100%)", border: "1px solid rgba(137,233,0,0.14)" }}>
          <div className="flex flex-col md:flex-row items-center gap-6 px-6 py-5">
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(137,233,0,0.12)", border: "1px solid rgba(137,233,0,0.2)" }}>
                <Mail className="h-5 w-5" style={{ color: "#89E900" }} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white">Stay updated with AI ecommerce tips</h3>
                <p className="text-[12px]" style={{ color: "#8A8F9E" }}>Guides, product updates, and strategies — straight to your inbox.</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto md:ml-auto shrink-0">
              <div className="flex-1 md:w-60 flex items-center gap-2 rounded-xl px-3.5 py-2.5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: "#8A8F9E" }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent text-[13px] text-white placeholder-white/30 outline-none min-w-0"
                />
              </div>
              <button
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#89E900", color: "#0D0F14" }}>
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t gap-4" style={{ borderColor: "#1E2028" }}>
          <p className="text-[12px]" style={{ color: "rgba(138,143,158,0.45)" }}>
            © {new Date().getFullYear()} Pixalera AI. All rights reserved.
          </p>
          <p className="text-[12px]" style={{ color: "rgba(138,143,158,0.45)" }}>
            Built for ecommerce sellers 🚀
          </p>
        </div>
      </div>
    </footer>
  );
}
