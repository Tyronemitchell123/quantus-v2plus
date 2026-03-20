import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, LogOut, ChevronDown, Lock, User, CreditCard, Settings, BarChart3 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  { to: "/blog", label: "Blog" },
  { to: "/benefits", label: "Benefits" },
  { to: "/guide", label: "User Guide" },
  { to: "/case-studies", label: "Case Studies" },
];

const tierLinks = [
  { to: "/dashboard", label: "Analytics", requiredTier: "starter" as const },
  { to: "/marketing", label: "Marketing", requiredTier: "enterprise" as const },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState(-1);
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
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!resourcesOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setResourcesOpen(true);
        setFocusIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex((prev) => (prev + 1) % resourceLinks.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex((prev) => (prev - 1 + resourceLinks.length) % resourceLinks.length);
        break;
      case "Home":
        e.preventDefault();
        setFocusIndex(0);
        break;
      case "End":
        e.preventDefault();
        setFocusIndex(resourceLinks.length - 1);
        break;
      case "Escape":
        e.preventDefault();
        setResourcesOpen(false);
        setFocusIndex(-1);
        break;
      case "Tab":
        setResourcesOpen(false);
        setFocusIndex(-1);
        break;
    }
  }, [resourcesOpen]);

  useEffect(() => {
    if (focusIndex >= 0 && dropdownItemsRef.current[focusIndex]) {
      dropdownItemsRef.current[focusIndex]?.focus();
    }
  }, [focusIndex]);

  useEffect(() => {
    if (!resourcesOpen) setFocusIndex(-1);
  }, [resourcesOpen]);

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
          <div ref={dropdownRef} className="relative" onKeyDown={handleDropdownKeyDown}>
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              aria-haspopup="true"
              aria-expanded={resourcesOpen}
              aria-controls="resources-menu"
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
                  id="resources-menu"
                  role="menu"
                  aria-label="Resources"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full mt-2 left-0 min-w-[180px] rounded-xl border border-border bg-popover/95 backdrop-blur-xl shadow-xl shadow-black/10 p-1.5"
                >
                  {resourceLinks.map((link, i) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      role="menuitem"
                      tabIndex={focusIndex === i ? 0 : -1}
                      ref={(el) => { dropdownItemsRef.current[i] = el; }}
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
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
              <Tooltip key={link.to}>
                <TooltipTrigger asChild>
                  <Link
                    to="/pricing"
                    className="relative flex items-center gap-1 px-3 py-2 text-sm font-medium tracking-wide text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-300"
                  >
                    {link.label}
                    <Lock size={10} className="opacity-60" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Upgrade to <span className="font-semibold capitalize">{link.requiredTier}</span> to unlock
                </TooltipContent>
              </Tooltip>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/pricing"
                      className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-full border border-border text-muted-foreground/60 hover:text-muted-foreground transition-all"
                    >
                      AI Chat
                      <Lock size={10} className="opacity-60" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Upgrade to <span className="font-semibold">Professional</span> to unlock
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Account dropdown */}
              <div ref={accountDropdownRef} className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                  title="Account"
                >
                  <User size={16} />
                </button>
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full right-0 mt-2 min-w-[200px] rounded-xl border border-border bg-popover/95 backdrop-blur-xl shadow-xl shadow-black/10 p-1.5"
                    >
                      <Link
                        to="/dashboard"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        <BarChart3 size={14} />
                        Analytics
                      </Link>
                      <Link
                        to="/account/subscription"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        <CreditCard size={14} />
                        Subscription
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        <Settings size={14} />
                        Settings
                      </Link>
                      <div className="my-1 border-t border-border" />
                      <button
                        onClick={() => { handleSignOut(); setAccountOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
              {user && tierLinks.map((link) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (mainLinks.length + 1) * 0.05 }}
                >
                  <Link
                    to={canAccess(link.requiredTier) ? link.to : "/pricing"}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      canAccess(link.requiredTier)
                        ? location.pathname === link.to
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {link.label}
                    {!canAccess(link.requiredTier) && <Lock size={12} className="opacity-50" />}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (mainLinks.length + 2) * 0.05 }}
              >
                {user ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <p className="px-4 pt-2 pb-1 text-xs font-display tracking-[0.2em] uppercase text-muted-foreground/60">
                      Account
                    </p>
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        location.pathname === "/dashboard" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <BarChart3 size={16} />
                      Analytics
                    </Link>
                    <Link
                      to="/account/subscription"
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        location.pathname === "/account/subscription" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <CreditCard size={16} />
                      Subscription
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        location.pathname === "/settings" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    {canAccess("professional") ? (
                      <Link
                        to="/chat"
                        onClick={() => setOpen(false)}
                        className="text-center block px-5 py-3 font-semibold rounded-full bg-primary text-primary-foreground"
                      >
                        AI Chat
                      </Link>
                    ) : (
                      <Link
                        to="/pricing"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-2 px-5 py-3 font-medium rounded-full border border-border text-muted-foreground/60"
                      >
                        AI Chat
                        <Lock size={12} className="opacity-50" />
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
