"use client";

import { useState, useEffect } from "react";
import { Loader } from "@/components/Loader";
import { Cursor } from "@/components/Cursor";
import { ParticleCanvas } from "@/components/ParticleCanvas";
import { Nav } from "@/components/Nav";
import { ScrollNav } from "@/components/ScrollNav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

const SECTION_IDS = ["hero", "about", "experience", "projects", "contact"];

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
      e.preventDefault();

      const scrollMid = window.scrollY + window.innerHeight / 2;
      let currentIdx = 0;
      for (let i = 0; i < SECTION_IDS.length; i++) {
        const el = document.getElementById(SECTION_IDS[i]);
        if (!el) continue;
        if (el.offsetTop <= scrollMid) currentIdx = i;
      }
      const next = SECTION_IDS[Math.min(currentIdx + 1, SECTION_IDS.length - 1)];
      document.getElementById(next)?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Loader onComplete={() => setLoaded(true)} />
      <Cursor />
      <ParticleCanvas />
      <Nav />
      <ScrollNav />
      <main style={{ minHeight: "100svh" }}>
        <Hero loaded={loaded} />
        <About />
        <Experience />
        <Projects />
      </main>
      <Contact />
    </>
  );
}
