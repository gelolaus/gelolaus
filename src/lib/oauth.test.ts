import { describe, expect, it } from "vitest";
import { GET as authServer } from "@/app/.well-known/oauth-authorization-server/route";
import { GET as protectedResource } from "@/app/.well-known/oauth-protected-resource/route";
import {
  getAuthorizationServerMetadata,
  getProtectedResourceMetadata,
} from "@/lib/oauth";

describe("OAuth discovery metadata", () => {
  const prm = getProtectedResourceMetadata();
  const as = getAuthorizationServerMetadata();

  it("points the resource at the issuer that serves its metadata", () => {
    expect(prm.resource).toBe("https://gelolaus.com/api/v1");
    expect(prm.authorization_servers).toContain(as.issuer);
    expect(prm.bearer_methods_supported).toContain("header");
  });

  it("does not advertise endpoints that do not exist", () => {
    expect(as.grant_types_supported).toEqual([]);
    expect(as).not.toHaveProperty("token_endpoint");
    expect(as).not.toHaveProperty("authorization_endpoint");
  });

  it("links the auth.md skill", () => {
    expect(as.agent_auth.skill).toBe("https://gelolaus.com/auth.md");
  });

  it("serves both documents as open JSON", async () => {
    for (const GET of [authServer, protectedResource]) {
      const res = GET();
      expect(res.headers.get("access-control-allow-origin")).toBe("*");
      expect(res.headers.get("content-type")).toContain("application/json");
    }
  });
});
