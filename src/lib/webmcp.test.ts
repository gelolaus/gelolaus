import { describe, expect, it, vi } from "vitest";
import { findModelContext, registerWebMcpTools } from "@/lib/webmcp";

describe("WebMCP registration", () => {
  it("prefers document.modelContext and falls back to navigator", () => {
    const a = { registerTool: vi.fn() };
    const b = { registerTool: vi.fn() };
    expect(findModelContext({ modelContext: a }, { modelContext: b })).toBe(a);
    expect(findModelContext({}, { modelContext: b })).toBe(b);
    expect(findModelContext({}, {})).toBeUndefined();
  });

  it("registers every tool with the abort signal", async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    const { signal } = new AbortController();
    await registerWebMcpTools({ registerTool }, signal);
    expect(registerTool.mock.calls.map(([t]) => t.name)).toEqual([
      "get_profile",
      "list_roles",
      "list_projects",
    ]);
    for (const [tool, options] of registerTool.mock.calls) {
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema.type).toBe("object");
      expect(options.signal).toBe(signal);
    }
  });

  it("executes tools and reports bad arguments as errors", async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    await registerWebMcpTools({ registerTool }, new AbortController().signal);
    const profileTool = registerTool.mock.calls[0][0];
    const ok = await profileTool.execute({ fields: ["name"] });
    expect(JSON.parse(ok.content[0].text)).toEqual({ name: "Angelo Laus" });
    const bad = await profileTool.execute({ fields: ["nope"] });
    expect(bad.isError).toBe(true);
  });
});
