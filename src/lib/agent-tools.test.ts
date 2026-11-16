import { describe, expect, it } from "vitest";
import { agentTools, findAgentTool, ToolArgumentError } from "@/lib/agent-tools";

describe("agent tools", () => {
  it("exposes uniquely named, described tools", () => {
    const names = agentTools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
    for (const tool of agentTools) {
      expect(tool.name).toMatch(/^[a-z][a-z0-9_]*$/);
      expect(tool.description.length).toBeGreaterThan(20);
      expect(tool.inputSchema.type).toBe("object");
    }
  });

  it("returns the full profile without arguments", () => {
    const result = findAgentTool("get_profile")!.run({}) as { name: string };
    expect(result.name).toBe("Angelo Laus");
  });

  it("filters the profile by fields", () => {
    const result = findAgentTool("get_profile")!.run({ fields: ["name"] });
    expect(result).toEqual({ name: "Angelo Laus" });
  });

  it("rejects unknown profile fields", () => {
    expect(() => findAgentTool("get_profile")!.run({ fields: ["ssn"] })).toThrow(
      ToolArgumentError,
    );
  });

  it("filters roles by organization", () => {
    const result = findAgentTool("list_roles")!.run({ organization: "notion" }) as {
      data: unknown[];
    };
    expect(result.data).toHaveLength(1);
    expect(() => findAgentTool("list_roles")!.run({ organization: " " })).toThrow(
      ToolArgumentError,
    );
  });

  it("filters projects by year and rejects bad years", () => {
    const result = findAgentTool("list_projects")!.run({ year: 2026 }) as {
      data: unknown[];
    };
    expect(result.data.length).toBeGreaterThan(0);
    expect(() => findAgentTool("list_projects")!.run({ year: "2026" })).toThrow(
      ToolArgumentError,
    );
  });
});
