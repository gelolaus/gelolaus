import { describe, expect, it } from "vitest";
import { getStaticPage, getStaticPages } from "@/lib/pages";
import { renderMarkdown } from "@/lib/render";
import { profile } from "@/lib/profile";

function visibleText(path: string): string {
  const html = renderMarkdown(getStaticPage(path)!.body);
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

describe("trust anchor pages", () => {
  it.each(["/about", "/contact", "/privacy"])(
    "%s has at least 500 characters of real content",
    (path) => {
      expect(visibleText(path).length).toBeGreaterThanOrEqual(500);
    },
  );

  it("contact page gives the real email address", () => {
    expect(getStaticPage("/contact")!.body).toContain(profile.email);
  });

  it("privacy page is dated and has a way to reach the owner", () => {
    const body = getStaticPage("/privacy")!.body;
    expect(body).toMatch(/Last updated: \w+ \d{1,2}, \d{4}/);
    expect(body).toContain(profile.email);
  });
});

describe("static pages", () => {
  it("have unique paths, a title containing gelolaus, and a description", () => {
    const pages = getStaticPages();
    expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length);
    for (const page of pages) {
      expect(page.title.toLowerCase()).toContain("gelolaus");
      expect(page.description.length).toBeGreaterThan(20);
    }
  });
});

describe("API documentation page", () => {
  const body = getStaticPage("/docs")!.body;

  it("covers authentication, endpoints, example requests, rate limits, and errors", () => {
    for (const heading of ["## Authentication", "## Endpoints", "## Rate limits", "## Errors"]) {
      expect(body).toContain(heading);
    }
    expect(body).toContain("curl -sS https://gelolaus.com/api/v1/profile");
    for (const id of ["getProfile", "listRoles", "listProjects"]) {
      expect(body).toContain(id);
    }
    expect(body).toContain("Retry-After");
    expect(body).toContain("RateLimit-Policy");
  });

  it("documents versioning, deprecation, and the new query parameters", () => {
    expect(body).toContain("## Versioning and deprecation");
    for (const term of ["API-Version", "Deprecation", "Sunset", "RFC 9745", "RFC 8594", "/api/v2"]) {
      expect(body).toContain(term);
    }
    expect(body).toContain("fields=name,email");
    expect(body).toContain("organization=Notion");
    expect(renderMarkdown(body)).toContain('id="versioning-and-deprecation"');
  });

  it("renders an anchor for #errors", () => {
    expect(renderMarkdown(body)).toContain('id="errors"');
  });
});
