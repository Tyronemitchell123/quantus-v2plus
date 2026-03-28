import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User, Settings, ChevronDown } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";

const mainLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/modules", label: "Modules" },
  { to: "/pricing", label: "Membership" },
  { to: "/docs", label: "Docs" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); setAccountOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "glass shadow-lg shadow-black/10" : "bg-transparent"}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="font-display text-xl tracking-wider group">
          <span className="text-gold-gradient font-semibold">Quantus</span>
          <span className="text-foreground/60 ml-1 font-light italic">A.I</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {mainLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} className="relative px-4 py-2 font-body text-sm tracking-wide transition-colors duration-300">
                {active && (
                  <motion.div layoutId="nav-active" className="absolute inset-0 rounded-sm bg-primary/8" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                )}
                <span className={`relative z-10 ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>{link.label}</span>
              </Link>
            );
          })}

          <ThemeToggle />

          {user ? (
            <div className="ml-3 flex items-center gap-2">
              <Link to="/dashboard" className="px-6 py-2 font-body text-xs tracking-widest uppercase text-primary border border-primary/20 hover:bg-primary/5 transition-all duration-300">
                Dashboard
              </Link>
              <div ref={accountRef} className="relative">
                <button onClick={() => setAccountOpen(!accountOpen)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <User size={16} />
                </button>
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 min-w-[180px] border border-border bg-popover/95 backdrop-blur-xl shadow-xl p-1.5">
                      <Link to="/settings" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                        <Settings size={14} /> Settings
                      </Link>
                      <Link to="/account/subscription" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                        <ChevronDown size={14} /> Subscription
                      </Link>
                      <div className="my-1 border-t border-border" />
                      <button onClick={() => { handleSignOut(); setAccountOpen(false); }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <Link to="/auth" className="ml-4 px-6 py-2 font-body text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300">
              Access
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }} className="md:hidden overflow-hidden glass border-t border-border">
            <nav className="flex flex-col p-6 gap-1">
              {mainLinks.map((link, i) => (
                <motion.div key={link.to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={link.to} onClick={() => setOpen(false)}
                    className={`block px-4 py-3 text-base font-body transition-colors ${location.pathname === link.to ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="my-3 luxury-divider" />
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-3 font-body text-base text-primary">Dashboard</Link>
                  <Link to="/settings" onClick={() => setOpen(false)} className="block px-4 py-3 font-body text-base text-muted-foreground">Settings</Link>
                  <button onClick={() => { handleSignOut(); setOpen(false); }} className="text-left px-4 py-3 font-body text-base text-muted-foreground">Sign Out</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="block px-4 py-3 font-body text-base text-primary">Access</Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
