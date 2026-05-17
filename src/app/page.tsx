"use client";

import { useState, useEffect } from "react";
import { Loader } from "@/components/Loader";
import { Cursor } from "@/components/Cursor";
import { Nav } from "@/components/Nav";
import { ScrollNav } from "@/components/ScrollNav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

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
