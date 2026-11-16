import { describe, expect, it } from "vitest";
import { GET } from "@/app/.well-known/ai-catalog.json/route";
import { getAiCatalog } from "@/lib/ai-catalog";

describe("ARD ai-catalog", () => {
  const catalog = getAiCatalog();

  it("has a spec version, a host, and entries", () => {
    expect(catalog.specVersion).toBeTruthy();
    expect(catalog.host.displayName).toBeTruthy();
    expect(catalog.host.identifier).toBe("did:web:gelolaus.com");
    expect(catalog.entries.length).toBeGreaterThan(0);
  });

  it("gives each entry a urn:air identifier, a name, and a media type", () => {
    const ids = catalog.entries.map((e) => e.identifier);
    expect(new Set(ids).size).toBe(ids.length);
    for (const entry of catalog.entries) {
      expect(entry.identifier).toMatch(/^urn:air:gelolaus\.com:[a-z0-9-]+:[a-z0-9-]+$/);
      expect(entry.displayName).toBeTruthy();
      expect(entry.type).toMatch(/^[a-z]+\/[a-z0-9.+-]+$/);
    }
  });

  it("gives each entry exactly one of url or data", () => {
    for (const entry of catalog.entries as Record<string, unknown>[]) {
      expect(Number("url" in entry) + Number("data" in entry)).toBe(1);
    }
  });

  it("gives each entry 2 to 5 representative queries", () => {
    for (const entry of catalog.entries) {
      expect(entry.representativeQueries.length).toBeGreaterThanOrEqual(2);
      expect(entry.representativeQueries.length).toBeLessThanOrEqual(5);
    }
  });

  it("is served as JSON with open CORS", async () => {
    const res = GET();
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect((await res.json()).specVersion).toBe(catalog.specVersion);
  });
});
