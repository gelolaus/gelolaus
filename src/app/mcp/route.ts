import { handleMcpMessage, type JsonRpcResponse } from "@/lib/mcp";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version",
};

const parseError: JsonRpcResponse = {
  jsonrpc: "2.0",
  id: null,
  error: { code: -32700, message: "Parse error" },
};

/** Stateless MCP over Streamable HTTP: one JSON-RPC message (or batch) per POST. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(parseError, { status: 400, headers: CORS });
  }

  if (Array.isArray(body)) {
    const replies = body.map(handleMcpMessage).filter((r) => r !== null);
    if (replies.length === 0) return new Response(null, { status: 202, headers: CORS });
    return Response.json(replies, { headers: CORS });
  }

  const reply = handleMcpMessage(body);
  if (reply === null) return new Response(null, { status: 202, headers: CORS });
  return Response.json(reply, { headers: CORS });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

function notSupported() {
  return new Response("This MCP server is stateless. Send JSON-RPC with POST.", {
    status: 405,
    headers: { ...CORS, Allow: "POST, OPTIONS" },
  });
}

export const GET = notSupported;
export const DELETE = notSupported;
