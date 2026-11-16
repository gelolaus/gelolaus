import { describe, expect, it } from "vitest";
import { renderRobotsTxt } from "@/lib/robots";

describe("robots.txt", () => {
  const txt = renderRobotsTxt();

  it("allows everyone by default", () => {
    expect(txt).toMatch(/User-Agent: \*\nAllow: \//);
  });

  it("keeps blocking AI training crawlers", () => {
    expect(txt).toMatch(/User-Agent: GPTBot\nDisallow: \//);
    expect(txt).toMatch(/User-Agent: ClaudeBot\nDisallow: \//);
  });

  it("declares content signals for all crawlers", () => {
    expect(txt).toContain(
      "User-Agent: *\nContent-Signal: ai-train=no, search=yes, ai-input=no\nAllow: /",
    );
  });

  it("points to the sitemap", () => {
    expect(txt).toContain("Sitemap: https://gelolaus.com/sitemap.xml");
  });
});
