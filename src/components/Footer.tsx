import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="container mx-auto px-6 py-16">
      <div className="grid md:grid-cols-4 gap-10">
        <div>
          <span className="font-display text-xl tracking-wider">
            <span className="text-gold-gradient font-semibold">Quantus</span>
            <span className="text-foreground/60 ml-1 font-light italic">A.I</span>
          </span>
          <p className="text-muted-foreground text-sm mt-4 leading-relaxed font-body">
            Private intelligence for those who operate at the highest level.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-medium text-foreground mb-4">Platform</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/modules" className="text-sm text-muted-foreground hover:text-primary transition-colors font-body">Modules</Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors font-body">Dashboard</Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors font-body">Membership</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-medium text-foreground mb-4">Company</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors font-body">About</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors font-body">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-medium text-foreground mb-4">Connect</h4>
          <div className="flex flex-col gap-2.5 text-sm text-muted-foreground font-body">
            <span>enquiries@quantus-ai.com</span>
            <span>London, United Kingdom</span>
          </div>
        </div>
      </div>
      <div className="luxury-divider mt-12 mb-6" />
      <div className="text-center text-xs text-muted-foreground font-body tracking-wider">
        © 2026 Quantus A.I — All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
