import type { CSSProperties } from "react";
import type { Contributions } from "@/lib/github-contributions";

type Props = {
  data: Contributions;
  profileUrl: string;
};

/** GitHub-style green contribution calendar: one column per week, Sunday on top. */
export function ContributionGraph({ data, profileUrl }: Props) {
  const offset = new Date(`${data.days[0].date}T00:00:00Z`).getUTCDay();
  const weeks = Math.ceil((offset + data.days.length) / 7);
  const total = data.total.toLocaleString("en-US");

  return (
    <figure className="contributions">
      <div
        className="contributions-grid"
        role="img"
        aria-label={`GitHub contribution graph: ${total} contributions in the last year`}
        style={{ "--weeks": weeks } as CSSProperties}
      >
        {Array.from({ length: offset }, (_, i) => (
          <span key={`pad-${i}`} aria-hidden="true" />
        ))}
        {data.days.map((day) => (
          <span
            key={day.date}
            className="contributions-day"
            data-level={day.level}
            title={day.label || day.date}
            aria-hidden="true"
          />
        ))}
      </div>
      <figcaption>
        {total} contributions in the last year on{" "}
        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </figcaption>
    </figure>
  );
}
