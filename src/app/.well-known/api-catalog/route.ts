import { DOCS_URL } from "@/lib/api";
import { SITE_URL } from "@/lib/profile";

export const dynamic = "force-static";

/** RFC 9727 API catalog, serialized as an RFC 9264 linkset. */
export function GET() {
  const catalog = {
    linkset: [
      {
        anchor: `${SITE_URL}/api/v1`,
        "service-desc": [
          { href: `${SITE_URL}/openapi.json`, type: "application/json" },
        ],
        "service-doc": [{ href: DOCS_URL, type: "text/html" }],
      },
    ],
  };
  return new Response(JSON.stringify(catalog), {
    headers: {
      "Content-Type":
        'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
