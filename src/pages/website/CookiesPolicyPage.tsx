import { Link } from "react-router-dom";
import { WebsiteNav } from "@/components/website/WebsiteNav";
import { WebsiteFooter } from "@/components/website/WebsiteFooter";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-[19px] font-black text-white mb-3">{title}</h2>
      <div className="text-[14px] leading-relaxed space-y-3" style={{ color: "#9AA0AE" }}>{children}</div>
    </div>
  );
}

const COOKIE_TYPES = [
  {
    type: "Strictly Necessary",
    color: "#89E900",
    can_disable: false,
    desc: "Essential for the platform to function. These include authentication tokens, session management, and CSRF protection. Cannot be disabled.",
    examples: ["auth_token", "session_id", "csrf_token"],
  },
  {
    type: "Analytics",
    color: "#3b82f6",
    can_disable: true,
    desc: "Help us understand how users interact with the platform so we can improve it. All data is aggregated and anonymised.",
    examples: ["_ga", "_gid", "plausible_ignore"],
  },
  {
    type: "Preferences",
    color: "#a855f7",
    can_disable: true,
    desc: "Remember your settings and preferences across visits, such as your selected tool, quality settings, and UI preferences.",
    examples: ["ui_theme", "selected_tool", "quality_pref"],
  },
  {
    type: "Marketing",
    color: "#f59e0b",
    can_disable: true,
    desc: "Used to show relevant advertising and measure campaign effectiveness. Only active if you've opted in.",
    examples: ["_fbp", "ttclid", "gclid"],
  },
];

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0D0F14", color: "#F0EBD8" }}>
      <WebsiteNav />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color: "#89E900" }}>Legal</p>
          <h1 className="text-4xl font-black mb-3">Cookies Policy</h1>
          <p style={{ color: "#8A8F9E" }}>Last updated: March 1, 2026</p>
        </div>

        <Section title="What Are Cookies?">
          <p>Cookies are small text files stored on your device by websites you visit. They are widely used to make websites work more efficiently, remember your preferences, and provide information to website owners.</p>
          <p>We also use similar technologies such as local storage and session storage to provide equivalent functionality.</p>
        </Section>

        <Section title="Types of Cookies We Use">
          <p>Below is a detailed breakdown of the cookies Pixalera uses:</p>
        </Section>

        <div className="space-y-4 mb-10">
          {COOKIE_TYPES.map((ct) => (
            <div key={ct.type} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[15px] font-black" style={{ color: ct.color }}>{ct.type}</span>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                  style={{
                    background: ct.can_disable ? "rgba(255,255,255,0.06)" : "rgba(137,233,0,0.1)",
                    color: ct.can_disable ? "#8A8F9E" : "#89E900",
                    border: `1px solid ${ct.can_disable ? "rgba(255,255,255,0.08)" : "rgba(137,233,0,0.2)"}`,
                  }}>
                  {ct.can_disable ? "Optional" : "Required"}
                </span>
              </div>
              <p className="text-[13px] mb-3" style={{ color: "#9AA0AE" }}>{ct.desc}</p>
              <div className="flex flex-wrap gap-2">
                {ct.examples.map(e => (
                  <code key={e} className="text-[11px] px-2 py-0.5 rounded-md font-mono"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#C4C9D4" }}>{e}</code>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Section title="Managing Cookies">
          <p>You can control and delete cookies through your browser settings. Note that disabling strictly necessary cookies will prevent you from using authenticated features of the platform.</p>
          <p>Most browsers allow you to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>View cookies that are stored</li>
            <li>Delete cookies individually or in bulk</li>
            <li>Block cookies from specific websites</li>
            <li>Block third-party cookies</li>
          </ul>
          <p>For instructions, refer to your browser's help documentation or visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#89E900" }}>allaboutcookies.org</a>.</p>
        </Section>

        <Section title="Third-Party Cookies">
          <p>Some cookies are set by third-party services we use — including Google Analytics, Firebase, and advertising platforms. These third parties have their own privacy and cookie policies. We encourage you to review them.</p>
        </Section>

        <Section title="Updates to This Policy">
          <p>We may update this Cookies Policy from time to time. Changes will be posted on this page with an updated "Last updated" date.</p>
        </Section>

        <Section title="Contact">
          <p>If you have questions about our use of cookies, contact <a href="mailto:privacy@pixalera.com" className="underline" style={{ color: "#89E900" }}>privacy@pixalera.com</a>.</p>
        </Section>

        <div className="pt-8 border-t flex gap-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link to="/privacy" className="text-[13px] hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Privacy Policy</Link>
          <Link to="/terms" className="text-[13px] hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Terms & Conditions</Link>
          <Link to="/refund-policy" className="text-[13px] hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Refund Policy</Link>
        </div>
      </div>
      <WebsiteFooter />
    </div>
  );
}