import { profile } from "@/lib/profile";

export type ContributionDay = {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  count: number;
  label: string;
};

export type Contributions = {
  total: number;
  days: ContributionDay[];
};

const CELL = /<td\b[^>]*\bContributionCalendar-day\b[^>]*>/g;
const TOOLTIP = /<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g;
const TOTAL = /id="js-contribution-activity-description"[^>]*>\s*([\d,]+)/;

function attr(tag: string, name: string) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

/** Parses the public HTML calendar GitHub serves for a user's profile. */
export function parseContributions(html: string): Contributions | null {
  const labels = new Map<string, string>();
  for (const [, id, text] of html.matchAll(TOOLTIP)) {
    labels.set(id, text.trim());
  }

  const days: ContributionDay[] = [];
  for (const [tag] of html.matchAll(CELL)) {
    const date = attr(tag, "data-date");
    const level = Number(attr(tag, "data-level"));
    if (!date || !(level >= 0 && level <= 4)) continue;
    const label = labels.get(attr(tag, "id") ?? "") ?? "";
    const count = Number(label.match(/^(\d[\d,]*) contribution/)?.[1].replace(/,/g, "") ?? 0);
    days.push({ date, level: level as ContributionDay["level"], count, label });
  }

  if (days.length === 0) return null;
  days.sort((a, b) => a.date.localeCompare(b.date));

  const totalText = html.match(TOTAL)?.[1];
  const total = totalText
    ? Number(totalText.replace(/,/g, ""))
    : days.reduce((sum, d) => sum + d.count, 0);

  return { total, days };
}

/** Fetches the last year of contributions, refreshed at most once a day. */
export async function getContributions(
  username: string = profile.handle,
): Promise<Contributions | null> {
  try {
    const res = await fetch(`https://github.com/users/${username}/contributions`, {
      next: { revalidate: 86_400 },
    });
    if (!res.ok) return null;
    return parseContributions(await res.text());
  } catch {
    return null;
  }
}
