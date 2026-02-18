import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="container mx-auto px-6 py-12">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <span className="font-display text-xl font-bold tracking-wider">
            <span className="text-gold-gradient">NEXUS</span>
            <span className="text-foreground/80 ml-1 font-light">AI</span>
          </span>
          <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
            The world's most intelligent digital presence for those who define the future.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground mb-4">Platform</h4>
          <div className="flex flex-col gap-2">
            <Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Services</Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Analytics</Link>
            <Link to="/chat" className="text-sm text-muted-foreground hover:text-primary transition-colors">AI Chat</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground mb-4">Company</h4>
          <div className="flex flex-col gap-2">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground mb-4">Connect</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>hello@nexus-ai.com</span>
            <span>Twitter / X</span>
            <span>LinkedIn</span>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        © 2026 NEXUS AI. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
