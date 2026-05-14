"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";

type TransitionCtx = {
  navigateTo: (href: string, originX?: number, originY?: number) => void;
  isTransitioning: boolean;
};

const TransitionContext = createContext<TransitionCtx>({
  navigateTo: () => {},
  isTransitioning: false,
});

export const usePageTransition = () => useContext(TransitionContext);

type Phase = "idle" | "covering" | "covered" | "revealing";

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const controls = useAnimation();
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (phase === "covered" && pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setPhase("revealing");
      controls
        .start({
          clipPath: "circle(0% at 50% 50%)",
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        })
        .then(() => setPhase("idle"));
    }
  }, [pathname, phase, controls]);

  const navigateTo = useCallback(
    (href: string, originX = 50, originY = 50) => {
      if (phase !== "idle") return;
      if (href === pathname) return;
      setPhase("covering");
      controls
        .start({
          clipPath: `circle(150% at ${originX}% ${originY}%)`,
          transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] },
        })
        .then(() => {
          setPhase("covered");
          router.push(href);
        });
    },
    [phase, pathname, controls, router]
  );

  return (
    <TransitionContext.Provider value={{ navigateTo, isTransitioning: phase !== "idle" }}>
      {children}
      <motion.div
        initial={{ clipPath: "circle(0% at 50% 50%)" }}
        animate={controls}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9990,
          background: "#0f0f0f",
          pointerEvents: phase !== "idle" ? "all" : "none",
        }}
      />
    </TransitionContext.Provider>
  );
}
