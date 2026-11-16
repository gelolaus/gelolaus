export const DISCOVERY_CACHE = "public, max-age=3600";

/**
 * JSON response for a `/.well-known` discovery document. Discovery documents
 * are public, so any origin may read them (agents often fetch from a browser).
 */
export function discoveryJson(
  body: unknown,
  contentType = "application/json; charset=utf-8",
): Response {
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": DISCOVERY_CACHE,
    },
  });
}

/** Plain-text or Markdown discovery document with the same caching rules. */
export function discoveryText(body: string, contentType: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": DISCOVERY_CACHE,
    },
  });
}
