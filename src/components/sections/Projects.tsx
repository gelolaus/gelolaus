"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const projects = [
  {
    title: "Eypi",
    url: "eypi.cc",
    href: "https://eypi.cc",
    description: "URL shortener with analytics and a school forms auto-fill generator — built for Asia Pacific College students.",
    image: "/images/projects/eypi.png",
    accentBg: "#1a1a2e",
  },
  {
    title: "gelolaus.com",
    url: "gelolaus.com",
    href: "https://gelolaus.com",
    description: "Self-managed personal cloud: NextCloud, AdGuard, Proxmox, BentoPDF, and VPN — all on my own infrastructure.",
    image: "/images/projects/gelolaus-infra.png",
    accentBg: "#0d1f0d",
  },
  {
    title: "@APC",
    url: "notion.so",
    href: "#",
    description: "Product-focused student community at Asia Pacific College — started with Notion, expanding into new digital experiences.",
    image: "/images/projects/apc.png",
    accentBg: "#1c1a0d",
  },
];

const fadeUp = {
  hidden: { y: 32, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 24, delay: i * 0.08 },
  }),
};

export function Projects() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section
      id="projects"
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
          marginBottom: "clamp(1rem, 2vw, 1.5rem)",
        }}
      >
        Work
      </motion.p>

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
          letterSpacing: "-0.03em",
          marginBottom: "clamp(2.5rem, 5vw, 4rem)",
        }}
      >
        Things I&apos;ve worked on.
      </motion.h2>

      {/* Project list */}
      <div>
        {projects.map((project, i) => (
          <motion.a
            key={project.title}
            href={project.href}
            target={project.href !== "#" ? "_blank" : undefined}
            rel="noopener noreferrer"
            data-cursor="card"
            custom={i + 2}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              display: "flex",
              flexDirection: isDesktop ? "row" : "column",
              alignItems: isDesktop ? "center" : "flex-start",
              gap: isDesktop ? "clamp(1.5rem, 3vw, 3rem)" : "0.5rem",
              padding: "clamp(1.5rem, 3vw, 2rem) 0",
              borderTop: "1px solid var(--color-border)",
              textDecoration: "none",
              transition: "border-color 0.2s ease",
              cursor: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
            }}
          >
            {/* 16:9 thumbnail */}
            <div
              style={{
                flexShrink: 0,
                width: isDesktop ? "clamp(120px, 15vw, 180px)" : "100%",
                aspectRatio: "16 / 9",
                background: project.accentBg,
                borderRadius: "4px",
                overflow: "hidden",
                border: "1px solid var(--color-border)",
              }}
            >
              <img
                src={project.image}
                alt={project.title}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top center",
                  display: "block",
                }}
              />
            </div>

            {/* Title + description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "var(--font-geist)",
                  fontWeight: 600,
                  fontSize: "clamp(1rem, 2vw, 1.25rem)",
                  color: "var(--color-text)",
                  letterSpacing: "-0.02em",
                  marginBottom: "0.375rem",
                }}
              >
                {project.title}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-geist)",
                  fontWeight: 400,
                  fontSize: "clamp(0.82rem, 1.2vw, 0.92rem)",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.6,
                  letterSpacing: "-0.005em",
                }}
              >
                {project.description}
              </p>
            </div>

            {/* URL → */}
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: "var(--font-geist-mono)",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {project.url}
              <span style={{ fontSize: "0.9rem" }}>↗</span>
            </div>
          </motion.a>
        ))}
        {/* Bottom border */}
        <div style={{ borderTop: "1px solid var(--color-border)" }} />
      </div>
    </section>
  );
}
