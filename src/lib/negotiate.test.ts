import { describe, expect, it } from "vitest";
import { isNegotiablePath, prefersMarkdown } from "@/lib/negotiate";

describe("prefersMarkdown", () => {
  it.each([
    ["text/markdown", true],
    ["text/markdown, text/html;q=0.9", true],
    ["text/markdown, */*;q=0.1", true],
    ["application/json, text/markdown", true],
    ["TEXT/Markdown", true],
    ["text/markdown;q=0.5, text/html;q=0.9", false],
    ["text/markdown;q=0", false],
    ["text/html", false],
    ["text/html, text/markdown", false],
    ["*/*", false],
    ["text/*", false],
    [
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8",
      false,
    ],
    ["", false],
    [null, false],
    [undefined, false],
  ])("Accept %j -> %s", (accept, expected) => {
    expect(prefersMarkdown(accept)).toBe(expected);
  });

  it("treats a malformed q value as not acceptable", () => {
    expect(prefersMarkdown("text/markdown;q=abc")).toBe(false);
  });
});

describe("isNegotiablePath", () => {
  it.each([
    ["/", true],
    ["/about", true],
    ["/journal/hello-world", true],
    ["/does-not-exist", true],
    ["/api", false],
    ["/api/v1/profile", false],
    ["/md/about", false],
    ["/_next/static/chunk.js", false],
    ["/.well-known/api-catalog", false],
    ["/openapi.json", false],
    ["/llms.txt", false],
    ["/sitemap.xml", false],
    ["/avatar.png", false],
    ["/apiary", true],
  ])("%s -> %s", (pathname, expected) => {
    expect(isNegotiablePath(pathname)).toBe(expected);
  });
});
