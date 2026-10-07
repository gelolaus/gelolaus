import { getOpenApiSpec } from "@/lib/openapi";

export const dynamic = "force-static";

export function GET() {
  return Response.json(getOpenApiSpec(), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
