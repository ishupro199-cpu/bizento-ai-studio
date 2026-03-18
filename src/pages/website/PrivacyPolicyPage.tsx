import { Link } from "react-router-dom";
import { PixaleraIcon } from "@/components/PixaleraIcon";

function WebsiteNav() {
  return (
    <nav className="border-b" style={{ borderColor: "#1E2028", background: "rgba(13,15,20,0.95)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <PixaleraIcon size={30} />
          <span className="text-[16px] font-black" style={{ color: "#F0EBD8" }}>
            Pixalera<span style={{ color: "#89E900" }}>.</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-[13px] font-medium hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Log in</Link>
          <Link to="/signup" className="text-[13px] font-semibold px-4 py-2 rounded-xl" style={{ background: "#89E900", color: "#0D0F14" }}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-[19px] font-black text-white mb-3">{title}</h2>
      <div className="text-[14px] leading-relaxed space-y-3" style={{ color: "#9AA0AE" }}>{children}</div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0D0F14", color: "#F0EBD8" }}>
      <WebsiteNav />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color: "#89E900" }}>Legal</p>
          <h1 className="text-4xl font-black mb-3">Privacy Policy</h1>
          <p style={{ color: "#8A8F9E" }}>Last updated: March 1, 2026</p>
        </div>

        <Section title="1. Introduction">
          <p>Pixalera ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at pixalera.com and any related services.</p>
          <p>By using our service, you agree to the collection and use of information in accordance with this policy.</p>
        </Section>

        <Section title="2. Information We Collect">
          <p><strong className="text-white">Account information:</strong> When you register, we collect your name, email address, and a hashed password. If you sign in via Google, we receive your name and email from Google.</p>
          <p><strong className="text-white">Usage data:</strong> We collect information about your interactions with the platform — prompts submitted, tools used, generations created, and credits consumed.</p>
          <p><strong className="text-white">Uploaded content:</strong> Product images you upload are stored securely in Firebase Storage. We do not use your uploaded images to train AI models without your explicit consent.</p>
          <p><strong className="text-white">Payment information:</strong> Billing is handled by third-party payment processors. We do not store your full credit card number on our servers.</p>
          <p><strong className="text-white">Device & log data:</strong> We automatically collect IP addresses, browser type, operating system, pages viewed, and timestamps for security and analytics purposes.</p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide and improve our AI generation services</li>
            <li>Process your account registration and authenticate you</li>
            <li>Process payments and manage your credit balance</li>
            <li>Send transactional emails (receipts, generation confirmations)</li>
            <li>Send marketing communications (only with your consent)</li>
            <li>Detect fraud, abuse, and security incidents</li>
            <li>Comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="4. Data Sharing & Disclosure">
          <p>We do not sell your personal data. We may share data with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-white">Service providers:</strong> Firebase (storage/auth), Replicate (AI inference), payment processors — all under contractual data protection agreements.</li>
            <li><strong className="text-white">Legal authorities:</strong> When required by law, court order, or to protect the rights of Pixalera and its users.</li>
            <li><strong className="text-white">Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred.</li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain your account data for as long as your account is active. Generated images are retained for 90 days from generation date unless you delete them earlier or download them. You may request deletion of your account and associated data at any time.</p>
        </Section>

        <Section title="6. Your Rights">
          <p>Depending on your location, you may have the right to: access the personal data we hold about you; correct inaccurate data; delete your data; withdraw consent; and data portability. To exercise these rights, contact us at privacy@pixalera.com.</p>
        </Section>

        <Section title="7. Cookies">
          <p>We use cookies and similar tracking technologies. For full details, see our <Link to="/cookies" className="underline" style={{ color: "#89E900" }}>Cookies Policy</Link>.</p>
        </Section>

        <Section title="8. Security">
          <p>We implement industry-standard security measures including TLS encryption in transit and AES-256 encryption at rest. However, no method of transmission over the Internet is 100% secure.</p>
        </Section>

        <Section title="9. Children">
          <p>Our service is not directed to individuals under 16. We do not knowingly collect personal information from children. If you believe a child has provided us personal information, please contact us.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you via email or a prominent notice on our platform at least 7 days before material changes take effect.</p>
        </Section>

        <Section title="11. Contact">
          <p>For privacy-related questions, contact us at <a href="mailto:privacy@pixalera.com" className="underline" style={{ color: "#89E900" }}>privacy@pixalera.com</a>.</p>
        </Section>

        <div className="pt-8 border-t flex gap-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link to="/terms" className="text-[13px] hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Terms & Conditions</Link>
          <Link to="/refund-policy" className="text-[13px] hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Refund Policy</Link>
          <Link to="/cookies" className="text-[13px] hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Cookies Policy</Link>
        </div>
      </div>
    </div>
  );
}
