import { motion } from "framer-motion";
import useDocumentHead from "@/hooks/use-document-head";
import Footer from "@/components/Footer";

const Privacy = () => {
  useDocumentHead({
    title: "Privacy Policy — QUANTUS V2+",
    description: "Learn how Quantus V2+ collects, uses, and protects your personal data in compliance with GDPR.",
    canonical: "https://quantus-loom.lovable.app/privacy",
  });

  const sections = [
    {
      title: "1. Data Controller",
      content: `Quantus V2+ ("we", "us", "our") is the data controller responsible for your personal data. If you have questions about how we process your data, contact us at privacy@crownprompts.com.`,
    },
    {
      title: "2. Data We Collect",
      content: `We collect the following categories of personal data:
      
• **Account Data**: Name, email address, company name, and authentication credentials when you register.
• **Deal & Transaction Data**: Information you provide when creating deals, including budgets, requirements, and preferences.
• **Usage Data**: How you interact with our platform, including pages visited, features used, and session duration.
• **Device Data**: Browser type, operating system, IP address, and device identifiers.
• **Communication Data**: Messages exchanged through our concierge and vendor outreach features.
• **Payment Data**: Billing information processed securely through Stripe. We never store full card numbers.`,
    },
    {
      title: "3. Legal Basis for Processing",
      content: `We process your data under the following legal bases (GDPR Art. 6):

• **Contract Performance**: Processing necessary to provide our deal-management and concierge services.
• **Legitimate Interest**: Analytics, fraud prevention, and platform improvement.
• **Consent**: Marketing communications, cookie tracking, and optional AI-powered recommendations.
• **Legal Obligation**: Tax records, regulatory compliance, and law enforcement requests.`,
    },
    {
      title: "4. How We Use Your Data",
      content: `Your data is used to:

• Provide and personalise our AI-powered deal engine, sourcing, and negotiation services.
• Process payments and manage subscriptions.
• Send transactional emails (confirmations, alerts, deal updates).
• Improve platform performance through aggregated analytics.
• Detect and prevent fraud or abuse.
• Comply with legal and regulatory requirements.`,
    },
    {
      title: "5. Data Sharing",
      content: `We share data only when necessary:

• **Service Providers**: Hosting (cloud infrastructure), payment processing (Stripe), email delivery, and AI model providers — all bound by data processing agreements.
• **Vendors**: When you initiate vendor outreach, relevant deal information is shared with selected vendors as part of the service.
• **Legal Requirements**: When required by law, court order, or regulatory authority.

We never sell your personal data to third parties.`,
    },
    {
      title: "6. International Transfers",
      content: `Your data may be processed in countries outside the EEA. We ensure adequate protection through Standard Contractual Clauses (SCCs) and only use providers with appropriate certifications (SOC 2, ISO 27001).`,
    },
    {
      title: "7. Data Retention",
      content: `We retain your data for as long as your account is active, plus:

• **Account data**: 30 days after deletion request.
• **Transaction records**: 7 years (tax/legal compliance).
• **Usage analytics**: 24 months (aggregated and anonymised).
• **Audit logs**: 12 months.

You can request earlier deletion — see Your Rights below.`,
    },
    {
      title: "8. Your Rights (GDPR Art. 15–22)",
      content: `You have the right to:

• **Access**: Request a copy of all personal data we hold about you.
• **Rectification**: Correct inaccurate or incomplete data.
• **Erasure**: Request deletion of your data ("right to be forgotten").
• **Restriction**: Limit how we process your data.
• **Portability**: Receive your data in a structured, machine-readable format.
• **Object**: Object to processing based on legitimate interest.
• **Withdraw Consent**: Withdraw consent at any time for consent-based processing.

To exercise any right, email privacy@crownprompts.com or use the Data Export feature in Settings.`,
    },
    {
      title: "9. Cookies",
      content: `We use essential cookies for authentication and session management. Optional analytics cookies are only set with your consent. You can manage preferences via our cookie banner or browser settings. See our cookie categories:

• **Strictly Necessary**: Authentication, security, load balancing.
• **Analytics**: Aggregated usage patterns (opt-in only).
• **Preferences**: Theme, language, and UI settings.`,
    },
    {
      title: "10. Security",
      content: `We implement industry-standard security measures including encryption in transit (TLS 1.3), encryption at rest (AES-256), role-based access controls, regular security audits, and automated vulnerability scanning.`,
    },
    {
      title: "11. Changes to This Policy",
      content: `We may update this policy periodically. Material changes will be notified via email and an in-app banner. Continued use after notification constitutes acceptance.`,
    },
    {
      title: "12. Contact & Complaints",
      content: `For privacy inquiries: privacy@quantus.ai

If you believe your data protection rights have been violated, you have the right to lodge a complaint with your local Data Protection Authority (DPA).`,
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-2">Legal</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mb-10">Last updated: March 27, 2026</p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">{section.title}</h2>
              <div className="text-muted-foreground font-body text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Privacy;
