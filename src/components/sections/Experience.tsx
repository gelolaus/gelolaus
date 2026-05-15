"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

type Entry = {
  role: string;
  org: string;
  period: string;
  startForCalc?: string;
  duration?: string;
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function calcDuration(startStr: string): string {
  const [mon, yr] = startStr.split(" ");
  const startMonth = MONTH_NAMES.indexOf(mon);
  const startYear = parseInt(yr, 10);
  const now = new Date();
  const totalMonths = Math.max(1,
    (now.getFullYear() - startYear) * 12 + (now.getMonth() - startMonth)
  );
  const years = Math.floor(totalMonths / 12);
  const mos = totalMonths % 12;
  if (years === 0) return `${mos} mo${mos !== 1 ? "s" : ""}`;
  if (mos === 0) return `${years} yr${years !== 1 ? "s" : ""}`;
  return `${years} yr${years !== 1 ? "s" : ""} ${mos} mo${mos !== 1 ? "s" : ""}`;
}

function getStartYear(period: string): number {
  const match = period.match(/\d{4}/);
  return match ? parseInt(match[0]) : 0;
}

const entries: Entry[] = [
  {
    role: "Partnerships",
    org: "Sip & Scale",
    period: "Jan 2026 – Present",
    startForCalc: "Jan 2026",
  },
  {
    role: "Notion Campus Leader",
    org: "Notion",
    period: "Sep 2025 – Present",
    startForCalc: "Sep 2025",
  },
  {
    role: "Director of External Relations",
    org: "Junior Philippine Computer Society – Asia Pacific College",
    period: "Jul 2025 – Present",
    startForCalc: "Jul 2025",
  },
  {
    role: "Staff Officer",
    org: "Harvard World Model United Nations",
    period: "Jan 2025 – Mar 2025",
    duration: "3 mos",
  },
  {
    role: "Whoscall Student Ambassador",
    org: "Gogolook",
    period: "Oct 2024 – Dec 2024",
    duration: "3 mos",
  },
  {
    role: "Executive Public Relations Officer",
    org: "APC Student Organization Association of Regents",
    period: "Jul 2024 – Aug 2025",
    duration: "14 mos",
  },
  {
    role: "IBM SkillsBuild Ambassador",
    org: "IBM Philippines",
    period: "Feb 2024 – Jul 2024",
    duration: "6 mos",
  },
  {
    role: "Executive Public Relations Associate",
    org: "APC Student Organization Association of Regents",
    period: "Jul 2023 – Jul 2024",
    duration: "1 yr",
  },
  {
    role: "Admissions Associate",
    org: "Asia Pacific College",
    period: "Jul 2023 – Aug 2023",
    duration: "2 mos",
  },
  {
    role: "Deputy President",
    org: "APC Student Organization Association of Regents",
    period: "Sep 2022 – Jul 2023",
    duration: "10 mos",
  },
  {
    role: "Vice President",
    org: "JISSA – Asia Pacific College",
    period: "Jun 2022 – Nov 2024",
    duration: "2 yrs 6 mos",
  },
  {
    role: "Events and Marketing Officer",
    org: "JISSA – Asia Pacific College",
    period: "Nov 2021 – Jun 2022",
    duration: "8 mos",
  },
  {
    role: "External Relations Committee Associate",
    org: "APC Microsoft Community",
    period: "Nov 2021 – May 2022",
    duration: "7 mos",
  },
  {
    role: "Deputy Documentation Officer",
    org: "APC Student Organization Association of Regents",
    period: "Sep 2021 – Sep 2022",
    duration: "1 yr",
  },
  {
    role: "App Translator",
    org: "AZSoft Technology Inc.",
    period: "Jul 2020 – Jun 2021",
    duration: "1 yr",
  },
  {
    role: "Content Creator",
    org: "Vonvon Inc.",
    period: "Feb 2019 – Dec 2021",
    duration: "2 yrs 11 mos",
  },
];

const headerFade = {
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

function YearSeparator({ year, isDesktop }: { year: number; isDesktop: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginTop: "clamp(2rem, 4vw, 3rem)",
        marginBottom: "clamp(2rem, 4vw, 3rem)",
        paddingLeft: isDesktop ? 0 : "calc(8px + 1.25rem)",
      }}
    >
      {isDesktop && (
        <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
      )}
      <span
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: "clamp(0.78rem, 1vw, 0.875rem)",
          fontWeight: 600,
          color: "var(--color-accent)",
          letterSpacing: "0.12em",
          background: "var(--color-bg)",
          padding: isDesktop ? "0 1rem" : "0",
        }}
      >
        {year}
      </span>
      {isDesktop && (
        <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
      )}
    </motion.div>
  );
}

function EntryCard({ entry, align }: { entry: Entry; align: "left" | "right" }) {
  const duration = entry.startForCalc ? calcDuration(entry.startForCalc) : entry.duration;

  return (
    <div style={{ textAlign: align }}>
      <h3
        style={{
          fontFamily: "var(--font-geist)",
          fontWeight: 600,
          fontSize: "clamp(1.4rem, 2.8vw, 2rem)",
          color: "var(--color-text)",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          marginBottom: "0.75rem",
        }}
      >
        {entry.role}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-geist)",
          fontWeight: 400,
          fontSize: "clamp(1rem, 2vw, 1.35rem)",
          color: "var(--color-text-muted)",
          lineHeight: 1.4,
          marginBottom: "0.75rem",
        }}
      >
        {entry.org}
      </p>
      <p
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: "clamp(0.82rem, 1.2vw, 1rem)",
          color: "var(--color-text-muted)",
          letterSpacing: "0.04em",
          opacity: 0.75,
        }}
      >
        {entry.period} · {duration}
      </p>
    </div>
  );
}

export function Experience() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  let lastYear = -1;

  return (
    <section
      id="experience"
      ref={ref}
      style={{
        padding: "clamp(5rem, 10vw, 8rem) clamp(1.5rem, 6vw, 6rem)",
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <motion.p
        custom={0}
        variants={headerFade}
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
        Experience
      </motion.p>

      <motion.h2
        custom={1}
        variants={headerFade}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="text-display"
        style={{
          fontFamily: "var(--font-geist)",
          fontWeight: 700,
          color: "var(--color-text)",
          letterSpacing: "-0.03em",
          marginBottom: "clamp(3rem, 6vw, 5rem)",
        }}
      >
        Where I&apos;ve been.
      </motion.h2>

      <div style={{ position: "relative" }}>
        {/* Center vertical line — desktop only */}
        {isDesktop && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: "1px",
              background: "var(--color-border)",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          />
        )}

        {entries.map((entry, i) => {
          const year = getStartYear(entry.period);
          const showYear = year !== lastYear;
          lastYear = year;
          const isLeft = i % 2 === 0;

          return (
            <div key={i}>
              {showYear && <YearSeparator year={year} isDesktop={isDesktop} />}

              <motion.div
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={
                  isDesktop
                    ? {
                        display: "grid",
                        gridTemplateColumns: "1fr 32px 1fr",
                        alignItems: "center",
                        marginBottom: "clamp(3rem, 6vw, 4.5rem)",
                      }
                    : {
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "1.25rem",
                        marginBottom: "clamp(2.5rem, 5vw, 3.5rem)",
                        paddingBottom: "clamp(2rem, 4vw, 3rem)",
                        borderBottom: "1px solid var(--color-border)",
                      }
                }
              >
                {isDesktop ? (
                  <>
                    <div style={{ paddingRight: "clamp(2rem, 4vw, 3rem)" }}>
                      {isLeft ? <EntryCard entry={entry} align="right" /> : null}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "var(--color-accent)",
                          flexShrink: 0,
                          boxShadow: "0 0 0 3px var(--color-bg)",
                        }}
                      />
                    </div>
                    <div style={{ paddingLeft: "clamp(2rem, 4vw, 3rem)" }}>
                      {!isLeft ? <EntryCard entry={entry} align="left" /> : null}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ paddingTop: "8px", flexShrink: 0 }}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "var(--color-accent)",
                        }}
                      />
                    </div>
                    <EntryCard entry={entry} align="left" />
                  </>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
