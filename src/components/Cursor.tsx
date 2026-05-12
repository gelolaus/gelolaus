"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorState = "default" | "nav" | "card" | "cta" | "text" | "click";

const springConfig = { stiffness: 350, damping: 28, mass: 0.5 };

const stateStyles: Record<CursorState, React.CSSProperties> = {
  default: {
    width: 24,
    height: 24,
    background: "#ffffff",
    border: "none",
    borderRadius: "50%",
    mixBlendMode: "difference",
  },
  nav: {
    width: 34,
    height: 34,
    background: "var(--color-accent)",
    border: "none",
    borderRadius: "50%",
    mixBlendMode: "normal",
  },
  card: {
    width: 80,
    height: 80,
    background: "var(--color-accent)",
    border: "none",
    borderRadius: "50%",
    mixBlendMode: "normal",
  },
  cta: {
    width: 48,
    height: 48,
    background: "var(--color-accent)",
    border: "none",
    borderRadius: "9999px",
    mixBlendMode: "normal",
  },
  text: {
    width: 2,
    height: 22,
    background: "#ffffff",
    border: "none",
    borderRadius: "1px",
    mixBlendMode: "difference",
  },
  click: {
    width: 8,
    height: 8,
    background: "#ffffff",
    border: "none",
    borderRadius: "50%",
    mixBlendMode: "difference",
  },
};

export function Cursor() {
  const [state, setState] = useState<CursorState>("default");
  const [isTouch, setIsTouch] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouch(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onMouseDown = () => setState("click");
    const onMouseUp = () => setState("default");

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const el = target.closest("[data-cursor]") as HTMLElement | null;
      setState(el ? (el.dataset.cursor as CursorState) ?? "default" : "default");
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseover", onMouseOver);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseover", onMouseOver);
    };
  }, [mouseX, mouseY]);

  if (isTouch) return null;

  const current = stateStyles[state];

  return (
    <motion.div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9998,
        pointerEvents: "none",
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        ...current,
        transition:
          "width 0.25s cubic-bezier(0.4,0,0.2,1), height 0.25s cubic-bezier(0.4,0,0.2,1), background 0.2s ease, border-radius 0.25s ease",
      }}
    >
      {state === "card" && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-geist)",
            fontSize: "0.65rem",
            fontWeight: 600,
            color: "#fff",
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
          }}
        >
          VIEW →
        </span>
      )}
    </motion.div>
  );
}
