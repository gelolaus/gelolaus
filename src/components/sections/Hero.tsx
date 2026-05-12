"use client";

import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.4, 0, 0.2, 1];

const socials = [
  { label: "Email", href: "mailto:hello@gelolaus.com" },
  { label: "Facebook", href: "https://facebook.com/gelolaus" },
  { label: "Instagram", href: "https://instagram.com/gelolaus" },
  { label: "LinkedIn", href: "https://linkedin.com/in/gelolaus" },
];

export function Hero({ loaded }: { loaded: boolean }) {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(5rem, 12vw, 8rem) clamp(1.5rem, 6vw, 6rem) clamp(3rem, 6vw, 5rem)",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", zIndex: 1 }}>
        <motion.h1
          className="text-hero"
          initial={{ opacity: 0, y: 28 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease, delay: 0.05 }}
          style={{
            fontFamily: "var(--font-geist)",
            fontWeight: 700,
            color: "var(--color-text)",
            lineHeight: 0.95,
            marginBottom: "clamp(1.25rem, 3vw, 2rem)",
            whiteSpace: "nowrap",
          }}
        >
          Hi, I&apos;m @gelolaus!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease, delay: 0.22 }}
          style={{
            fontFamily: "var(--font-geist)",
            fontWeight: 400,
            fontSize: "clamp(1.3rem, 3.5vw, 2.25rem)",
            color: "var(--color-text-muted)",
            letterSpacing: "-0.02em",
            lineHeight: 1.5,
          }}
        >
          Community Builder. Student Leader.
        </motion.p>

        {/* Social link pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.5 }}
          style={{
            display: "flex",
            gap: "0.625rem",
            flexWrap: "wrap",
            marginTop: "clamp(1.5rem, 4vw, 2.5rem)",
          }}
        >
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              data-cursor="cta"
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "clamp(0.85rem, 1.3vw, 1rem)",
                fontWeight: 500,
                color: "var(--color-text-muted)",
                textDecoration: "none",
                letterSpacing: "0.05em",
                padding: "0.7rem 1.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "9999px",
                display: "inline-flex",
                alignItems: "center",
                cursor: "none",
                transition: "border-color 0.2s ease, color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--color-accent)";
                el.style.color = "var(--color-text)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--color-border)";
                el.style.color = "var(--color-text-muted)";
              }}
            >
              {s.label}
            </a>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={loaded ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "clamp(3rem, 8vw, 5rem)",
          }}
        >
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            style={{ display: "block", fontSize: "1.1rem", color: "var(--color-text-muted)" }}
          >
            ↓
          </motion.span>
          <span
            className="text-caption"
            style={{
              fontFamily: "var(--font-geist)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
        </motion.div>
      </div>
    </section>
  );
}
