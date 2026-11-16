import { agentTools, ToolArgumentError } from "@/lib/agent-tools";

type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: object;
  annotations?: { readOnlyHint?: boolean };
  execute: (args: Record<string, unknown>) => Promise<{
    content: { type: "text"; text: string }[];
    isError?: boolean;
  }>;
};

export type ModelContext = {
  registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => Promise<unknown> | unknown;
};

/** Finds the WebMCP entry point: `document.modelContext`, else the older `navigator.modelContext`. */
export function findModelContext(
  doc: { modelContext?: ModelContext } | undefined,
  nav: { modelContext?: ModelContext } | undefined,
): ModelContext | undefined {
  return doc?.modelContext ?? nav?.modelContext;
}

/** Registers every shared agent tool; aborting `signal` unregisters them. */
export async function registerWebMcpTools(
  modelContext: ModelContext,
  signal: AbortSignal,
): Promise<void> {
  await Promise.all(
    agentTools.map((tool) =>
      modelContext.registerTool(
        {
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          annotations: { readOnlyHint: true },
          execute: async (args) => {
            try {
              return { content: [{ type: "text", text: JSON.stringify(tool.run(args ?? {})) }] };
            } catch (error) {
              if (!(error instanceof ToolArgumentError)) throw error;
              return { content: [{ type: "text", text: error.message }], isError: true };
            }
          },
        },
        { signal },
      ),
    ),
  );
}
