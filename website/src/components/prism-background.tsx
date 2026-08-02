'use client';

import { useEffect, useRef } from 'react';

interface PrismBackgroundProps {
  className?: string;
}

export function PrismBackground({ className }: PrismBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    function resize() {
      canvas!.width = canvas!.offsetWidth * 2;
      canvas!.height = canvas!.offsetHeight * 2;
    }

    function draw() {
      if (!ctx || !canvas) return;
      time += 0.003;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scale = 3.6;
      const baseWidth = 5.5 * canvas.width * 0.0015;
      const height = 3.5 * canvas.height * 0.003;
      const glow = 1;
      const noise = 0.3;
      const hueShift = time * 0.1;
      const colorFrequency = 1;
      const hoverStrength = 2;
      const inertia = 0.05;
      const bloom = 1;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.15;
        const radius = baseWidth * 0.7;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius * 0.6;

        const hue = ((i / 8) * 360 + hueShift * 60) % 360;
        const alpha = 0.15 + Math.sin(time * 0.5 + i) * 0.05;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, baseWidth * 0.8);
        gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, ${alpha * 1.5})`);
        gradient.addColorStop(0.4, `hsla(${hue}, 60%, 50%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${hue}, 60%, 40%, 0)`);

        ctx.beginPath();
        ctx.arc(x, y, baseWidth * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.filter = `blur(${bloom * 60}px)`;
        ctx.fill();
        ctx.filter = 'none';
      }

      for (let i = 0; i < 3; i++) {
        const angle = time * 0.3 + (i * Math.PI * 2) / 3;
        const radius = canvas.width * 0.35;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius * 0.6;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, canvas.width * 0.3);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.06)');
        gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.03)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(x, y, canvas.width * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className || ''}`}
      style={{ zIndex: 0 }}
    />
  );
}