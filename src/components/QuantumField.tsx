import { useEffect, useRef } from "react";

const QuantumField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    interface QParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      hue: number;
      phase: number;
      entangled?: number;
    }

    const particles: QParticle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create quantum particles with entanglement pairs
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.1,
        hue: Math.random() > 0.5 ? 185 : (Math.random() > 0.5 ? 270 : 43), // cyan, purple, or gold
        phase: Math.random() * Math.PI * 2,
        entangled: i % 3 === 0 ? i + 1 : undefined,
      });
    }

    const draw = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        // Quantum wave motion
        p.x += p.vx + Math.sin(time + p.phase) * 0.15;
        p.y += p.vy + Math.cos(time * 0.7 + p.phase) * 0.15;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Quantum superposition glow
        const glowAlpha = p.alpha * (0.5 + 0.5 * Math.sin(time * 2 + p.phase));

        // Outer glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, `hsla(${p.hue}, 100%, 65%, ${glowAlpha * 0.4})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 100%, 65%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${glowAlpha})`;
        ctx.fill();

        // Quantum entanglement lines (connecting pairs)
        if (p.entangled && p.entangled < particles.length) {
          const partner = particles[p.entangled];
          const dx = p.x - partner.x;
          const dy = p.y - partner.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            // Curved entanglement line
            const midX = (p.x + partner.x) / 2 + Math.sin(time * 3) * 20;
            const midY = (p.y + partner.y) / 2 + Math.cos(time * 3) * 20;
            ctx.quadraticCurveTo(midX, midY, partner.x, partner.y);
            ctx.strokeStyle = `hsla(185, 100%, 60%, ${0.08 * (1 - dist / 300)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Standard connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const lineHue = (p.hue + particles[j].hue) / 2;
            ctx.strokeStyle = `hsla(${lineHue}, 80%, 55%, ${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
};

export default QuantumField;
