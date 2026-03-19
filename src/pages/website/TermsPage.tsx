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

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0D0F14", color: "#F0EBD8" }}>
      <WebsiteNav />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color: "#89E900" }}>Legal</p>
          <h1 className="text-4xl font-black mb-3">Terms & Conditions</h1>
          <p style={{ color: "#8A8F9E" }}>Last updated: March 1, 2026</p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p>By accessing or using Pixalera ("Service") at pixalera.com, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use our Service. These terms apply to all visitors, users, and others who access or use the Service.</p>
        </Section>

        <Section title="2. Description of Service">
          <p>Pixalera is an AI-powered product photography and creative automation platform that allows users to generate marketing assets from product images using AI models. The Service includes the Catalog Generator, Product Photography, Ad Creatives, and Cinematic Ads tools.</p>
        </Section>

        <Section title="3. Account Registration">
          <p>You must create an account to use the Service. You are responsible for maintaining the security of your account credentials and for all activities under your account. You must provide accurate, current, and complete information during registration and keep it updated.</p>
          <p>You must be at least 16 years old to create an account. Accounts are not transferable.</p>
        </Section>

        <Section title="4. Credits & Payments">
          <p>The Service operates on a credit-based system. Credits are consumed when you generate images. Credit costs vary by tool and model selection. Credits are non-refundable except as outlined in our Refund Policy.</p>
          <p>Subscription plans auto-renew unless cancelled at least 24 hours before the renewal date. You can cancel anytime from your account settings.</p>
          <p>We reserve the right to modify pricing with 14 days' notice.</p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Generate content that is illegal, harmful, hateful, sexually explicit, or violates any third-party rights</li>
            <li>Infringe on intellectual property rights of others</li>
            <li>Attempt to reverse-engineer, scrape, or abuse our AI systems</li>
            <li>Share account credentials or resell access without authorization</li>
            <li>Upload content you do not own or have rights to</li>
          </ul>
          <p>Violation of these terms may result in immediate account suspension without refund.</p>
        </Section>

        <Section title="6. Intellectual Property & Generated Content">
          <p><strong className="text-white">Your uploads:</strong> You retain all ownership of product images you upload to the Service. By uploading, you grant Pixalera a limited license to process your images to provide the Service.</p>
          <p><strong className="text-white">Generated outputs:</strong> AI-generated images produced using your inputs are owned by you, subject to any applicable AI model provider licenses. You are responsible for ensuring your use of generated content complies with applicable laws.</p>
          <p><strong className="text-white">Our platform:</strong> The Pixalera brand, platform design, software, and underlying technology remain the exclusive property of Pixalera.</p>
        </Section>

        <Section title="7. Disclaimers & Limitation of Liability">
          <p>The Service is provided "as is" without warranties of any kind. We do not guarantee that generated images will meet any specific quality standard or be suitable for any particular use.</p>
          <p>To the maximum extent permitted by law, Pixalera shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the Service.</p>
        </Section>

        <Section title="8. Termination">
          <p>We may suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time from settings. Upon termination, your access to generated assets may be revoked.</p>
        </Section>

        <Section title="9. Governing Law">
          <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka, India.</p>
        </Section>

        <Section title="10. Changes to Terms">
          <p>We may modify these Terms at any time. Material changes will be notified via email or platform notice at least 7 days in advance. Continued use after changes constitutes acceptance.</p>
        </Section>

        <Section title="11. Contact">
          <p>For legal inquiries: <a href="mailto:legal@pixalera.com" className="underline" style={{ color: "#89E900" }}>legal@pixalera.com</a></p>
        </Section>

        <div className="pt-8 border-t flex gap-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link to="/privacy" className="text-[13px] hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Privacy Policy</Link>
          <Link to="/refund-policy" className="text-[13px] hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Refund Policy</Link>
          <Link to="/cookies" className="text-[13px] hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Cookies Policy</Link>
        </div>
      </div>
      <WebsiteFooter />
    </div>
  );
}