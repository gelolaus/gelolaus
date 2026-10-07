import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/docs", label: "API docs" },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Site">
        {links.map(({ href, label }) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
        <a href="/llms.txt">llms.txt</a>
      </nav>
    </footer>
  );
}
