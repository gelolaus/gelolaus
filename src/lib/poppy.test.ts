import { describe, expect, it } from "vitest";
import { GET } from "@/app/.well-known/poppy.json/route";
import { getPoppyManifest } from "@/lib/poppy";

describe("Poppy manifest", () => {
  const manifest = getPoppyManifest();

  it("declares protocol 0.1 and the site's own domain", () => {
    expect(manifest.protocol_version).toBe("0.1");
    expect(manifest.organization.name).toBe("Angelo Laus");
    expect(manifest.organization.domain).toBe("gelolaus.com");
  });

  it("is website-only: no session interfaces and no auth issuer", () => {
    expect(manifest.web).toEqual({});
    expect(manifest).not.toHaveProperty("agent");
    expect(manifest).not.toHaveProperty("apis");
    expect(manifest).not.toHaveProperty("auth");
  });

  it("is served as JSON", async () => {
    const res = GET();
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(await res.json()).toEqual(manifest);
  });
});
