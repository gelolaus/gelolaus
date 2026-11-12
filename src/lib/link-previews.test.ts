import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import generated from "@/lib/link-previews.generated.json";
import { getPreview, normalizeUrl, type LinkPreview } from "@/lib/link-previews";
import { profile, previewOverrides } from "@/lib/profile";

const full: LinkPreview = {
  title: "Eypi",
  description: "Campus suite.",
  domain: "eypi.cc",
  image: "/images/link-previews/eypi-cc.jpg",
};

describe("normalizeUrl", () => {
  it("ignores www, case, trailing slash and hash", () => {
    expect(normalizeUrl("https://www.Sipnscale.com/")).toBe(
      normalizeUrl("https://sipnscale.com"),
    );
    expect(normalizeUrl("https://eypi.cc/#top")).toBe(
      normalizeUrl("https://eypi.cc"),
    );
  });
});

describe("getPreview", () => {
  it("returns null for unknown URLs and for the social links", () => {
    expect(getPreview("https://example.com")).toBeNull();
    expect(getPreview(profile.links.instagram)).toBeNull();
  });

  it("serves the JPCS-APC override", () => {
    expect(getPreview("https://instagram.com/jpcs.apc")).toEqual({
      title: "JPCS-APC",
      description: "APC's student tech org, where I'm VP for External Affairs.",
      domain: "instagram.com/jpcs.apc",
      image: "/images/link-previews/jpcs-apc.jpg",
    });
  });

  it("matches generated data despite trailing slash and www", () => {
    const data = { "https://eypi.cc": full };
    expect(getPreview("https://www.eypi.cc/", data, {})).toEqual(full);
  });

  it("lets an override beat generated data, merging partial fields", () => {
    const data = { "https://eypi.cc": full };
    const overrides = { "https://eypi.cc": { title: "Eypi (override)" } };
    expect(getPreview("https://eypi.cc", data, overrides)).toEqual({
      ...full,
      title: "Eypi (override)",
    });
  });

  it("returns null when title or image is missing", () => {
    const noTitle = { "https://a.com": { ...full, title: "" } };
    const noImage = { "https://b.com": { ...full, image: "" } };
    expect(getPreview("https://a.com", noTitle, {})).toBeNull();
    expect(getPreview("https://b.com", noImage, {})).toBeNull();
  });

  it("defaults the domain to the host without www", () => {
    const data = { "https://www.eypi.cc": { ...full, domain: "" } };
    expect(getPreview("https://eypi.cc", data, {})?.domain).toBe("eypi.cc");
  });
});

describe("preview images", () => {
  it("exist on disk for generated data and overrides", () => {
    const images = [
      ...Object.values(generated as Record<string, LinkPreview>),
      ...Object.values(previewOverrides),
    ]
      .map((p) => p.image)
      .filter((i): i is string => Boolean(i));
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(fs.existsSync(path.join(process.cwd(), "public", image)), image).toBe(
        true,
      );
    }
  });
});
