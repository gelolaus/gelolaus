import { createHash } from "node:crypto";
import { MCP_ENDPOINT } from "@/lib/mcp";
import { SITE_URL } from "@/lib/profile";

export const SKILLS_SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

export type Skill = { name: string; description: string; body: string };

const skillDefs: Skill[] = [
  {
    name: "gelolaus-profile-api",
    description:
      "Look up the public profile, roles, and projects of Angelo Laus (@gelolaus) through the read-only REST API.",
    body: `# gelolaus profile API

Use this when you need facts about Angelo Laus (@gelolaus).

## Endpoints

All endpoints are GET, public, and need no authentication.

- \`${SITE_URL}/api/v1/profile\` returns the full profile. Pass \`?fields=name,email\` to select properties.
- \`${SITE_URL}/api/v1/roles\` lists current roles. Pass \`?organization=Notion\` to filter.
- \`${SITE_URL}/api/v1/projects\` lists projects. Pass \`?year=2026\` to filter.

## Notes

- The OpenAPI document is at \`${SITE_URL}/openapi.json\`.
- Limit: 60 requests per 60 seconds. Read the \`RateLimit\` headers and honor \`Retry-After\`.
- Errors are JSON with a stable \`code\`, a \`message\`, and a \`hint\`.
`,
  },
  {
    name: "gelolaus-mcp",
    description:
      "Connect to the gelolaus.com MCP server for read-only profile, roles, and projects tools.",
    body: `# gelolaus MCP server

Use this when you can call MCP tools and want Angelo Laus's (@gelolaus) public profile.

## Connect

- Transport: Streamable HTTP, stateless, \`POST ${MCP_ENDPOINT}\`
- Authentication: none
- Server card: \`${SITE_URL}/.well-known/mcp/server-card.json\`

## Tools

- \`get_profile\` takes optional \`fields\`.
- \`list_roles\` takes optional \`organization\`.
- \`list_projects\` takes optional \`year\`.

Every tool is read-only.
`,
  },
];

export function renderSkillMd(skill: Skill): string {
  return `---\nname: ${skill.name}\ndescription: ${skill.description}\n---\n\n${skill.body}`;
}

export const skills: Skill[] = skillDefs;

export function findSkill(name: string): Skill | undefined {
  return skills.find((s) => s.name === name);
}

export const skillUrl = (name: string) =>
  `${SITE_URL}/.well-known/agent-skills/${name}/SKILL.md`;

export function sha256Digest(content: string): string {
  return `sha256:${createHash("sha256").update(content, "utf8").digest("hex")}`;
}

/** Agent Skills Discovery RFC v0.2.0 index. */
export function getSkillsIndex() {
  return {
    $schema: SKILLS_SCHEMA,
    skills: skills.map((skill) => ({
      name: skill.name,
      type: "skill-md",
      description: skill.description,
      url: skillUrl(skill.name),
      digest: sha256Digest(renderSkillMd(skill)),
    })),
  };
}
