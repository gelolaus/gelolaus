"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { PostMeta } from "@/lib/blog";
import { TransitionLink } from "@/components/TransitionLink";
import { Contact } from "@/components/sections/Contact";

const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      delay: i * 0.1,
    },
  }),
};

export function BlogList({ posts }: { posts: PostMeta[] }) {
  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { once: true });
  const gridInView = useInView(gridRef, { once: true, margin: "-80px" });

  return (
    <>
      <main>
        {/* ── Hero ── */}
        <section
          id="journal-hero"
          ref={heroRef}
          style={{
            position: "relative",
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding:
              "clamp(5rem, 12vw, 8rem) clamp(1.5rem, 6vw, 6rem) clamp(3rem, 6vw, 5rem)",
            overflow: "hidden",
          }}
        >
          <motion.h1
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="text-hero"
            style={{
              fontFamily: "var(--font-geist)",
              fontWeight: 700,
              color: "var(--color-text)",
              marginBottom: "clamp(1.25rem, 3vw, 2rem)",
            }}
          >
            Journal.
          </motion.h1>

          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            style={{
              fontFamily: "var(--font-geist)",
              fontWeight: 400,
              fontSize: "clamp(1.3rem, 3.5vw, 2.25rem)",
              color: "var(--color-text-muted)",
              letterSpacing: "-0.02em",
              lineHeight: 1.5,
            }}
          >
            Thoughts on tech, community, and making things.
          </motion.p>

          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
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
              style={{
                fontSize: "1.1rem",
                color: "var(--color-text-muted)",
                display: "block",
              }}
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
                fontSize: "0.8rem",
              }}
            >
              Scroll
            </span>
          </motion.div>
        </section>

        {/* ── Posts grid ── */}
        <section
          id="journal-posts"
          ref={gridRef}
          style={{
            padding:
              "clamp(4rem, 8vw, 6rem) clamp(1.5rem, 6vw, 6rem) clamp(6rem, 10vw, 8rem)",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            Posts
          </motion.p>

          {posts.length === 0 ? (
            <motion.p
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate={gridInView ? "visible" : "hidden"}
              style={{
                fontFamily: "var(--font-geist)",
                color: "var(--color-text-muted)",
                fontSize: "1rem",
              }}
            >
              No posts yet — check back soon.
            </motion.p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(min(100%, 420px), 1fr))",
                gap: "1.5rem",
              }}
            >
              {posts.map((post, i) => (
                <BlogCard key={post.slug} post={post} index={i + 1} inView={gridInView} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Contact />
    </>
  );
}

function BlogCard({
  post,
  index,
  inView,
}: {
  post: PostMeta;
  index: number;
  inView: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const year = post.date.split("-")[0];

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <TransitionLink
        href={`/journal/${post.slug}`}
        data-cursor="card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "block",
          padding: "clamp(1.5rem, 3vw, 2.5rem)",
          border: "1px solid",
          borderRadius: "16px",
          background: "var(--color-surface)",
          textDecoration: "none",
          color: "var(--color-text)",
          cursor: "none",
          transition:
            "border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease",
          position: "relative",
          overflow: "hidden",
          borderColor: hovered ? "var(--color-accent)" : "var(--color-border)",
          boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.08)" : "none",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
        }}
      >
        {/* Top row: tag + arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "clamp(1.5rem, 3vw, 2rem)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "0.7rem",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "4px 10px",
              border: "1px solid var(--color-border)",
              borderRadius: "9999px",
            }}
          >
            Post · {year}
          </span>
          <span
            style={{
              fontSize: "1.2rem",
              color: hovered ? "var(--color-accent)" : "var(--color-text-muted)",
              flexShrink: 0,
              transition: "transform 0.25s ease, color 0.25s ease",
              transform: hovered ? "translate(4px, -4px)" : "translate(0, 0)",
            }}
          >
            ↗
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "var(--font-geist)",
            fontWeight: 600,
            fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            marginBottom: "0.75rem",
            color: "var(--color-text)",
          }}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        <p
          style={{
            fontFamily: "var(--font-geist)",
            fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
            color: "var(--color-text-muted)",
            lineHeight: 1.65,
            marginBottom: "clamp(1.5rem, 2.5vw, 2rem)",
          }}
        >
          {post.excerpt}
        </p>

        {/* Meta row: red dot + date · read time */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontFamily: "var(--font-geist)",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--color-accent)",
                flexShrink: 0,
              }}
            />
            {post.formattedDate} · {post.readTime}
          </span>
        </div>
      </TransitionLink>
    </motion.div>
  );
}
