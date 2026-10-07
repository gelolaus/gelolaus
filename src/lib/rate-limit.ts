export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Whole seconds until the current window resets (at least 1). */
  resetSeconds: number;
};

type Options = {
  limit: number;
  windowSeconds: number;
  now?: () => number;
};

const MAX_TRACKED_KEYS = 5000;

/**
 * Fixed-window limiter held in process memory. It is best-effort: each
 * server instance counts independently and counters reset on cold start.
 */
export function createRateLimiter({
  limit,
  windowSeconds,
  now = Date.now,
}: Options) {
  const windowMs = windowSeconds * 1000;
  const hits = new Map<string, { count: number; resetAt: number }>();

  function prune(at: number) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= at) hits.delete(key);
    }
  }

  return {
    limit,
    windowSeconds,
    check(key: string): RateLimitResult {
      const at = now();
      if (hits.size >= MAX_TRACKED_KEYS) prune(at);

      let entry = hits.get(key);
      if (!entry || entry.resetAt <= at) {
        entry = { count: 0, resetAt: at + windowMs };
        hits.set(key, entry);
      }
      entry.count += 1;

      return {
        allowed: entry.count <= limit,
        limit,
        remaining: Math.max(0, limit - entry.count),
        resetSeconds: Math.max(1, Math.ceil((entry.resetAt - at) / 1000)),
      };
    },
  };
}

/**
 * Emits the IETF httpapi-ratelimit-headers structured fields
 * (RateLimit-Policy, RateLimit) alongside the widely deployed
 * RateLimit-Limit / -Remaining / -Reset trio. A 429 adds Retry-After.
 */
export function rateLimitHeaders(
  result: RateLimitResult,
  windowSeconds: number,
): Record<string, string> {
  const headers: Record<string, string> = {
    "RateLimit-Policy": `"default";q=${result.limit};w=${windowSeconds}`,
    RateLimit: `"default";r=${result.remaining};t=${result.resetSeconds}`,
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(result.resetSeconds),
  };
  if (!result.allowed) headers["Retry-After"] = String(result.resetSeconds);
  return headers;
}
