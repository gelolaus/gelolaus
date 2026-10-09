import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import * as profileRoute from "@/app/api/v1/profile/route";
import * as rolesRoute from "@/app/api/v1/roles/route";
import * as projectsRoute from "@/app/api/v1/projects/route";
import * as catchAll from "@/app/api/[[...path]]/route";
import {
  API_VERSION,
  DEPRECATION_NOTICE_DAYS,
  deprecationHeaders,
  RATE_LIMIT,
  readOnlyRoute,
  withApi,
} from "@/lib/api";
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
    expect(res.headers.get("api-version")).toBe(API_VERSION);
    expect(res.headers.get("deprecation")).toBeNull();
    expect(res.headers.get("sunset")).toBeNull();

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

describe("GET /api/v1/profile?fields=", () => {
  it("returns only the selected fields", async () => {
    const res = await profileRoute.GET(
      request("/api/v1/profile?fields=name,email"),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      name: profile.name,
      email: profile.email,
    });
  });

  it("ignores order and surrounding spaces", async () => {
    const res = await profileRoute.GET(
      request("/api/v1/profile?fields=email,%20name"),
    );
    expect(Object.keys(await res.json())).toEqual(["name", "email"]);
  });

  it.each(["nope", "name,nope", ""])(
    "rejects fields=%j with a JSON 400 listing valid fields",
    async (fields) => {
      const res = await profileRoute.GET(
        request(`/api/v1/profile?fields=${fields}`),
      );
      expect(res.status).toBe(400);
      const body = await res.json();
      expectErrorShape(body, "invalid_parameter", 400);
      expect(body.error.hint).toContain("projects");
    },
  );
});

describe("GET /api/v1/roles?organization=", () => {
  it("filters case-insensitively", async () => {
    const res = await rolesRoute.GET(
      request("/api/v1/roles?organization=notion"),
    );
    expect((await res.json()).data).toEqual([roles[0]]);
  });

  it("returns an empty list when nothing matches", async () => {
    const res = await rolesRoute.GET(
      request("/api/v1/roles?organization=Nobody"),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual([]);
  });

  it("rejects an empty organization", async () => {
    const res = await rolesRoute.GET(request("/api/v1/roles?organization="));
    expect(res.status).toBe(400);
    expectErrorShape(await res.json(), "invalid_parameter", 400);
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

describe("versioning and deprecation headers", () => {
  const deprecatedAt = new Date("2026-01-01T00:00:00Z");
  const sunsetAt = new Date("2026-04-01T00:00:00Z");

  it("formats Deprecation as an RFC 9745 date and links the policy", () => {
    const headers = deprecationHeaders({ deprecatedAt });
    expect(headers.Deprecation).toBe("@1767225600");
    expect(headers.Link).toBe(
      '<https://gelolaus.com/docs#versioning-and-deprecation>; rel="deprecation"; type="text/html"',
    );
    expect(headers.Sunset).toBeUndefined();
  });

  it("adds an RFC 8594 Sunset HTTP-date and a sunset link", () => {
    const headers = deprecationHeaders({ deprecatedAt, sunsetAt });
    expect(headers.Sunset).toBe("Wed, 01 Apr 2026 00:00:00 GMT");
    expect(headers.Link).toContain('rel="sunset"');
  });

  it("sends the headers on every response of a deprecated route", async () => {
    const route = readOnlyRoute(() => Response.json({}), {
      deprecation: { deprecatedAt, sunsetAt },
    });
    const ok = await route.GET(request("/api/v1/old"));
    expect(ok.headers.get("deprecation")).toBe("@1767225600");
    expect(ok.headers.get("sunset")).toBe("Wed, 01 Apr 2026 00:00:00 GMT");
    expect(ok.headers.get("api-version")).toBe(API_VERSION);
  });

  it("publishes a notice period of at least 90 days", () => {
    expect(DEPRECATION_NOTICE_DAYS).toBeGreaterThanOrEqual(90);
  });
});
