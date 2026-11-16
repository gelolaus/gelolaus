import { agentTools, findAgentTool, ToolArgumentError } from "@/lib/agent-tools";
import { SITE_URL } from "@/lib/profile";

export const MCP_PROTOCOL_VERSION = "2025-06-18";
export const MCP_ENDPOINT = `${SITE_URL}/mcp`;

export const MCP_SERVER_INFO = {
  name: "gelolaus",
  title: "gelolaus.com profile",
  version: "1.0.0",
} as const;

export const MCP_CAPABILITIES = { tools: { listChanged: false } } as const;

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc?: unknown;
  id?: JsonRpcId;
  method?: unknown;
  params?: Record<string, unknown>;
};

export type JsonRpcResponse =
  | { jsonrpc: "2.0"; id: JsonRpcId; result: unknown }
  | { jsonrpc: "2.0"; id: JsonRpcId; error: { code: number; message: string } };

const result = (id: JsonRpcId, value: unknown): JsonRpcResponse => ({
  jsonrpc: "2.0",
  id,
  result: value,
});

const failure = (id: JsonRpcId, code: number, message: string): JsonRpcResponse => ({
  jsonrpc: "2.0",
  id,
  error: { code, message },
});

function callTool(id: JsonRpcId, params: Record<string, unknown> | undefined) {
  const name = params?.name;
  const tool = typeof name === "string" ? findAgentTool(name) : undefined;
  if (!tool) return failure(id, -32602, `Unknown tool: ${String(name)}`);

  const args = params?.arguments;
  if (args !== undefined && (typeof args !== "object" || args === null || Array.isArray(args))) {
    return failure(id, -32602, '"arguments" must be an object.');
  }

  try {
    const payload = tool.run((args as Record<string, unknown> | undefined) ?? {});
    return result(id, {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: payload,
    });
  } catch (error) {
    if (!(error instanceof ToolArgumentError)) throw error;
    return result(id, {
      content: [{ type: "text", text: error.message }],
      isError: true,
    });
  }
}

/**
 * Handles one JSON-RPC message of the stateless Streamable HTTP transport.
 * Returns null for notifications, which take no response.
 */
export function handleMcpMessage(message: unknown): JsonRpcResponse | null {
  if (typeof message !== "object" || message === null || Array.isArray(message)) {
    return failure(null, -32600, "Invalid Request");
  }
  const { jsonrpc, id, method, params } = message as JsonRpcRequest;
  if (jsonrpc !== "2.0" || typeof method !== "string") {
    return failure(id ?? null, -32600, "Invalid Request");
  }
  if (id === undefined) return null;

  switch (method) {
    case "initialize":
      return result(id, {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: MCP_CAPABILITIES,
        serverInfo: MCP_SERVER_INFO,
        instructions:
          "Read-only tools for the public profile of Angelo Laus (@gelolaus). No authentication is required.",
      });
    case "ping":
      return result(id, {});
    case "tools/list":
      return result(id, {
        tools: agentTools.map(({ name, description, inputSchema }) => ({
          name,
          description,
          inputSchema,
          annotations: { readOnlyHint: true, openWorldHint: false },
        })),
      });
    case "tools/call":
      return callTool(id, params);
    default:
      return failure(id, -32601, `Method not found: ${method}`);
  }
}
