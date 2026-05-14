"use client";

import { usePathname } from "next/navigation";
import { usePageTransition } from "@/components/PageTransition";

export function TransitionLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const { navigateTo } = usePageTransition();
  const pathname = usePathname();

  return (
    <a
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();

        // Split off any hash so we can compare paths independently
        const hashIdx = href.indexOf("#");
        const hrefPath = hashIdx !== -1 ? href.slice(0, hashIdx) : href;
        const hash = hashIdx !== -1 ? href.slice(hashIdx + 1) : null;
        const targetPath = hrefPath || pathname;

        if (targetPath === pathname) {
          // Same page — scroll to hash target or back to top
          if (hash) {
            document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
          return;
        }

        // Cross-page — fire the iris transition
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        navigateTo(href, x, y);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
