import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { GET as apiCatalog } from "@/app/.well-known/api-catalog/route";
import { GET as llms } from "@/app/llms.txt/route";
import { GET as markdownRoute } from "@/app/md/[[...path]]/route";
import { proxy } from "@/proxy";
import { getAllPosts } from "@/lib/blog";
import { getMarkdownForPath, renderLlmsTxt } from "@/lib/markdown";
import { getStaticPages } from "@/lib/pages";
import { profile, projects, roles } from "@/lib/profile";
import { renderMarkdown } from "@/lib/render";

function req(path: string, accept?: string, method = "GET") {
  return new NextRequest(`https://gelolaus.com${path}`, {
    method,
    headers: accept ? { accept } : {},
  });
}

async function viaMd(path: string[] = []) {
  return markdownRoute(req(`/md/${path.join("/")}`), {
    params: Promise.resolve({ path }),
  });
}

describe("proxy (Markdown negotiation)", () => {
  it("rewrites the homepage to Markdown when Accept: text/markdown", () => {
    const res = proxy(req("/", "text/markdown"));
    expect(res.headers.get("x-middleware-rewrite")).toBe("https://gelolaus.com/md");
    expect(res.headers.get("vary")).toContain("Accept");
  });

  it("rewrites nested and unknown page paths", () => {
    expect(
      proxy(req("/about", "text/markdown")).headers.get("x-middleware-rewrite"),
    ).toBe("https://gelolaus.com/md/about");
    expect(
      proxy(req("/nope", "text/markdown")).headers.get("x-middleware-rewrite"),
    ).toBe("https://gelolaus.com/md/nope");
  });

  it("keeps HTML for browsers and text/html, and adds Vary: Accept", () => {
    for (const accept of ["text/html", "text/html,application/xhtml+xml,*/*;q=0.8", undefined]) {
      const res = proxy(req("/", accept));
      expect(res.headers.get("x-middleware-rewrite")).toBeNull();
      expect(res.headers.get("vary")).toContain("Accept");
    }
  });

  it("leaves APIs, files, and non-GET requests alone", () => {
    for (const path of ["/api/v1/profile", "/openapi.json", "/llms.txt"]) {
      const res = proxy(req(path, "text/markdown"));
      expect(res.headers.get("x-middleware-rewrite")).toBeNull();
      expect(res.headers.get("vary")).toBeNull();
    }
    const post = proxy(req("/", "text/markdown", "POST"));
    expect(post.headers.get("x-middleware-rewrite")).toBeNull();
  });
});

describe("/md route", () => {
  it("serves the homepage as Markdown with the right headers", async () => {
    const res = await viaMd();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/markdown");
    expect(res.headers.get("vary")).toBe("Accept");
    const body = await res.text();
    expect(body.startsWith(`# ${profile.name}`)).toBe(true);
    expect(body).toContain(profile.intro);
    for (const role of roles) expect(body).toContain(role.organization);
    for (const project of projects) expect(body).toContain(project.name);
    expect(body).toContain(profile.email);
  });

  it("links only to the API docs and llms.txt, like the homepage footer", async () => {
    const body = await (await viaMd()).text();
    const more = body.slice(body.indexOf("## More"));
    expect([...more.matchAll(/\]\((https:[^)]+)\)/g)].map((m) => m[1])).toEqual([
      "https://gelolaus.com/docs",
      "https://gelolaus.com/llms.txt",
    ]);
  });

  it("serves every static page as Markdown", async () => {
    for (const page of getStaticPages()) {
      const res = await viaMd(page.path.slice(1).split("/"));
      expect(res.status, page.path).toBe(200);
      expect(await res.text()).toContain(`# ${page.heading}`);
    }
  });

  it("serves the journal index and posts, matching their HTML sources", async () => {
    const posts = getAllPosts();
    const index = await (await viaMd(["journal"])).text();
    for (const post of posts) expect(index).toContain(post.title);

    const post = await viaMd(["journal", posts[0].slug]);
    expect(post.status).toBe(200);
    expect(await post.text()).toContain(`# ${posts[0].title}`);
  });

  it("returns a 404 with a Markdown body that links to llms.txt, sitemap, and docs", async () => {
    const res = await viaMd(["__ora-404-probe-5qm9xq31"]);
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("text/markdown");
    expect(res.headers.get("vary")).toBe("Accept");
    const body = await res.text();
    expect(body.length).toBeGreaterThan(20);
    expect(body).toContain("/__ora-404-probe-5qm9xq31");
    expect(body).toContain("https://gelolaus.com/llms.txt");
    expect(body).toContain("https://gelolaus.com/sitemap.xml");
    expect(body).toContain("https://gelolaus.com/docs");
  });

  it("returns 404 for an unknown journal slug", () => {
    expect(getMarkdownForPath("/journal/does-not-exist").status).toBe(404);
  });

  it("ignores a trailing slash", () => {
    expect(getMarkdownForPath("/about/").status).toBe(200);
  });
});

describe("llms.txt", () => {
  it("is served as plain text", async () => {
    const res = llms();
    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(await res.text()).toBe(renderLlmsTxt());
  });

  it("follows the llmstxt.org layout", () => {
    const lines = renderLlmsTxt().split("\n");
    expect(lines[0]).toBe("# gelolaus");
    expect(lines[2].startsWith("> ")).toBe(true);
    expect(renderLlmsTxt()).toMatch(/^## .+$/m);
    for (const match of renderLlmsTxt().matchAll(/^- \[[^\]]+\]\((https:[^)]+)\)/gm)) {
      expect(() => new URL(match[1])).not.toThrow();
    }
  });

  it("has specific when-to-use guidance and how to call the API", () => {
    const text = renderLlmsTxt();
    expect(text).toContain("## When to use this site");
    expect(text).toContain("/api/v1/profile");
    expect(text).toContain("/api/v1/roles");
    expect(text).toContain("/api/v1/projects");
    expect(text).toContain("## How to call it");
    expect(text).toContain("/openapi.json");
  });

  it("lists every static page it describes", () => {
    const text = renderLlmsTxt();
    for (const page of getStaticPages()) {
      if (page.path === "/docs") continue;
      expect(text).toContain(`https://gelolaus.com${page.path}`);
    }
    expect(text).toContain("https://gelolaus.com/docs");
  });

  it("does not advertise the unlisted journal", () => {
    expect(renderLlmsTxt()).not.toContain("/journal");
  });
});

describe("api-catalog", () => {
  it("is an RFC 9727 linkset pointing at the spec and docs", async () => {
    const res = apiCatalog();
    expect(res.headers.get("content-type")).toContain("application/linkset+json");
    const body = await res.json();
    const entry = body.linkset[0];
    expect(entry.anchor).toBe("https://gelolaus.com/api/v1");
    expect(entry["service-desc"][0].href).toBe("https://gelolaus.com/openapi.json");
    expect(entry["service-doc"][0].href).toBe("https://gelolaus.com/docs");
  });
});

describe("renderMarkdown", () => {
  it("adds ids to headings so /docs#errors resolves", () => {
    expect(renderMarkdown("## Errors\n")).toContain('<h2 id="errors">Errors</h2>');
  });
});
