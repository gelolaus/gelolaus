"use client";

const socials = [
  { label: "Email", href: "mailto:hello@gelolaus.com", display: "hello@gelolaus.com" },
  { label: "Facebook", href: "https://facebook.com/gelolaus", display: "facebook.com/gelolaus" },
  { label: "Instagram", href: "https://instagram.com/gelolaus", display: "@gelolaus" },
  { label: "LinkedIn", href: "https://linkedin.com/in/gelolaus", display: "in/gelolaus" },
];

export function Contact() {
  return (
    <footer id="contact" className="footer-dark" style={{ width: "100%" }}>
      <div
        style={{
          padding: "clamp(4rem, 8vw, 6rem) clamp(1.5rem, 6vw, 6rem) clamp(2.5rem, 5vw, 4rem)",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Heading */}
        <h2
          className="text-hero"
          style={{
            fontFamily: "var(--font-geist)",
            fontWeight: 700,
            color: "#F5F5F5",
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            marginBottom: "clamp(3rem, 6vw, 5rem)",
            maxWidth: "900px",
          }}
        >
          Let&apos;s build something.
        </h2>

        {/* Social links list */}
        <nav>
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target={social.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="footer-link"
              data-cursor="cta"
            >
              <span
                style={{
                  fontFamily: "var(--font-geist)",
                  fontWeight: 500,
                  fontSize: "clamp(1.2rem, 3vw, 2rem)",
                  letterSpacing: "-0.03em",
                }}
              >
                {social.label}
              </span>
              <span
                className="footer-arrow"
                style={{
                  fontFamily: "var(--font-geist)",
                  fontSize: "clamp(1.2rem, 3vw, 2rem)",
                  marginLeft: "1rem",
                }}
              >
                ↗
              </span>
            </a>
          ))}
        </nav>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "clamp(2.5rem, 5vw, 4rem)",
            paddingTop: "1.5rem",
            borderTop: "1px solid #1F1F1F",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <span
            className="text-caption"
            style={{
              fontFamily: "var(--font-geist)",
              color: "#444",
              letterSpacing: "0.06em",
            }}
          >
            @GELOLAUS
          </span>
          <span
            className="text-caption"
            style={{
              fontFamily: "var(--font-geist)",
              color: "#444",
              letterSpacing: "0.06em",
            }}
          >
            ANGELO LAUS — {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
