"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Post } from "@/lib/blog";
import { TransitionLink } from "@/components/TransitionLink";
import { Contact } from "@/components/sections/Contact";

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      delay: i * 0.1,
    },
  }),
};

export function BlogPost({ post }: { post: Post }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <>
      <main
        ref={ref}
        style={{
          minHeight: "100vh",
          paddingTop: "clamp(6rem, 12vw, 9rem)",
          paddingBottom: "clamp(10rem, 18vw, 14rem)",
        }}
      >
        {/* Back link */}
        <div
          style={{
            padding: "0 clamp(1.5rem, 6vw, 6rem)",
            maxWidth: "1400px",
            margin: "0 auto",
            marginBottom: "clamp(2rem, 4vw, 3rem)",
          }}
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <TransitionLink
              href="/journal"
              data-cursor="nav"
              className="link-underline"
              style={{
                fontFamily: "var(--font-geist)",
                fontSize: "0.9rem",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                cursor: "none",
              }}
            >
              ← Journal
            </TransitionLink>
          </motion.div>
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "0 clamp(1.5rem, 6vw, 6rem)",
              marginBottom: "clamp(2.5rem, 5vw, 4rem)",
            }}
          >
            <div
              style={{
                width: "100%",
                maxHeight: "480px",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
              }}
            >
              <img
                src={post.coverImage}
                alt={post.title}
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: "480px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Post header + content */}
        <div
          style={{
            padding: "0 clamp(1.5rem, 6vw, 6rem)",
            maxWidth: "80ch",
            margin: "0 auto",
          }}
        >
          {/* Title */}
          <motion.h1
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-display"
            style={{
              fontFamily: "var(--font-geist)",
              fontWeight: 700,
              color: "var(--color-text)",
              marginBottom: "1rem",
            }}
          >
            {post.title}
          </motion.h1>

          {/* Meta */}
          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "0.8rem",
              color: "var(--color-text-muted)",
              letterSpacing: "0.04em",
              marginBottom: "2rem",
            }}
          >
            {post.formattedDate} · {post.readTime}
          </motion.p>

          {/* Divider */}
          <motion.hr
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              border: "none",
              borderTop: "1px solid var(--color-border)",
              marginBottom: "3rem",
            }}
          />

          {/* Prose content */}
          <motion.article
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </div>
      </main>

      <Contact />
    </>
  );
}
