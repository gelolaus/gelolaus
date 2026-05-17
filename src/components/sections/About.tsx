"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const roles = [
  { label: "Campus Leader", sub: "Notion" },
  { label: "Sip & Scale Partnerships", sub: "Sip & Scale" },
  { label: "JPCS-APC Director of Externals", sub: "Junior Philippine Computer Society - Asia Pacific College" },
  { label: "CS Student", sub: "Asia Pacific College" },
];

const fadeUp = {
  hidden: { y: 32, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: i * 0.12 },
  }),
};

export function About() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section
      id="about"
      ref={ref}
      style={{
        padding: "clamp(5rem, 10vw, 8rem) clamp(1.5rem, 6vw, 6rem)",
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Section label */}
      <motion.p
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="text-caption"
        style={{
          fontFamily: "var(--font-geist)",
          color: "var(--color-accent)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: "clamp(1.5rem, 3vw, 2.5rem)",
        }}
      >
        About
      </motion.p>

      <div className="about-grid">
        {/* Left — avatar + headline + narrative */}
        <div>
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              marginBottom: "2rem",
              width: "120px",
              height: "120px",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <Image
              src="/avatar.png"
              alt="Angelo Laus"
              width={120}
              height={120}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </motion.div>

          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-display"
            style={{
              fontFamily: "var(--font-geist)",
              fontWeight: 700,
              color: "var(--color-text)",
              marginBottom: "2rem",
              letterSpacing: "-0.03em",
            }}
          >
            Builder by nature,
            <br />
            <span style={{ fontWeight: 300, color: "var(--color-text-muted)" }}>
              curious by default.
            </span>
          </motion.h2>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-body-lg"
            style={{
              fontFamily: "var(--font-geist)",
              color: "var(--color-text-muted)",
              maxWidth: "540px",
              marginBottom: "1.25rem",
            }}
          >
            I&apos;m Gelo, a Computer Science student at Asia Pacific College. I find the
            intersection of community, productivity, and craft genuinely exciting. I build
            things that solve real problems, then make them look good.
          </motion.p>

          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-body-lg"
            style={{
              fontFamily: "var(--font-geist)",
              color: "var(--color-text-muted)",
              maxWidth: "540px",
              marginBottom: "2.5rem",
            }}
          >
            I spend as much time growing communities as I do writing code. Notion Campus
            Leader, JPCS external lead, Sip &amp; Scale local partner, always building
            something with people.
          </motion.p>

          <motion.blockquote
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              borderLeft: "2px solid var(--color-accent)",
              paddingLeft: "1.25rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-geist)",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(1rem, 2.2vw, 1.3rem)",
                color: "var(--color-text)",
                lineHeight: 1.55,
                letterSpacing: "-0.01em",
              }}
            >
              &ldquo;Make it work, make it good, make it yours.&rdquo;
            </p>
          </motion.blockquote>
        </div>

        {/* Right — roles */}
        <div>
          <motion.p
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-caption"
            style={{
              fontFamily: "var(--font-geist)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            Current Roles
          </motion.p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {roles.map((role, i) => (
              <motion.div
                key={role.label}
                custom={6 + i}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                style={{
                  padding: "1rem 0",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-geist)",
                    fontWeight: 500,
                    fontSize: "clamp(1.1rem, 2.3vw, 1.5rem)",
                    color: "var(--color-text)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {role.label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-geist)",
                    fontWeight: 400,
                    fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {role.sub}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
