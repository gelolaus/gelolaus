"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
};

const MAX_PARTICLES = 100;
const SPAWN_PER_FRAME = 3;

const PALETTE = [
  "#FF3B30", // red
  "#FF9500", // orange
  "#FFCC00", // yellow
  "#30D158", // green
  "#007AFF", // blue
  "#BF5AF2", // purple
  "#FF375F", // pink
  "#00C7BE", // teal
];

function createParticle(x: number, y: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 1.5 + Math.random() * 2;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: [4, 6, 8, 10][Math.floor(Math.random() * 4)],
    alpha: 1,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.18,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
  };
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    particles: [] as Particle[],
    isDown: false,
    mouseX: 0,
    mouseY: 0,
    rafId: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (s.isDown) {
        for (let i = 0; i < SPAWN_PER_FRAME; i++) {
          s.particles.push(createParticle(s.mouseX, s.mouseY));
          // remove oldest if over cap
          if (s.particles.length > MAX_PARTICLES) {
            s.particles.shift();
          }
        }
      }

      s.particles = s.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.016;
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
        return true;
      });

      s.rafId = requestAnimationFrame(tick);
    };
    s.rafId = requestAnimationFrame(tick);

    const setPos = (x: number, y: number) => {
      s.mouseX = x;
      s.mouseY = y;
    };

    const onMouseDown = (e: MouseEvent) => { s.isDown = true; setPos(e.clientX, e.clientY); };
    const onMouseMove = (e: MouseEvent) => { setPos(e.clientX, e.clientY); };
    const onMouseUp = () => { s.isDown = false; };

    const onTouchStart = (e: TouchEvent) => {
      s.isDown = true;
      setPos(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      setPos(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => { s.isDown = false; };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(s.rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9997,
        pointerEvents: "none",
      }}
    />
  );
}
