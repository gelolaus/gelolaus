import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContributionGraph } from "@/components/contribution-graph";

describe("ContributionGraph", () => {
  // 2025-11-18 is a Tuesday, so two empty cells pad the first week.
  const html = renderToStaticMarkup(
    <ContributionGraph
      profileUrl="https://github.com/gelolaus"
      data={{
        total: 2210,
        days: [
          { date: "2025-11-18", level: 0, count: 0, label: "No contributions on November 18th." },
          { date: "2025-11-19", level: 3, count: 9, label: "9 contributions on November 19th." },
        ],
      }}
    />,
  );

  it("pads the first week so days line up with weekdays", () => {
    expect(html.match(/<span aria-hidden="true"><\/span>/g)).toHaveLength(2);
  });

  it("renders one cell per day with its level and label", () => {
    expect(html).toContain('data-level="3" title="9 contributions on November 19th."');
    expect(html.match(/contributions-day/g)).toHaveLength(2);
  });

  it("summarises the total and links to GitHub", () => {
    expect(html).toContain("2,210 contributions in the last year on");
    expect(html).toContain('href="https://github.com/gelolaus"');
    expect(html).toContain("--weeks:1");
  });
});
