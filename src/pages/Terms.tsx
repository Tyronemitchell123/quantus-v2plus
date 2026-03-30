import { motion } from "framer-motion";
import useDocumentHead from "@/hooks/use-document-head";
import Footer from "@/components/Footer";

const Terms = () => {
  useDocumentHead({
    title: "Terms of Service — QUANTUS V2+",
    description: "Terms and conditions governing your use of the Quantus V2+ platform.",
    canonical: "https://quantus-loom.lovable.app/terms",
  });

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using the Quantus V2+. platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service. These Terms constitute a legally binding agreement between you and Quantus V2+. Ltd.`,
    },
    {
      title: "2. Description of Service",
      content: `Quantus V2+. is an AI-powered deal management and concierge platform that provides:

• Intelligent deal intake and classification
• Automated vendor sourcing and matching
• Negotiation support and workflow automation
• Document management and billing
• Quantum computing capabilities
• Marketing and analytics tools

The Service is provided on a subscription basis with tiered access levels.`,
    },
    {
      title: "3. Account Registration",
      content: `To use the Service, you must:

• Provide accurate and complete registration information.
• Maintain the security of your account credentials.
• Promptly notify us of any unauthorised access.
• Be at least 18 years of age or the age of majority in your jurisdiction.

You are responsible for all activity under your account.`,
    },
    {
      title: "4. Subscriptions & Payments",
      content: `• Subscription tiers: Starter ($29/mo or $276/yr), Professional ($149/mo or $1,428/yr), and Teams ($49/seat/mo or $468/seat/yr). Annual plans include a 20% discount.
• Subscription fees are billed in advance on a monthly or annual basis via Stripe.
• Prices are listed in USD and exclude applicable taxes.
• You may upgrade, downgrade, or cancel your subscription at any time.
• Cancellation takes effect at the end of the current billing period.
• A 14-day money-back guarantee applies to all new paid subscriptions. Refund requests after 14 days are handled in accordance with applicable consumer protection laws.
• One-time fees may apply for premium services, including Priority Deal Processing ($49 surcharge).
• We reserve the right to change pricing with 30 days' advance notice.
• Platform commission rates apply to completed deals: Aviation 2.5%, Staffing 20%, Marine 5%, Legal 7.5%, Finance 5%. A 10% platform fee applies to vendor marketplace products.`,
    },
    {
      title: "5. Acceptable Use",
      content: `You agree not to:

• Use the Service for any unlawful purpose or in violation of any regulations.
• Attempt to gain unauthorised access to any part of the Service.
• Interfere with or disrupt the Service's infrastructure.
• Upload malicious code, malware, or harmful content.
• Use the Service to harass, abuse, or harm others.
• Resell or redistribute the Service without our written consent.
• Use automated tools to scrape or extract data from the Service.`,
    },
    {
      title: "6. Intellectual Property",
      content: `• The Service, including its design, code, AI models, and content, is owned by Quantus V2+. Ltd and protected by intellectual property laws.
• You retain ownership of all data you input into the Service.
• You grant us a limited licence to process your data solely to provide the Service.
• We do not use your data to train AI models without your explicit consent.`,
    },
    {
      title: "7. AI & Automated Decisions",
      content: `• Our AI features provide recommendations and classifications, not binding decisions.
• You are responsible for reviewing and acting upon AI-generated outputs.
• AI-generated content (emails, analysis, recommendations) should be reviewed before external use.
• Under GDPR Art. 22, you have the right not to be subject to solely automated decision-making with legal effects. Contact us to request human review.`,
    },
    {
      title: "8. Data Protection",
      content: `We process personal data in accordance with our Privacy Policy and applicable data protection legislation including the UK GDPR and EU GDPR. By using the Service, you acknowledge our data processing practices as described in the Privacy Policy.`,
    },
    {
      title: "9. Limitation of Liability",
      content: `To the maximum extent permitted by law:

• The Service is provided "as is" without warranties of any kind.
• We are not liable for indirect, incidental, or consequential damages.
• Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim.
• Nothing in these Terms excludes liability for death, personal injury, or fraud.`,
    },
    {
      title: "10. Indemnification",
      content: `You agree to indemnify and hold harmless Quantus V2+. Ltd from any claims, damages, or expenses arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.`,
    },
    {
      title: "11. Service Availability",
      content: `• We target 99.9% uptime but do not guarantee uninterrupted access.
• Scheduled maintenance will be communicated in advance.
• We are not liable for downtime caused by factors beyond our reasonable control.`,
    },
    {
      title: "12. Termination",
      content: `• You may terminate your account at any time through Settings or by contacting support.
• We may suspend or terminate accounts that violate these Terms.
• Upon termination, your data will be retained for 30 days, after which it will be permanently deleted unless legal retention obligations apply.
• You may request data export before termination.`,
    },
    {
      title: "13. Governing Law",
      content: `These Terms are governed by the laws of England and Wales. Disputes shall be resolved in the courts of England, except where consumer protection laws grant you the right to bring proceedings in your local jurisdiction.`,
    },
    {
      title: "14. Changes to Terms",
      content: `We may modify these Terms with 30 days' notice via email or in-app notification. Continued use after the notice period constitutes acceptance. Material changes to pricing or data processing will require explicit consent.`,
    },
    {
      title: "15. Contact",
      content: `For questions about these Terms: legal@quantus.ai

Quantus V2+. Ltd
Registered in England & Wales`,
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-2">Legal</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
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

export default Terms;
