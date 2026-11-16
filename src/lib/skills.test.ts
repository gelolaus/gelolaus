import { describe, expect, it } from "vitest";
import {
  findSkill,
  getSkillsIndex,
  renderSkillMd,
  sha256Digest,
  SKILLS_SCHEMA,
} from "@/lib/skills";

describe("agent skills index", () => {
  const index = getSkillsIndex();

  it("declares the discovery schema", () => {
    expect(index.$schema).toBe(SKILLS_SCHEMA);
  });

  it("describes every skill with the required fields", () => {
    expect(index.skills.length).toBeGreaterThan(0);
    for (const entry of index.skills) {
      expect(entry.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(entry.type).toBe("skill-md");
      expect(entry.description.length).toBeGreaterThan(10);
      expect(entry.url).toBe(
        `https://gelolaus.com/.well-known/agent-skills/${entry.name}/SKILL.md`,
      );
      expect(entry.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  it("digests exactly the bytes the skill route serves", () => {
    for (const entry of index.skills) {
      const skill = findSkill(entry.name)!;
      expect(entry.digest).toBe(sha256Digest(renderSkillMd(skill)));
    }
  });

  it("writes frontmatter that matches the index entry", () => {
    for (const entry of index.skills) {
      const md = renderSkillMd(findSkill(entry.name)!);
      expect(md.startsWith(`---\nname: ${entry.name}\n`)).toBe(true);
    }
  });
});
