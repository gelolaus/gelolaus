import { describe, expect, it } from "vitest";
import {
  isFailedCapture,
  mergeResults,
  slugFromUrl,
  trimDescription,
} from "./link-previews-lib.mjs";

describe("slugFromUrl", () => {
  it("builds a lowercase slug from host and path", () => {
    expect(slugFromUrl("https://www.eypi.cc/")).toBe("eypi-cc");
    expect(slugFromUrl("https://stellarph.io/programs/ph100/2026")).toBe(
      "stellarph-io-programs-ph100-2026",
    );
  });
});

describe("isFailedCapture", () => {
  it("fails on HTTP errors, missing status and empty titles", () => {
    expect(isFailedCapture({ status: 404, title: "Not found" })).toBe(true);
    expect(isFailedCapture({ status: null, title: "x" })).toBe(true);
    expect(isFailedCapture({ status: 200, title: "   " })).toBe(true);
  });

  it("passes a normal page", () => {
    expect(isFailedCapture({ status: 200, title: "Eypi" })).toBe(false);
  });
});

describe("trimDescription", () => {
  it("leaves short text alone and collapses whitespace", () => {
    expect(trimDescription("Short\n  text")).toBe("Short text");
  });

  it("cuts long text on a word boundary with an ellipsis", () => {
    const out = trimDescription("word ".repeat(60));
    expect(out.length).toBeLessThanOrEqual(111);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\s…$/);
  });
});

describe("mergeResults", () => {
  const good = { title: "Old", description: "d", domain: "a.com", image: "/a.jpg" };

  it("keeps previous data when a capture failed", () => {
    expect(mergeResults({ "https://a.com": good }, { "https://a.com": null })).toEqual({
      "https://a.com": good,
    });
  });

  it("replaces previous data on success and adds new entries", () => {
    const fresh = { ...good, title: "New" };
    expect(
      mergeResults({ "https://a.com": good }, { "https://a.com": fresh, "https://b.com": fresh }),
    ).toEqual({ "https://a.com": fresh, "https://b.com": fresh });
  });
});
