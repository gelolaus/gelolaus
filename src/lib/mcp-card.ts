import { agentTools } from "@/lib/agent-tools";
import { MCP_CAPABILITIES, MCP_ENDPOINT, MCP_PROTOCOL_VERSION, MCP_SERVER_INFO } from "@/lib/mcp";
import { SITE_URL } from "@/lib/profile";

/** MCP Server Card (SEP-1649), served at /.well-known/mcp/server-card.json. */
export function getMcpServerCard() {
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
    protocolVersion: MCP_PROTOCOL_VERSION,
    serverInfo: MCP_SERVER_INFO,
    description:
      "Read-only tools for the public profile of Angelo Laus (@gelolaus): profile, roles, and projects.",
    documentationUrl: `${SITE_URL}/docs`,
    transport: { type: "streamable-http", endpoint: MCP_ENDPOINT },
    authentication: { required: false },
    capabilities: MCP_CAPABILITIES,
    tools: agentTools.map(({ name, description }) => ({ name, description })),
  };
}
