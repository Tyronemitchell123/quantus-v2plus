import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="container mx-auto px-6 py-16">
      <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
        <div>
          <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-gold-soft mb-5">Company</h4>
          <div className="flex flex-col gap-3">
            <Link to="/about" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            <Link to="/enterprise" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Enterprise</Link>
          </div>
        </div>
        <div>
          <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-gold-soft mb-5">Modules</h4>
          <div className="flex flex-col gap-3">
            <Link to="/dashboard/modules" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Aviation</Link>
            <Link to="/dashboard/modules" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Medical</Link>
            <Link to="/dashboard/modules" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Staffing</Link>
            <Link to="/dashboard/modules" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Travel</Link>
            <Link to="/dashboard/modules" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">Logistics</Link>
          </div>
        </div>
        <div>
          <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-gold-soft mb-5">Legal</h4>
          <div className="flex flex-col gap-3">
            <span className="font-body text-xs text-muted-foreground">Privacy Policy</span>
            <span className="font-body text-xs text-muted-foreground">Terms of Service</span>
          </div>
        </div>
      </div>
      <div className="luxury-divider mt-14 mb-6" />
      <p className="text-center font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40">
        © 2026 Quantus A.I — All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
