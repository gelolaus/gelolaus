"use client";

import { useState } from "react";
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

  return (
    <>
      <Loader onComplete={() => setLoaded(true)} />
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
