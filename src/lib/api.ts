import type { NextRequest } from "next/server";
import { createRateLimiter, rateLimitHeaders } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/profile";

export const RATE_LIMIT = { limit: 60, windowSeconds: 60 } as const;

export const DOCS_URL = `${SITE_URL}/docs`;

const limiter = createRateLimiter(RATE_LIMIT);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
  "Access-Control-Expose-Headers":
    "RateLimit, RateLimit-Policy, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, Retry-After",
};

export const ALLOWED_METHODS = ["GET", "HEAD", "OPTIONS"];

export type ApiErrorCode =
  | "invalid_parameter"
  | "not_found"
  | "method_not_allowed"
  | "rate_limited"
  | "internal_error";

type ErrorBody = {
  error: {
    code: ApiErrorCode;
    status: number;
    message: string;
    hint: string;
    documentation_url: string;
  };
};

export function errorBody(
  status: number,
  code: ApiErrorCode,
  message: string,
  hint: string,
): ErrorBody {
  return {
    error: {
      code,
      status,
      message,
      hint,
      documentation_url: `${DOCS_URL}#errors`,
    },
  };
}

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  hint: string,
  headers: Record<string, string> = {},
): Response {
  return Response.json(errorBody(status, code, message, hint), {
    status,
    headers,
  });
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "anonymous";
}

type Handler = (request: NextRequest) => Response | Promise<Response>;

function finalize(response: Response, extra: Record<string, string>): Response {
  for (const [name, value] of Object.entries({ ...CORS_HEADERS, ...extra })) {
    response.headers.set(name, value);
  }
  if (!response.headers.has("Cache-Control")) {
    response.headers.set("Cache-Control", "no-cache");
  }
  return response;
}

/**
 * Wraps an API handler with rate limiting, CORS, and JSON error handling so
 * every response from /api carries the same headers and error shape.
 */
export function withApi(handler: Handler) {
  return async (request: NextRequest): Promise<Response> => {
    const result = limiter.check(clientKey(request));
    const headers = rateLimitHeaders(result, RATE_LIMIT.windowSeconds);

    if (!result.allowed) {
      return finalize(
        apiError(
          429,
          "rate_limited",
          `Rate limit of ${RATE_LIMIT.limit} requests per ${RATE_LIMIT.windowSeconds} seconds exceeded.`,
          `Wait ${result.resetSeconds} seconds (see the Retry-After header) and retry.`,
        ),
        headers,
      );
    }

    try {
      return finalize(await handler(request), headers);
    } catch {
      return finalize(
        apiError(
          500,
          "internal_error",
          "The server failed to process the request.",
          "Retry shortly. If the problem persists, email hello@gelolaus.com.",
        ),
        headers,
      );
    }
  };
}

export const preflight = withApi(
  () => new Response(null, { status: 204, headers: { Allow: ALLOWED_METHODS.join(", ") } }),
);

function methodNotAllowed(request: NextRequest) {
  return withApi(() =>
    apiError(
      405,
      "method_not_allowed",
      `${request.method} is not supported on this endpoint.`,
      `This API is read-only. Use one of: ${ALLOWED_METHODS.join(", ")}.`,
      { Allow: ALLOWED_METHODS.join(", ") },
    ),
  )(request);
}

/** Builds the full method table for a read-only (GET) JSON endpoint. */
export function readOnlyRoute(handler: Handler) {
  const get = withApi(handler);
  return {
    GET: get,
    OPTIONS: preflight,
    POST: methodNotAllowed,
    PUT: methodNotAllowed,
    PATCH: methodNotAllowed,
    DELETE: methodNotAllowed,
  };
}

export function notFound(request: NextRequest): Promise<Response> {
  return withApi(() =>
    apiError(
      404,
      "not_found",
      `No API endpoint exists at ${new URL(request.url).pathname}.`,
      `See ${SITE_URL}/openapi.json for the list of endpoints, or ${DOCS_URL}.`,
    ),
  )(request);
}
