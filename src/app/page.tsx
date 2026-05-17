"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader } from "@/components/Loader";
import { Cursor } from "@/components/Cursor";
import { Nav } from "@/components/Nav";
import { ScrollNav } from "@/components/ScrollNav";
import { Hero } from "@/components/sections/Hero";
import { ParticleCanvas } from "@/components/ParticleCanvas";

const About = dynamic(
  () => import("@/components/sections/About").then((m) => ({ default: m.About })),
  { ssr: false }
);
const Experience = dynamic(
  () => import("@/components/sections/Experience").then((m) => ({ default: m.Experience })),
  { ssr: false }
);
const Projects = dynamic(
  () => import("@/components/sections/Projects").then((m) => ({ default: m.Projects })),
  { ssr: false }
);
const Contact = dynamic(
  () => import("@/components/sections/Contact").then((m) => ({ default: m.Contact })),
  { ssr: false }
);

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  // Skip the intro animation on every visit after the first in a session.
  // The Loader itself also skips via PageTransition context on client-side
  // navigation — this is the fallback for direct URL visits after first load.
  useEffect(() => {
    if (sessionStorage.getItem("loaderShown") === "true") {
      setShowLoader(false);
      setLoaded(true);
    }
  }, []);

  return (
    <>
      <ParticleCanvas />
      {showLoader && (
        <Loader
          onComplete={() => {
            sessionStorage.setItem("loaderShown", "true");
            setLoaded(true);
            setShowLoader(false);
          }}
        />
      )}
      <Cursor />
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
