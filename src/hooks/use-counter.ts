import { useState, useEffect, useRef } from "react";

export function useCounter(end: number, duration = 2000, startOnView = true) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) {
      animateCount();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          animateCount();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();

    function animateCount() {
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setValue(Math.floor(eased * end));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, [end, duration, startOnView]);

  return { value, ref };
}
