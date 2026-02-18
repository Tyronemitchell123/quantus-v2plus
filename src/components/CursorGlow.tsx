import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

const CursorGlow = () => {
  const [visible, setVisible] = useState(false);
  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window;
    if (isTouchDevice) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, [visible, x, y]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] w-[500px] h-[500px] rounded-full"
      style={{
        x,
        y,
        translateX: "-50%",
        translateY: "-50%",
        background: "radial-gradient(circle, hsl(var(--gold) / 0.06) 0%, transparent 70%)",
      }}
    />
  );
};

export default CursorGlow;
