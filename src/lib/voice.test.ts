import { describe, expect, it } from "vitest";
import { getAllPosts } from "@/lib/blog";
import { getMarkdownForPath, renderLlmsTxt } from "@/lib/markdown";
import { getOpenApiSpec } from "@/lib/openapi";
import { getStaticPages } from "@/lib/pages";
import { getProfilePayload } from "@/lib/profile";

// This is a personal website: visible copy speaks as "I", never about "he".
const THIRD_PERSON = /\b(he|him|his|himself|he's)\b|\bAngelo( Laus)? (is|has|was|works|runs|built)\b/i;

function strings(node: unknown, found: string[] = []): string[] {
  if (typeof node === "string") found.push(node);
  else if (Array.isArray(node)) node.forEach((n) => strings(n, found));
  else if (node && typeof node === "object") {
    Object.values(node).forEach((v) => strings(v, found));
  }
  return found;
}

function expectFirstPerson(label: string, text: string) {
  const match = text.match(THIRD_PERSON);
  expect(match, `${label}: "${match?.[0]}"`).toBeNull();
}

describe("first-person voice", () => {
  it("static pages and their descriptions", () => {
    for (const page of getStaticPages()) {
      expectFirstPerson(`${page.path} body`, page.body);
      expectFirstPerson(`${page.path} description`, page.description);
    }
  });

  it("llms.txt", () => {
    expectFirstPerson("llms.txt", renderLlmsTxt());
  });

  it("OpenAPI descriptions", () => {
    for (const text of strings(getOpenApiSpec())) {
      expectFirstPerson("openapi", text);
    }
  });

  it("API payload and Markdown homepage", () => {
    for (const text of strings(getProfilePayload())) {
      expectFirstPerson("profile payload", text);
    }
    expectFirstPerson("home markdown", getMarkdownForPath("/").body);
  });

  it("detects third-person copy (guard against a vacuous test)", () => {
    expect("He built Wantap.").toMatch(THIRD_PERSON);
    expect("Angelo Laus has built Wantap.").toMatch(THIRD_PERSON);
    expect("Hello, I built Wantap.").not.toMatch(THIRD_PERSON);
  });

  it("covers the journal index too", () => {
    expect(getAllPosts().length).toBeGreaterThan(0);
    expectFirstPerson("journal", getMarkdownForPath("/journal").body);
  });
});
