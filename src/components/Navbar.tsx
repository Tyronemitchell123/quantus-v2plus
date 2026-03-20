import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, LogOut, ChevronDown, Lock } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";

const mainLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/quantum", label: "Quantum" },
  { to: "/nlp", label: "AI Lab" },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact" },
];

const resourceLinks = [
  { to: "/benefits", label: "Benefits" },
  { to: "/guide", label: "User Guide" },
  { to: "/case-studies", label: "Case Studies" },
];

const tierLinks = [
  { to: "/dashboard", label: "Analytics", requiredTier: "starter" as const },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { canAccess, isActive } = useSubscription();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setResourcesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isResourceActive = resourceLinks.some((l) => location.pathname === l.to);

  const NavItem = ({ to, label }: { to: string; label: string }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className="relative px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-300"
      >
        {active && (
          <motion.div
            layoutId="nav-active"
            className="absolute inset-0 rounded-full bg-primary/10"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        <span className={`relative z-10 ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          {label}
        </span>
      </Link>
    );
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
        <nav className="hidden md:flex items-center gap-0.5">
          {mainLinks.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}

          {/* Resources dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className={`relative flex items-center gap-1 px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-300 ${
                isResourceActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isResourceActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-primary/10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">Resources</span>
              <ChevronDown
                size={14}
                className={`relative z-10 transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {resourcesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full mt-2 left-0 min-w-[180px] rounded-xl border border-border bg-popover/95 backdrop-blur-xl shadow-xl shadow-black/10 p-1.5"
                >
                  {resourceLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === link.to
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tier-locked links – show with lock if no access */}
          {user && tierLinks.map((link) =>
            canAccess(link.requiredTier) ? (
              <NavItem key={link.to} to={link.to} label={link.label} />
            ) : (
              <Link
                key={link.to}
                to="/pricing"
                className="relative flex items-center gap-1 px-3 py-2 text-sm font-medium tracking-wide text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-300"
                title={`Requires ${link.requiredTier} plan`}
              >
                {link.label}
                <Lock size={10} className="opacity-60" />
              </Link>
            )
          )}

          <ThemeToggle />

          {user ? (
            <div className="ml-2 flex items-center gap-2">
              {canAccess("professional") ? (
                <Link
                  to="/chat"
                  className="px-5 py-2 text-sm font-semibold rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/20"
                >
                  AI Chat
                </Link>
              ) : (
                <Link
                  to="/pricing"
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-full border border-border text-muted-foreground/60 hover:text-muted-foreground transition-all"
                  title="Requires professional plan"
                >
                  AI Chat
                  <Lock size={10} className="opacity-60" />
                </Link>
              )}
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
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="md:hidden overflow-hidden glass border-t border-border"
          >
            <nav className="flex flex-col p-6 gap-1">
              {mainLinks.map((link, i) => (
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

              {/* Resources section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: mainLinks.length * 0.05 }}
              >
                <p className="px-4 pt-4 pb-1 text-xs font-display tracking-[0.2em] uppercase text-muted-foreground/60">
                  Resources
                </p>
                {resourceLinks.map((link) => (
                  <Link
                    key={link.to}
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
                ))}
              </motion.div>

              {/* Tier-locked mobile links */}
              {user && tierLinks.map((link) =>
                canAccess(link.requiredTier) ? (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (mainLinks.length + 1) * 0.05 }}
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
                ) : null
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (mainLinks.length + 2) * 0.05 }}
              >
                {user ? (
                  <div className="flex flex-col gap-2 mt-2">
                    {canAccess("professional") && (
                      <Link
                        to="/chat"
                        onClick={() => setOpen(false)}
                        className="text-center block px-5 py-3 font-semibold rounded-full bg-primary text-primary-foreground"
                      >
                        AI Chat
                      </Link>
                    )}
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
