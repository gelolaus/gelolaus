const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function Home() {
  return (
    <main className="page">
      <h1>Angelo Laus</h1>

      <p>
        I&apos;m @gelolaus, a builder and community leader from the Philippines.
      </p>

      <p>My active roles:</p>
      <ul className="home-list">
        <li>
          <a href="https://instagram.com/notionhq" {...ext}>
            Notion
          </a>{" "}
          Campus Leader (Cohort 4)
        </li>
        <li>
          <a href="https://instagram.com/sipnscale" {...ext}>
            Sip &amp; Scale
          </a>{" "}
          Partnerships
        </li>
        <li>
          <a href="https://instagram.com/jpcs.apc" {...ext}>
            JPCS-APC
          </a>{" "}
          VP for External Affairs
        </li>
      </ul>

      <p>Things I&apos;ve built:</p>
      <ul className="home-list">
        <li>
          <a href="https://wantap.cc" {...ext}>
            Wantap (2026)
          </a>{" "}
          &ndash; Digital calling card platform with custom dynamic routing.
        </li>
        <li>
          <a href="https://eypi.cc" {...ext}>
            Eypi (2026)
          </a>{" "}
          &ndash; Unified campus suite for student org links, forms, and
          ticketing.
        </li>
        <li>
          Homelab (2026) &ndash; Self-hosted infrastructure for private cloud
          storage and network security.
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
        <a href="mailto:hello@gelolaus.com">hello@gelolaus.com</a>.
      </p>
    </main>
  );
}
