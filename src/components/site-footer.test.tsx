import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/site-footer";

describe("SiteFooter", () => {
  const html = renderToStaticMarkup(<SiteFooter />);

  it("links only to the API docs, llms.txt, and GitHub", () => {
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual([
      "/docs",
      "/llms.txt",
      "https://github.com/gelolaus",
    ]);
  });

  it("labels the links", () => {
    expect(html).toContain(">API docs<");
    expect(html).toContain(">llms.txt<");
    expect(html).toContain(">GitHub<");
  });
});
