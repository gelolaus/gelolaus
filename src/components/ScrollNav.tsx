"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const sections = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export function ScrollNav() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "clamp(1.25rem, 3vw, 2rem)",
        right: "clamp(1.25rem, 3vw, 2rem)",
        zIndex: 800,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "0.5rem",
        pointerEvents: visible ? "auto" : "none",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <AnimatePresence>
        {open && visible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "14px",
              padding: "0.4rem",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          >
            {sections.map((s) => (
              <a
                key={s.href}
                href={s.href}
                data-cursor="nav"
                onClick={() => setOpen(false)}
                style={{
                  fontFamily: "var(--font-geist)",
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  padding: "0.55rem 1.1rem",
                  borderRadius: "10px",
                  cursor: "none",
                  transition: "background 0.15s ease, color 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "var(--color-surface-raised)";
                  el.style.color = "var(--color-text)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "transparent";
                  el.style.color = "var(--color-text-muted)";
                }}
              >
                {s.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        data-cursor="nav"
        aria-label="Back to top"
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          color: "var(--color-text)",
          fontSize: "1.1rem",
          cursor: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(12px)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          transition: "border-color 0.2s ease, background 0.2s ease, color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = "var(--color-accent)";
          el.style.background = "var(--color-accent)";
          el.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = "var(--color-border)";
          el.style.background = "var(--color-surface)";
          el.style.color = "var(--color-text)";
        }}
      >
        ↑
      </motion.button>
    </div>
  );
}
