import { discoveryJson } from "@/lib/discovery";
import { getProtectedResourceMetadata } from "@/lib/oauth";

/**
 * RFC 9728 requires `resource` to match the origin the document is fetched
 * from. The site answers on both gelolaus.com and www.gelolaus.com, so the
 * value follows the request instead of being fixed at build time.
 */
export function GET(request: Request) {
  return discoveryJson(getProtectedResourceMetadata(new URL(request.url).origin));
}
