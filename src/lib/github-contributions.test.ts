import { describe, expect, it } from "vitest";
import { parseContributions } from "@/lib/github-contributions";

// Trimmed copy of the markup github.com/users/<name>/contributions returns.
const html = `
<h2 tabindex="-1" id="js-contribution-activity-description" class="f4 text-normal mb-2">
      2,210
      contributions
        in the last year
    </h2>
<table>
<tr>
<td tabindex="0" data-ix="0" style="width: 10px" data-date="2025-11-16" id="contribution-day-component-0-0" data-level="0" role="gridcell" class="ContributionCalendar-day"></td>
<td tabindex="0" data-ix="1" style="width: 10px" data-date="2025-11-23" id="contribution-day-component-0-1" data-level="1" role="gridcell" class="ContributionCalendar-day"></td>
</tr>
<tr>
<td tabindex="0" data-ix="0" style="width: 10px" data-date="2025-11-17" id="contribution-day-component-1-0" data-level="4" role="gridcell" class="ContributionCalendar-day"></td>
</tr>
</table>
<tool-tip id="tooltip-a" for="contribution-day-component-0-0" popover="manual" class="sr-only position-absolute">No contributions on November 16th.</tool-tip>
<tool-tip id="tooltip-b" for="contribution-day-component-0-1" popover="manual" class="sr-only position-absolute">6 contributions on November 23rd.</tool-tip>
<tool-tip id="tooltip-c" for="contribution-day-component-1-0" popover="manual" class="sr-only position-absolute">1 contribution on November 17th.</tool-tip>
`;

describe("parseContributions", () => {
  const result = parseContributions(html);

  it("reads the yearly total", () => {
    expect(result?.total).toBe(2210);
  });

  it("returns every day sorted by date with level, count and label", () => {
    expect(result?.days).toEqual([
      { date: "2025-11-16", level: 0, count: 0, label: "No contributions on November 16th." },
      { date: "2025-11-17", level: 4, count: 1, label: "1 contribution on November 17th." },
      { date: "2025-11-23", level: 1, count: 6, label: "6 contributions on November 23rd." },
    ]);
  });

  it("returns null when the markup has no calendar", () => {
    expect(parseContributions("<html>rate limited</html>")).toBeNull();
  });
});
