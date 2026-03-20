import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "dark" | "light" | "system";

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.classList.toggle("light", resolved === "light");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("quantus-theme") as Theme) || "dark";
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("quantus-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const cycle = () => {
    const order: Theme[] = ["dark", "light", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <button
      onClick={cycle}
      className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
      title={`Theme: ${theme}`}
      aria-label={`Switch theme (current: ${theme})`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.15 }}
        >
          <Icon size={16} />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
