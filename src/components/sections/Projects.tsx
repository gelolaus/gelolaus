"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const projects = [
  {
    title: "Eypi",
    url: "eypi.cc",
    href: "https://eypi.cc",
    description:
      "URL shortener with analytics and a school forms auto-fill generator, built for Asia Pacific College students.",
    image: "/images/projects/eypi.png",
    accentBg: "#1a1a2e",
  },
  {
    title: "gelolaus.com",
    url: "gelolaus.com",
    href: "https://gelolaus.com",
    description:
      "Self-managed personal cloud: NextCloud, AdGuard, Proxmox, BentoPDF, and VPN, all on my own infrastructure.",
    image: "/images/projects/gelolaus-infra.png",
    accentBg: "#0d1f0d",
  },
  {
    title: "@APC",
    url: "notion.so",
    href: "#",
    description:
      "Product-focused student community at Asia Pacific College. Started with Notion, expanding into new digital experiences.",
    image: "/images/projects/apc.png",
    accentBg: "#1c1a0d",
  },
];

const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      delay: i * 0.12,
    },
  }),
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "50%" : "-50%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-50%" : "50%",
    opacity: 0,
  }),
};

export function Projects() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [isDesktop, setIsDesktop] = useState(false);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const paginate = useCallback(
    (dir: number) => {
      setDirection(dir);
      setCurrent((prev) => (prev + dir + projects.length) % projects.length);
    },
    []
  );

  const goTo = useCallback(
    (i: number) => {
      setDirection(i > current ? 1 : -1);
      setCurrent(i);
    },
    [current]
  );

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
        Projects
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

      {isDesktop ? (
        /* ── Desktop carousel ── */
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              height: "clamp(320px, 38vw, 460px)",
            }}
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 200, damping: 26 },
                  opacity: { duration: 0.3 },
                }}
                style={{ position: "absolute", inset: 0, display: "flex", alignItems: "stretch" }}
              >
                {/* Large image */}
                <a
                  href={projects[current].href !== "#" ? projects[current].href : undefined}
                  target={projects[current].href !== "#" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  data-cursor="card"
                  style={{
                    flexShrink: 0,
                    width: "58%",
                    background: projects[current].accentBg,
                    display: "block",
                    overflow: "hidden",
                    cursor: "none",
                    textDecoration: "none",
                  }}
                >
                  <img
                    src={projects[current].image}
                    alt={projects[current].title}
                    draggable={false}
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
                </a>

                {/* Text panel */}
                <div
                  style={{
                    flex: 1,
                    padding: "clamp(2rem, 4vw, 3.5rem)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background: "var(--color-surface)",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-geist)",
                        fontWeight: 700,
                        fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                        color: "var(--color-text)",
                        letterSpacing: "-0.03em",
                        marginBottom: "1rem",
                      }}
                    >
                      {projects[current].title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-geist)",
                        fontWeight: 400,
                        fontSize: "clamp(0.88rem, 1.3vw, 1rem)",
                        color: "var(--color-text-muted)",
                        lineHeight: 1.65,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {projects[current].description}
                    </p>
                  </div>

                  <div>
                    <a
                      href={projects[current].href !== "#" ? projects[current].href : undefined}
                      target={projects[current].href !== "#" ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      data-cursor="nav"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: "0.8rem",
                        color: "var(--color-text-muted)",
                        letterSpacing: "0.02em",
                        textDecoration: "none",
                        marginBottom: "2rem",
                        cursor: "none",
                      }}
                    >
                      {projects[current].url}
                      <span style={{ fontSize: "0.95rem" }}>↗</span>
                    </a>

                    {/* Dot indicators */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {projects.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => goTo(i)}
                          aria-label={`Go to project ${i + 1}`}
                          style={{
                            width: i === current ? 20 : 6,
                            height: 6,
                            borderRadius: "9999px",
                            background:
                              i === current
                                ? "var(--color-accent)"
                                : "var(--color-border)",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            transition: "width 0.3s ease, background 0.3s ease",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Prev / Next arrows */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "1.25rem",
            }}
          >
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => paginate(dir)}
                data-cursor="nav"
                aria-label={dir === -1 ? "Previous project" : "Next project"}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "1px solid var(--color-border)",
                  background: "transparent",
                  color: "var(--color-text)",
                  fontSize: "1.1rem",
                  cursor: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                  el.style.background = "transparent";
                  el.style.color = "var(--color-text)";
                }}
              >
                {dir === -1 ? "←" : "→"}
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        /* ── Mobile stacked list ── */
        <div>
          {projects.map((project, i) => (
            <motion.a
              key={project.title}
              href={project.href !== "#" ? project.href : undefined}
              target={project.href !== "#" ? "_blank" : undefined}
              rel="noopener noreferrer"
              data-cursor="card"
              custom={i + 2}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.5rem",
                padding: "clamp(1.5rem, 3vw, 2rem) 0",
                borderTop: "1px solid var(--color-border)",
                textDecoration: "none",
                cursor: "none",
              }}
            >
              <div
                style={{
                  width: "100%",
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
                  draggable={false}
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

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
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
                </h3>
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

              <div
                style={{
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
          <div style={{ borderTop: "1px solid var(--color-border)" }} />
        </div>
      )}
    </section>
  );
}
