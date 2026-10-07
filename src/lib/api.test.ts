import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import * as profileRoute from "@/app/api/v1/profile/route";
import * as rolesRoute from "@/app/api/v1/roles/route";
import * as projectsRoute from "@/app/api/v1/projects/route";
import * as catchAll from "@/app/api/[[...path]]/route";
import { RATE_LIMIT, withApi } from "@/lib/api";
import { profile, projects, roles } from "@/lib/profile";

let ipCounter = 0;
function request(path: string, init: { method?: string; ip?: string } = {}) {
  const ip = init.ip ?? `10.0.0.${++ipCounter}`;
  return new NextRequest(`https://gelolaus.com${path}`, {
    method: init.method ?? "GET",
    headers: { "x-forwarded-for": ip },
  });
}

function expectErrorShape(body: unknown, code: string, status: number) {
  expect(body).toEqual({
    error: {
      code,
      status,
      message: expect.any(String),
      hint: expect.any(String),
      documentation_url: "https://gelolaus.com/docs#errors",
    },
  });
}

describe("GET /api/v1/profile", () => {
  it("returns the profile as JSON with rate limit headers", async () => {
    const res = await profileRoute.GET(request("/api/v1/profile"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(res.headers.get("ratelimit-limit")).toBe(String(RATE_LIMIT.limit));
    expect(res.headers.get("ratelimit-remaining")).toBe(
      String(RATE_LIMIT.limit - 1),
    );
    expect(res.headers.get("ratelimit-policy")).toBe(
      `"default";q=${RATE_LIMIT.limit};w=${RATE_LIMIT.windowSeconds}`,
    );
    expect(res.headers.get("ratelimit")).toMatch(/^"default";r=\d+;t=\d+$/);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");

    const body = await res.json();
    expect(body).toMatchObject({
      name: profile.name,
      handle: profile.handle,
      email: profile.email,
      links: profile.links,
      roles,
      projects,
    });
  });
});

describe("GET /api/v1/roles", () => {
  it("lists roles", async () => {
    const res = await rolesRoute.GET(request("/api/v1/roles"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: roles });
  });
});

describe("GET /api/v1/projects", () => {
  it("lists all projects", async () => {
    const res = await projectsRoute.GET(request("/api/v1/projects"));
    expect((await res.json()).data).toEqual(projects);
  });

  it("filters by year, returning an empty list when nothing matches", async () => {
    const hit = await projectsRoute.GET(request("/api/v1/projects?year=2026"));
    expect((await hit.json()).data).toEqual(projects);
    const miss = await projectsRoute.GET(request("/api/v1/projects?year=1999"));
    expect(miss.status).toBe(200);
    expect((await miss.json()).data).toEqual([]);
  });

  it.each(["abc", "26", "2026.5", "", "-2026"])(
    "rejects year=%j with a JSON 400",
    async (year) => {
      const res = await projectsRoute.GET(
        request(`/api/v1/projects?year=${year}`),
      );
      expect(res.status).toBe(400);
      expect(res.headers.get("content-type")).toContain("application/json");
      expectErrorShape(await res.json(), "invalid_parameter", 400);
    },
  );
});

describe("unsupported methods", () => {
  it.each(["POST", "PUT", "PATCH", "DELETE"] as const)(
    "%s returns JSON 405 with an Allow header",
    async (method) => {
      const res = await projectsRoute[method](
        request("/api/v1/projects", { method }),
      );
      expect(res.status).toBe(405);
      expect(res.headers.get("allow")).toBe("GET, HEAD, OPTIONS");
      expectErrorShape(await res.json(), "method_not_allowed", 405);
    },
  );

  it("answers OPTIONS preflight with 204 and CORS headers", async () => {
    const res = await profileRoute.OPTIONS(
      request("/api/v1/profile", { method: "OPTIONS" }),
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-methods")).toContain("GET");
  });
});

describe("/api catch-all", () => {
  it("serves an index at /api", async () => {
    const res = await catchAll.GET(request("/api"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.openapi).toBe("https://gelolaus.com/openapi.json");
    expect(body.endpoints).toContain("https://gelolaus.com/api/v1/profile");
  });

  it("returns a JSON 404 for unknown API paths, for any method", async () => {
    for (const method of ["GET", "POST", "DELETE"] as const) {
      const res = await catchAll[method](
        request("/api/v1/nothing", { method }),
      );
      expect(res.status).toBe(404);
      expect(res.headers.get("content-type")).toContain("application/json");
      expectErrorShape(await res.json(), "not_found", 404);
    }
  });
});

describe("rate limiting", () => {
  it("returns 429 with Retry-After and a JSON body after the limit", async () => {
    const ip = "192.0.2.99";
    let last: Response | undefined;
    for (let i = 0; i <= RATE_LIMIT.limit; i++) {
      last = await profileRoute.GET(request("/api/v1/profile", { ip }));
    }
    expect(last!.status).toBe(429);
    expect(last!.headers.get("retry-after")).toMatch(/^\d+$/);
    expect(last!.headers.get("ratelimit-remaining")).toBe("0");
    expectErrorShape(await last!.json(), "rate_limited", 429);
  });
});

describe("withApi", () => {
  it("converts thrown errors into a JSON 500 without leaking the cause", async () => {
    const handler = withApi(() => {
      throw new Error("boom");
    });
    const res = await handler(request("/api/x"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expectErrorShape(body, "internal_error", 500);
    expect(JSON.stringify(body)).not.toContain("boom");
  });
});
