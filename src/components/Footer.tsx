import { Link } from "react-router-dom";
import { Linkedin, Twitter, Instagram } from "lucide-react";

const socialLinks = [
  { icon: Linkedin, href: "https://linkedin.com/company/quantus", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/quantus", label: "X (Twitter)" },
  { icon: Instagram, href: "https://instagram.com/quantus", label: "Instagram" },
];

const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="container mx-auto px-6 py-16">
      <div className="grid md:grid-cols-4 gap-12 max-w-5xl mx-auto">
        <div>
          <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-gold-soft mb-5">Company</h4>
          <div className="flex flex-col gap-3">
            <Link to="/about" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            <Link to="/enterprise" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Enterprise</Link>
            <Link to="/blog" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Blog</Link>
          </div>
        </div>
        <div>
          <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-gold-soft mb-5">Modules</h4>
          <div className="flex flex-col gap-3">
            <Link to="/modules" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Aviation</Link>
            <Link to="/modules" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Medical</Link>
            <Link to="/modules" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Staffing</Link>
            <Link to="/modules" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Travel</Link>
            <Link to="/modules" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Logistics</Link>
          </div>
        </div>
        <div>
          <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-gold-soft mb-5">Legal</h4>
          <div className="flex flex-col gap-3">
            <Link to="/privacy" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
        <div>
          <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-gold-soft mb-5">Connect</h4>
          <div className="flex gap-4 mb-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-muted-foreground/60 hover:text-primary transition-colors duration-300"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
          <p className="font-body text-xs text-muted-foreground/50">
            Follow us for updates, insights, and exclusive content.
          </p>
        </div>
      </div>
      <div className="luxury-divider mt-14 mb-6" />
      <p className="text-center font-body text-[10px] leading-relaxed text-muted-foreground/40 max-w-2xl mx-auto mb-4">
        AI-powered features are advisory only and do not constitute professional, legal, or financial advice. All prices exclude applicable taxes. Past performance does not guarantee future results.
      </p>
      <p className="text-center font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40">
        © 2026 Quantus V2+ — All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
