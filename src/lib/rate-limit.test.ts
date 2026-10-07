import { describe, expect, it } from "vitest";
import { createRateLimiter, rateLimitHeaders } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit then blocks", () => {
    const limiter = createRateLimiter({ limit: 2, windowSeconds: 60, now: () => 0 });
    expect(limiter.check("a")).toMatchObject({ allowed: true, remaining: 1 });
    expect(limiter.check("a")).toMatchObject({ allowed: true, remaining: 0 });
    expect(limiter.check("a")).toMatchObject({ allowed: false, remaining: 0 });
  });

  it("tracks clients independently", () => {
    const limiter = createRateLimiter({ limit: 1, windowSeconds: 60, now: () => 0 });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("b").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
  });

  it("resets after the window and reports seconds until reset", () => {
    let time = 0;
    const limiter = createRateLimiter({ limit: 1, windowSeconds: 60, now: () => time });
    expect(limiter.check("a").resetSeconds).toBe(60);
    time = 45_500;
    expect(limiter.check("a")).toMatchObject({ allowed: false, resetSeconds: 15 });
    time = 60_000;
    expect(limiter.check("a")).toMatchObject({ allowed: true, resetSeconds: 60 });
  });
});

describe("rateLimitHeaders", () => {
  it("emits structured-field and legacy headers without Retry-After when allowed", () => {
    const headers = rateLimitHeaders(
      { allowed: true, limit: 60, remaining: 59, resetSeconds: 42 },
      60,
    );
    expect(headers).toEqual({
      "RateLimit-Policy": '"default";q=60;w=60',
      RateLimit: '"default";r=59;t=42',
      "RateLimit-Limit": "60",
      "RateLimit-Remaining": "59",
      "RateLimit-Reset": "42",
    });
  });

  it("adds Retry-After when the request is blocked", () => {
    const headers = rateLimitHeaders(
      { allowed: false, limit: 60, remaining: 0, resetSeconds: 17 },
      60,
    );
    expect(headers["Retry-After"]).toBe("17");
  });
});
