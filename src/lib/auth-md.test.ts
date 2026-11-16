import { describe, expect, it } from "vitest";
import { GET } from "@/app/auth.md/route";
import { renderAuthMd } from "@/lib/auth-md";

describe("auth.md", () => {
  it("starts with an H1 that names auth.md", () => {
    expect(renderAuthMd().split("\n")[0]).toMatch(/^# .*auth\.md/);
  });

  it("states that no registration is needed and links the metadata", () => {
    const md = renderAuthMd();
    expect(md).toContain("None. There is no registration endpoint");
    expect(md).toContain("/.well-known/oauth-protected-resource");
    expect(md).toContain("/.well-known/oauth-authorization-server");
  });

  it("is served as Markdown", async () => {
    const res = GET();
    expect(res.headers.get("content-type")).toContain("text/markdown");
    expect(await res.text()).toBe(renderAuthMd());
  });
});
