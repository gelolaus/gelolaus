"use client";

import { useRef, useState, useEffect } from "react";
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

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export function BlogPost({ post }: { post: Post }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });
  const [pageUrl, setPageUrl] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPageUrl(window.location.href);
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const shareText = `Check out this article by Angelo Laus!\n\n${pageUrl}`;
  const encodedText = encodeURIComponent(`Check out this article by Angelo Laus!\n\n`);
  const encodedUrl = encodeURIComponent(pageUrl);

  function handleShare(platformUrl: string) {
    navigator.clipboard.writeText(shareText).catch(() => {});
    setToastVisible(true);
    setTimeout(() => window.open(platformUrl, "_blank", "noopener,noreferrer"), 400);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3500);
  }

  const shareLinks = [
    {
      key: "x",
      label: "X",
      icon: <XIcon />,
      platformUrl: `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: <FacebookIcon />,
      platformUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: <LinkedInIcon />,
      platformUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

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

          {/* Share */}
          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{ marginTop: "3.5rem" }}
          >
            <hr
              style={{
                border: "none",
                borderTop: "1px solid var(--color-border)",
                marginBottom: "1.75rem",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                letterSpacing: "0.08em",
                marginBottom: "1rem",
              }}
            >
              SHARE
            </p>
            <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
              {shareLinks.map(({ key, label, icon, platformUrl }) => (
                <button
                  key={key}
                  onClick={() => handleShare(platformUrl)}
                  className="share-btn"
                  data-cursor="nav"
                  aria-label={`Share on ${label}`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Contact />

      {/* Share toast */}
      <motion.div
        initial={{ opacity: 0, y: 12, x: "-50%" }}
        animate={{ opacity: toastVisible ? 1 : 0, y: toastVisible ? 0 : 12, x: "-50%" }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        aria-live="polite"
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "50%",
          zIndex: 9999,
          pointerEvents: "none",
          background: "var(--color-text)",
          color: "var(--color-bg)",
          fontFamily: "var(--font-geist-mono)",
          fontSize: "0.78rem",
          letterSpacing: "0.02em",
          padding: "0.625rem 1.25rem",
          borderRadius: "9999px",
          whiteSpace: "nowrap",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        }}
      >
        Text copied — paste it in the share dialog
      </motion.div>
    </>
  );
}
