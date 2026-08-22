import Link from "next/link";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function Home() {
  return (
    <main className="page">
      <h1>Angelo Laus</h1>

      <p>
        I&apos;m @gelolaus, a builder and community lead from the Philippines.
        I build practical solutions, scale the communities around them, and
        design them to look good.
      </p>

      <p>Most of my time goes to community:</p>
      <ul className="home-list">
        <li>
          <a href="https://instagram.com/notionhq" {...ext}>
            Notion
          </a>
          : Cohort 4 (Fall 2025) Campus Leader and Community Lead for{" "}
          <a href="https://instagram.com/notion.at.apc" {...ext}>
            Notion @ APC
          </a>
        </li>
        <li>
          <a href="https://instagram.com/sipnscale" {...ext}>
            Sip &amp; Scale
          </a>
          : Partnerships Lead for student communities, restaurants, and
          caf&eacute;s
        </li>
        <li>
          <a href="https://instagram.com/jpcs.apc" {...ext}>
            JPCS-APC
          </a>
          : Vice President for External Affairs; leads partnerships with
          Google, Arduino, DataCamp, and Notion
        </li>
      </ul>

      <p>Things I&apos;ve built:</p>
      <ul className="home-list">
        <li>
          <a href="https://wantap.cc" {...ext}>
            Wantap (2026)
          </a>
          : A calling card people tap with their phone; same card, same link,
          you change the page without printing a new one.
        </li>
        <li>
          <a href="https://eypi.cc" {...ext}>
            Eypi (2026)
          </a>
          : An org suite for Asia Pacific College student organizations,
          students, &amp; staff; one campus login for links, forms, frames,
          &amp; tickets.
        </li>
        <li>
          Homelab (2026): A personal self-hosted homelab for privacy and
          productivity; features{" "}
          <a href="https://cloud.gelolaus.com" {...ext}>
            Nextcloud
          </a>
          ,{" "}
          <a href="https://adguard.gelolaus.com" {...ext}>
            AdGuard Home
          </a>
          ,{" "}
          <a href="https://bentopdf.gelolaus.com" {...ext}>
            BentoPDF
          </a>
          , and dedicated VPN routing.
        </li>
      </ul>

      <p>
        Connect with me on{" "}
        <a href="https://instagram.com/gelolaus" {...ext}>
          Instagram
        </a>{" "}
        or{" "}
        <a href="https://linkedin.com/in/gelolaus" {...ext}>
          LinkedIn
        </a>
        , or email{" "}
        <a href="mailto:hello@gelolaus.com">hello@gelolaus.com</a>. I write
        occasionally in my <Link href="/journal">journal</Link>.
      </p>
    </main>
  );
}
