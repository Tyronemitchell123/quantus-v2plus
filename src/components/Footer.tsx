import { Link } from "react-router-dom";
import { Linkedin, Twitter, Instagram } from "lucide-react";

const socialLinks = [
  { icon: Linkedin, href: "https://www.linkedin.com/in/tyrone-m-730a253a4", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/Quantusv2plus", label: "X (Twitter)" },
  { icon: Instagram, href: "https://instagram.com/quantus", label: "Instagram" },
];

const Footer = () => (
  <footer className="relative border-t border-border/20 bg-background overflow-hidden">
    {/* Ambient vignette */}
    <div className="absolute inset-0 bg-obsidian-vignette pointer-events-none opacity-30" />
    <div className="absolute top-0 left-0 right-0 sovereign-line" />

    <div className="container mx-auto px-6 py-20 relative z-10">
      {/* Brand mark */}
      <div className="text-center mb-16">
        <p className="font-display text-2xl text-gold-gradient gold-glow-text mb-2">Quantus V2+</p>
        <p className="font-body text-[9px] tracking-[0.5em] uppercase text-muted-foreground/40">Sovereign Intelligence Platform</p>
      </div>

      <div className="grid md:grid-cols-4 gap-12 max-w-5xl mx-auto">
        <div>
          <h4 className="font-body text-[9px] tracking-[0.4em] uppercase text-primary/40 mb-6">Company</h4>
          <div className="flex flex-col gap-3">
            <Link to="/about" className="font-body text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-500">About</Link>
            <Link to="/contact" className="font-body text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-500">Contact</Link>
            <Link to="/enterprise" className="font-body text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-500">Enterprise</Link>
            <Link to="/blog" className="font-body text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-500">Blog</Link>
          </div>
        </div>
        <div>
          <h4 className="font-body text-[9px] tracking-[0.4em] uppercase text-primary/40 mb-6">Modules</h4>
          <div className="flex flex-col gap-3">
            <Link to="/modules" className="font-body text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-500">Aviation</Link>
            <Link to="/modules" className="font-body text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-500">Medical</Link>
            <Link to="/modules" className="font-body text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-500">Staffing</Link>
            <Link to="/modules" className="font-body text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-500">Travel</Link>
            <Link to="/modules" className="font-body text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-500">Logistics</Link>
          </div>
        </div>
        <div>
          <h4 className="font-body text-[9px] tracking-[0.4em] uppercase text-primary/40 mb-6">Partners</h4>
          <div className="flex flex-col gap-3">
            <Link to="/partner-with-us" className="font-body text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-500">Partner With Us</Link>
            <Link to="/marketplace" className="font-body text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-500">Vendor Marketplace</Link>
            <Link to="/privacy" className="font-body text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-500">Privacy Policy</Link>
            <Link to="/terms" className="font-body text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-500">Terms of Service</Link>
          </div>
        </div>
        <div>
          <h4 className="font-body text-[9px] tracking-[0.4em] uppercase text-primary/40 mb-6">Connect</h4>
          <div className="flex gap-5 mb-5">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-muted-foreground/40 hover:text-primary hover:drop-shadow-[0_0_8px_hsl(var(--gold)/0.4)] transition-all duration-500"
              >
                <Icon size={17} strokeWidth={1.4} />
              </a>
            ))}
          </div>
          <p className="font-body text-[11px] text-muted-foreground/30 leading-relaxed">
            Follow us for updates, insights, and exclusive content.
          </p>
        </div>
      </div>

      <div className="sovereign-line mt-16 mb-8" />

      <p className="text-center font-body text-[10px] leading-relaxed text-muted-foreground/30 max-w-2xl mx-auto mb-5">
        AI-powered features are advisory only and do not constitute professional, legal, or financial advice. All prices exclude applicable taxes. Past performance does not guarantee future results.
      </p>
      <p className="text-center font-body text-[9px] tracking-[0.3em] uppercase text-muted-foreground/25">
        © 2026 Quantus V2+ — All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
