"use client";

import { useEffect } from "react";
import { findModelContext, registerWebMcpTools, type ModelContext } from "@/lib/webmcp";

/** Exposes the site's read-only tools to in-browser agents through WebMCP. */
export function WebMcp() {
  useEffect(() => {
    const modelContext = findModelContext(
      document as unknown as { modelContext?: ModelContext },
      navigator as unknown as { modelContext?: ModelContext },
    );
    if (!modelContext) return;

    const controller = new AbortController();
    registerWebMcpTools(modelContext, controller.signal).catch(() => {
      // Registration can fail if a tool name is already taken; the site works without it.
    });
    return () => controller.abort();
  }, []);

  return null;
}
