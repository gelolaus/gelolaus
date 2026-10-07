import type { NextRequest } from "next/server";
import { notFound, preflight, withApi } from "@/lib/api";
import { SITE_URL } from "@/lib/profile";

const index = withApi(() =>
  Response.json({
    name: "gelolaus.com API",
    version: "v1",
    description:
      "Read-only JSON API for the public profile of Angelo Laus (@gelolaus).",
    documentation: `${SITE_URL}/docs`,
    openapi: `${SITE_URL}/openapi.json`,
    endpoints: [
      `${SITE_URL}/api/v1/profile`,
      `${SITE_URL}/api/v1/roles`,
      `${SITE_URL}/api/v1/projects`,
    ],
  }),
);

function handle(request: NextRequest): Promise<Response> {
  if (request.method === "OPTIONS") return preflight(request);
  const isIndex = new URL(request.url).pathname.replace(/\/$/, "") === "/api";
  if (isIndex && request.method === "GET") return index(request);
  return notFound(request);
}

export const GET = handle;
export const OPTIONS = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
