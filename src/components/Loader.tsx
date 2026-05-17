"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageTransition } from "@/components/PageTransition";

export function Loader({ onComplete }: { onComplete: () => void }) {
  const { isTransitioning } = usePageTransition();
  const [skip] = useState(() => isTransitioning);
  const [visible, setVisible] = useState(true);

  // Skip path: fire onComplete without rendering anything
  useEffect(() => {
    if (skip) onComplete();
  }, [skip, onComplete]);

  // Safety-net: if the animation never completes, force-exit after 3s
  useEffect(() => {
    if (skip) return;
    const timeout = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 3000);
    return () => clearTimeout(timeout);
  }, [skip, onComplete]);

  if (skip) return null;

  const handleComplete = () => {
    setVisible(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader-container"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: [0.4, 0, 1, 1], delay: 0.25 } }}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ scale: 40, opacity: 0, transition: { duration: 0.85, ease: [0.55, 0, 1, 0.45] } }}
            transition={{ duration: 0.6, ease: [0.24, 0, 0.35, 1] }}
            onAnimationComplete={(definition) => {
              // After the enter animation finishes, hold 500ms then trigger exit
              if (definition === "animate") {
                setTimeout(handleComplete, 500);
              }
            }}
            style={{
              fontFamily: "var(--font-geist)",
              fontSize: "clamp(2.5rem, 8vw, 6rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "var(--color-accent)" }}>@</span>
            <span style={{ color: "var(--color-text)" }}>gelolaus</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
