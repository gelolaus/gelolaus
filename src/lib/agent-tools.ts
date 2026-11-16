import {
  getProfilePayload,
  getProjectsPayload,
  getRolesPayload,
  isProfileField,
  PROFILE_FIELDS,
} from "@/lib/profile";

/** A read-only tool shared by the MCP server and the WebMCP page tools. */
export type AgentTool = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, object>;
    additionalProperties: false;
  };
  run: (args: Record<string, unknown>) => unknown;
};

export class ToolArgumentError extends Error {}

export const agentTools: AgentTool[] = [
  {
    name: "get_profile",
    description:
      "Get Angelo Laus's (@gelolaus) public profile: name, handle, summary, location, contact email, social links, roles, and projects. Pass `fields` to receive only some properties.",
    inputSchema: {
      type: "object",
      properties: {
        fields: {
          type: "array",
          description: "Top-level properties to return. Omit to return all of them.",
          items: { type: "string", enum: [...PROFILE_FIELDS] },
          minItems: 1,
          uniqueItems: true,
        },
      },
      additionalProperties: false,
    },
    run: ({ fields }) => {
      if (fields === undefined) return getProfilePayload();
      if (
        !Array.isArray(fields) ||
        fields.length === 0 ||
        !fields.every((f) => typeof f === "string" && isProfileField(f))
      ) {
        throw new ToolArgumentError(
          `"fields" must be a non-empty list drawn from: ${PROFILE_FIELDS.join(", ")}.`,
        );
      }
      return getProfilePayload(fields as Parameters<typeof getProfilePayload>[0]);
    },
  },
  {
    name: "list_roles",
    description:
      "List the organizations Angelo Laus is currently active in, with his title at each one. Pass `organization` to look up a single organization.",
    inputSchema: {
      type: "object",
      properties: {
        organization: {
          type: "string",
          description: "Only return roles at the organization with this name (case-insensitive).",
          minLength: 1,
        },
      },
      additionalProperties: false,
    },
    run: ({ organization }) => {
      if (organization === undefined) return getRolesPayload();
      if (typeof organization !== "string" || organization.trim() === "") {
        throw new ToolArgumentError('"organization" must be a non-empty string.');
      }
      return getRolesPayload(organization.trim());
    },
  },
  {
    name: "list_projects",
    description:
      "List the projects Angelo Laus has built. Pass `year` to return only projects from that four-digit year.",
    inputSchema: {
      type: "object",
      properties: {
        year: {
          type: "integer",
          description: "Only return projects from this four-digit year.",
          minimum: 1000,
          maximum: 9999,
        },
      },
      additionalProperties: false,
    },
    run: ({ year }) => {
      if (year === undefined) return getProjectsPayload();
      if (!Number.isInteger(year) || (year as number) < 1000 || (year as number) > 9999) {
        throw new ToolArgumentError('"year" must be a four-digit integer.');
      }
      return getProjectsPayload(year as number);
    },
  },
];

export function findAgentTool(name: string): AgentTool | undefined {
  return agentTools.find((tool) => tool.name === name);
}
