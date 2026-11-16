/* eslint-disable @typescript-eslint/no-explicit-any -- JSON-RPC replies are inspected loosely in tests */
import { describe, expect, it } from "vitest";
import { handleMcpMessage, MCP_PROTOCOL_VERSION } from "@/lib/mcp";

const rpc = (method: string, params?: object, id: number | null = 1) =>
  handleMcpMessage({ jsonrpc: "2.0", id, method, params });

describe("MCP handler", () => {
  it("answers initialize with tools capability and server info", () => {
    const res = rpc("initialize") as { result: Record<string, any> };
    expect(res.result.protocolVersion).toBe(MCP_PROTOCOL_VERSION);
    expect(res.result.capabilities.tools).toBeDefined();
    expect(res.result.serverInfo.name).toBe("gelolaus");
  });

  it("lists every tool as read-only", () => {
    const res = rpc("tools/list") as { result: { tools: any[] } };
    expect(res.result.tools.map((t) => t.name)).toEqual([
      "get_profile",
      "list_roles",
      "list_projects",
    ]);
    for (const tool of res.result.tools) {
      expect(tool.annotations.readOnlyHint).toBe(true);
    }
  });

  it("calls a tool and returns text plus structured content", () => {
    const res = rpc("tools/call", {
      name: "get_profile",
      arguments: { fields: ["name"] },
    }) as { result: Record<string, any> };
    expect(res.result.structuredContent).toEqual({ name: "Angelo Laus" });
    expect(JSON.parse(res.result.content[0].text)).toEqual({ name: "Angelo Laus" });
  });

  it("reports bad tool arguments as a tool error", () => {
    const res = rpc("tools/call", {
      name: "list_projects",
      arguments: { year: "x" },
    }) as { result: Record<string, any> };
    expect(res.result.isError).toBe(true);
  });

  it("rejects unknown tools and methods", () => {
    expect((rpc("tools/call", { name: "nope" }) as any).error.code).toBe(-32602);
    expect((rpc("resources/list") as any).error.code).toBe(-32601);
  });

  it("returns nothing for notifications", () => {
    expect(
      handleMcpMessage({ jsonrpc: "2.0", method: "notifications/initialized" }),
    ).toBeNull();
  });

  it("rejects malformed messages", () => {
    expect((handleMcpMessage("x") as any).error.code).toBe(-32600);
    expect((handleMcpMessage({ id: 1, method: "ping" }) as any).error.code).toBe(-32600);
  });
});
