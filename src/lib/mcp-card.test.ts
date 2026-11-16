import { describe, expect, it } from "vitest";
import { GET } from "@/app/.well-known/mcp/server-card.json/route";
import { getMcpServerCard } from "@/lib/mcp-card";

describe("MCP server card", () => {
  it("names the server and its transport endpoint", () => {
    const card = getMcpServerCard();
    expect(card.serverInfo.name).toBe("gelolaus");
    expect(card.serverInfo.version).toBeTruthy();
    expect(card.transport.endpoint).toBe("https://gelolaus.com/mcp");
    expect(card.capabilities.tools).toBeDefined();
  });

  it("lists the same tools the server exposes", () => {
    expect(getMcpServerCard().tools.map((t) => t.name)).toEqual([
      "get_profile",
      "list_roles",
      "list_projects",
    ]);
  });

  it("is served as open JSON", async () => {
    const res = GET();
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect((await res.json()).serverInfo.name).toBe("gelolaus");
  });
});
