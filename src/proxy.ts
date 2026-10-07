import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isNegotiablePath, prefersMarkdown } from "@/lib/negotiate";

/**
 * Markdown content negotiation: a page requested with `Accept: text/markdown`
 * is rewritten to its Markdown representation under /md. Every other page
 * response is marked `Vary: Accept` because its representation depends on it.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const negotiable =
    (request.method === "GET" || request.method === "HEAD") &&
    isNegotiablePath(pathname);
  if (!negotiable) return NextResponse.next();

  if (prefersMarkdown(request.headers.get("accept"))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/md" : `/md${pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.append("Vary", "Accept");
    return response;
  }

  const response = NextResponse.next();
  response.headers.append("Vary", "Accept");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
