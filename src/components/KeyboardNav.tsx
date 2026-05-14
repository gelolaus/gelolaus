"use client";

import { useEffect } from "react";

export function KeyboardNav() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
      e.preventDefault();

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("section[id], footer[id]")
      );
      if (!sections.length) return;

      const scrollMid = window.scrollY + window.innerHeight / 2;
      let currentIdx = 0;
      sections.forEach((el, i) => {
        if (el.offsetTop <= scrollMid) currentIdx = i;
      });
      const next = sections[Math.min(currentIdx + 1, sections.length - 1)];
      next?.scrollIntoView({ behavior: "smooth" });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
