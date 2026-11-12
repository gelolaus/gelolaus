import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/site-footer";

describe("SiteFooter", () => {
  const html = renderToStaticMarkup(<SiteFooter />);

  it("links only to the API docs and llms.txt", () => {
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(["/docs", "/llms.txt"]);
  });

  it("labels the links", () => {
    expect(html).toContain(">API docs<");
    expect(html).toContain(">llms.txt<");
  });
});
