"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { TransitionLink } from "@/components/TransitionLink";

const links = [
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Contact", href: "/#contact" },
  { label: "Journal", href: "/journal" },
];

const journalLinks = [
  { label: "Posts", href: "/journal#journal-posts" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();
  const isJournalPage = pathname?.startsWith("/journal") ?? false;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    setScrolled(true);
    const onScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 40) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, [lastScrollY]);

  return (
    <nav
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "-100%"})`,
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "4px" : "8px",
        padding: isMobile ? "7px 12px" : "10px 20px",
        borderRadius: "9999px",
        background: scrolled ? "var(--color-surface)" : "transparent",
        border: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        opacity: visible ? 1 : 0,
        transition: "background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease, opacity 0.3s ease, transform 0.3s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Logo */}
      <TransitionLink
        href="/"
        data-cursor="nav"
        style={{
          fontFamily: "var(--font-geist)",
          fontWeight: 500,
          fontSize: "0.9rem",
          color: "var(--color-text)",
          textDecoration: "none",
          marginRight: "16px",
          letterSpacing: "-0.01em",
        }}
      >
        @gelolaus
      </TransitionLink>

      {/* Links — hidden on mobile; journal pages get a curated subset */}
      {!isMobile && (isJournalPage ? journalLinks : links).map((link) => {
        const linkStyle = {
          fontFamily: "var(--font-geist)",
          fontWeight: 400,
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
          textDecoration: "none",
          padding: "4px 8px",
          transition: "color 0.2s ease",
          cursor: "none" as const,
        };
        const handlers = {
          onMouseEnter: (e: React.MouseEvent<HTMLElement>) =>
            ((e.target as HTMLElement).style.color = "var(--color-text)"),
          onMouseLeave: (e: React.MouseEvent<HTMLElement>) =>
            ((e.target as HTMLElement).style.color = "var(--color-text-muted)"),
        };
        // Path links (including hash-suffixed paths) → TransitionLink (handles same-page hash too)
        // Pure anchor links (#contact, /#section) → plain <a>
        const isPathLink = link.href.startsWith("/") && !link.href.startsWith("/#");
        return isPathLink ? (
          <TransitionLink
            key={link.label}
            href={link.href}
            data-cursor="nav"
            className="link-underline"
            style={linkStyle}
            {...handlers}
          >
            {link.label}
          </TransitionLink>
        ) : (
          <a
            key={link.label}
            href={link.href}
            data-cursor="nav"
            className="link-underline"
            style={linkStyle}
            {...handlers}
          >
            {link.label}
          </a>
        );
      })}

      {/* Dark mode toggle */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          data-cursor="nav"
          aria-label="Toggle dark mode"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "1px solid var(--color-border)",
            background: "transparent",
            cursor: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "8px",
            transition: "background 0.2s ease, border-color 0.2s ease",
            color: "var(--color-text)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-accent)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent)";
            (e.currentTarget as HTMLElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text)";
          }}
        >
          <span style={{ fontSize: "14px", lineHeight: 1 }}>
            {theme === "dark" ? "○" : "●"}
          </span>
        </button>
      )}
    </nav>
  );
}
