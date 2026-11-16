import { describe, expect, it } from "vitest";
import { discoveryJson, discoveryText } from "@/lib/discovery";

describe("discovery responses", () => {
  it("serves JSON with open CORS and caching", async () => {
    const res = discoveryJson({ ok: true });
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(res.headers.get("cache-control")).toContain("max-age");
    expect(await res.json()).toEqual({ ok: true });
  });

  it("accepts a custom JSON media type", () => {
    const res = discoveryJson({}, "application/linkset+json");
    expect(res.headers.get("content-type")).toBe("application/linkset+json");
  });

  it("serves text with the given media type", async () => {
    const res = discoveryText("# hi", "text/markdown; charset=utf-8");
    expect(res.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(await res.text()).toBe("# hi");
  });
});
