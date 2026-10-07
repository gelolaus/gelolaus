type AcceptEntry = { type: string; q: number; index: number };

function parseAccept(header: string): AcceptEntry[] {
  return header
    .split(",")
    .map((part, index) => {
      const [rawType, ...params] = part.split(";");
      let q = 1;
      for (const param of params) {
        const [key, value] = param.split("=").map((s) => s.trim());
        if (key?.toLowerCase() === "q") {
          const parsed = Number(value);
          q = Number.isFinite(parsed) ? parsed : 0;
        }
      }
      return { type: rawType.trim().toLowerCase(), q, index };
    })
    .filter((entry) => entry.type.length > 0);
}

/**
 * True when the client explicitly asks for text/markdown and ranks it above
 * text/html. Wildcards alone never select Markdown, so browsers keep HTML.
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;
  const entries = parseAccept(accept);

  const markdown = entries.find((e) => e.type === "text/markdown");
  if (!markdown || markdown.q <= 0) return false;

  const html =
    entries.find((e) => e.type === "text/html") ??
    entries.find((e) => e.type === "text/*") ??
    entries.find((e) => e.type === "*/*");
  if (!html) return true;

  if (markdown.q !== html.q) return markdown.q > html.q;
  return markdown.index < html.index;
}

const NON_PAGE_PREFIXES = ["/api", "/_next", "/md", "/.well-known"];

/** Page routes that have a Markdown representation (not APIs or files). */
export function isNegotiablePath(pathname: string): boolean {
  if (
    NON_PAGE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return false;
  }
  const last = pathname.split("/").pop() ?? "";
  return !last.includes(".");
}
