import { describe, expect, it } from "vitest";
import { GET } from "@/app/openapi.json/route";
import { getOpenApiSpec } from "@/lib/openapi";

type Operation = {
  operationId?: string;
  summary?: string;
  description?: string;
  responses?: Record<string, unknown>;
  parameters?: { name: string; description?: string; schema?: { type?: string } }[];
};

const spec = getOpenApiSpec();
const operations = Object.entries(spec.paths).flatMap(([path, item]) =>
  Object.entries(item).map(([method, op]) => ({
    path,
    method,
    op: op as Operation,
  })),
);

function resolve(ref: string): unknown {
  return ref
    .replace(/^#\//, "")
    .split("/")
    .reduce<unknown>(
      (node, key) => (node as Record<string, unknown> | undefined)?.[key],
      spec,
    );
}

function collectRefs(node: unknown, found: string[] = []): string[] {
  if (Array.isArray(node)) node.forEach((n) => collectRefs(n, found));
  else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "$ref" && typeof value === "string") found.push(value);
      else collectRefs(value, found);
    }
  }
  return found;
}

describe("OpenAPI document", () => {
  it("is served as JSON at /openapi.json", async () => {
    const res = GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = await res.json();
    expect(body.openapi).toBe("3.1.0");
    expect(body.paths["/api/v1/profile"]).toBeDefined();
  });

  it("declares required top-level fields", () => {
    expect(spec.info.title).toBeTruthy();
    expect(spec.info.version).toBeTruthy();
    expect(spec.servers[0].url).toBe("https://gelolaus.com");
  });

  it("gives every operation a unique operationId, summary, and description", () => {
    const ids = operations.map(({ op }) => op.operationId);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { op } of operations) {
      expect(op.summary).toBeTruthy();
      expect(op.description!.length).toBeGreaterThan(20);
    }
  });

  it("uses function-calling friendly operationIds", () => {
    for (const { op } of operations) {
      expect(op.operationId).toMatch(/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/);
    }
  });

  it("types and describes every parameter and defines success and error responses", () => {
    for (const { op } of operations) {
      for (const param of op.parameters ?? []) {
        expect(param.schema?.type).toBeTruthy();
        expect(param.description).toBeTruthy();
      }
      expect(Object.keys(op.responses!)).toEqual(
        expect.arrayContaining(["200", "429", "500"]),
      );
    }
  });

  it("gives every operation at least one typed, described parameter", () => {
    for (const { op } of operations) {
      expect(op.parameters?.length ?? 0, op.operationId).toBeGreaterThan(0);
    }
  });

  it("types every 4xx, 5xx, and default response with the Error schema", () => {
    for (const { op } of operations) {
      const failures = Object.entries(op.responses!).filter(
        ([code]) => code === "default" || /^[45]/.test(code),
      );
      expect(failures.length).toBeGreaterThanOrEqual(3);
      for (const [code, res] of failures) {
        const media = (res as { content?: Record<string, { schema?: unknown }> })
          .content?.["application/json"];
        expect(media?.schema, `${op.operationId} ${code}`).toEqual({
          $ref: "#/components/schemas/Error",
        });
      }
    }
  });

  it("lets every operation return a 400 for bad parameters", () => {
    for (const { op } of operations) {
      expect(Object.keys(op.responses!)).toContain("400");
    }
  });

  it("documents the API-Version header on success responses", () => {
    for (const { op } of operations) {
      const ok = op.responses!["200"] as { headers: Record<string, unknown> };
      expect(ok.headers["API-Version"]).toBeDefined();
    }
  });

  it("declares URL versioning and links the deprecation policy", () => {
    expect(spec.info.version).toMatch(/^1\./);
    expect(spec.info.description).toMatch(/Deprecation and Sunset/);
    expect(spec.externalDocs.url).toContain("#versioning-and-deprecation");
    for (const path of Object.keys(spec.paths)) {
      expect(path.startsWith("/api/v1/")).toBe(true);
    }
  });

  it("documents exactly the implemented endpoints", () => {
    expect(Object.keys(spec.paths).sort()).toEqual([
      "/api/v1/profile",
      "/api/v1/projects",
      "/api/v1/roles",
    ]);
  });

  it("resolves every $ref", () => {
    const refs = collectRefs(spec);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(resolve(ref), ref).toBeDefined();
  });
});
