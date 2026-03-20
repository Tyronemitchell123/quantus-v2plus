import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/benefits", label: "Benefits" },
  { to: "/quantum", label: "Quantum" },
  { to: "/nlp", label: "AI Lab" },
  { to: "/case-studies", label: "Case Studies" },
  { to: "/pricing", label: "Pricing" },
  { to: "/dashboard", label: "Analytics" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass shadow-lg shadow-black/20" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="font-display text-xl font-bold tracking-wider group">
          <span className="text-gold-gradient">QUANTUS</span>
          <span className="text-foreground/80 ml-1 font-light">AI</span>
          <motion.span
            className="inline-block ml-1"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
          >
            <Sparkles size={12} className="text-primary/50 inline" />
          </motion.span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300"
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-primary/10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}

          <ThemeToggle />

          {user ? (
            <div className="ml-2 flex items-center gap-2">
              <Link
                to="/chat"
                className="px-5 py-2 text-sm font-semibold rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                AI Chat
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="ml-4 px-5 py-2 text-sm font-semibold rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Get Started
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden glass border-t border-border"
          >
            <nav className="flex flex-col p-6 gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      location.pathname === link.to
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
              >
                {user ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <Link
                      to="/chat"
                      onClick={() => setOpen(false)}
                      className="text-center block px-5 py-3 font-semibold rounded-full bg-primary text-primary-foreground"
                    >
                      AI Chat
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); setOpen(false); }}
                      className="text-center px-5 py-3 font-medium rounded-full border border-border text-foreground"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setOpen(false)}
                    className="mt-2 text-center block px-5 py-3 font-semibold rounded-full bg-primary text-primary-foreground"
                  >
                    Get Started
                  </Link>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
