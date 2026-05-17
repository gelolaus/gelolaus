"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { usePageTransition } from "@/components/PageTransition";

export function Loader({ onComplete }: { onComplete: () => void }) {
  const { isTransitioning } = usePageTransition();
  const [skip] = useState(() => isTransitioning);
  const loaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (skip) { onComplete(); return; }
    if (!loaderRef.current || !textRef.current) return;

    const handleComplete = () => {
      setVisible(false);
      onComplete();
    };

    const tl = gsap.timeline({
      onComplete: handleComplete,
    });

    tl.fromTo(
      textRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    )
      .to({}, { duration: 0.5 }) // hold — let it breathe
      .to(
        textRef.current,
        {
          scale: 40,
          opacity: 0,
          duration: 0.85,
          ease: "power3.in",
        },
        "exit"
      )
      .to(
        loaderRef.current,
        {
          opacity: 0,
          duration: 0.55,
          ease: "power2.in",
        },
        "exit+=0.25"
      );

    // Fallback timeout in case GSAP doesn't complete
    const timeout = setTimeout(handleComplete, 3000);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  if (skip || !visible) return null;

  return (
    <div
      ref={loaderRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        pointerEvents: "none",
      }}
    >
      <div
        ref={textRef}
        style={{
          fontFamily: "var(--font-geist)",
          fontSize: "clamp(2.5rem, 8vw, 6rem)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          opacity: 0,
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: "var(--color-accent)" }}>@</span>
        <span style={{ color: "var(--color-text)" }}>gelolaus</span>
      </div>
    </div>
  );
}
