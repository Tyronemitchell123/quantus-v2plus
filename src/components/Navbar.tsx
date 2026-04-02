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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled
          ? "glass-obsidian shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      {/* Ambient bottom border */}
      <div className={`absolute bottom-0 left-0 right-0 transition-opacity duration-700 ${scrolled ? "opacity-100" : "opacity-0"}`}>
        <div className="sovereign-line" />
      </div>

      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="font-display text-xl tracking-wider group">
          <span className="text-gold-gradient font-semibold gold-glow-text">Quantus V2+</span>
          <span className="text-foreground/40 ml-1.5 font-light italic text-sm">A.I</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-0.5">
          {mainLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} className="relative px-4 py-2 font-body text-[13px] tracking-wide transition-colors duration-500">
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-primary/[0.06] border border-primary/10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>{link.label}</span>
              </Link>
            );
          })}

          <div className="ml-2 pl-2 border-l border-border/20">
            <ThemeToggle />
          </div>

          {user ? (
            <div className="ml-3 flex items-center gap-2">
              <Link
                to="/dashboard"
                className="px-5 py-2 font-body text-[10px] tracking-[0.3em] uppercase text-primary border border-primary/15 hover:bg-primary/[0.04] hover:border-primary/25 transition-all duration-500 rounded-lg"
              >
                Dashboard
              </Link>
              <div ref={accountRef} className="relative">
                <button onClick={() => setAccountOpen(!accountOpen)} className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
                  <User size={15} strokeWidth={1.4} />
                </button>
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute top-full right-0 mt-2 min-w-[180px] glass-sovereign rounded-lg shadow-2xl shadow-black/30 p-1.5 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 sovereign-line" />
                      <Link to="/settings" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/[0.04] transition-all duration-300 rounded-md">
                        <Settings size={13} strokeWidth={1.4} /> Settings
                      </Link>
                      <Link to="/account/subscription" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/[0.04] transition-all duration-300 rounded-md">
                        <ChevronDown size={13} strokeWidth={1.4} /> Subscription
                      </Link>
                      <div className="my-1 luxury-divider" />
                      <button onClick={() => { handleSignOut(); setAccountOpen(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/[0.04] transition-all duration-300 rounded-md">
                        <LogOut size={13} strokeWidth={1.4} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <Link
              to="/auth"
              className="ml-4 px-6 py-2.5 font-body text-[10px] tracking-[0.3em] uppercase bg-primary text-primary-foreground hover:brightness-110 transition-all duration-500 rounded-lg gold-glow-sm"
            >
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
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="md:hidden overflow-hidden glass-obsidian border-t border-border/20"
          >
            <nav className="flex flex-col p-6 gap-1">
              {mainLinks.map((link, i) => (
                <motion.div key={link.to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link to={link.to} onClick={() => setOpen(false)}
                    className={`block px-4 py-3 text-base font-body transition-all duration-300 rounded-lg ${
                      location.pathname === link.to ? "text-primary bg-primary/[0.04]" : "text-muted-foreground hover:text-foreground hover:bg-primary/[0.02]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="my-3 sovereign-line" />
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
