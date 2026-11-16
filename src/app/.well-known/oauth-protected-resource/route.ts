import { discoveryJson } from "@/lib/discovery";
import { getProtectedResourceMetadata } from "@/lib/oauth";

export const dynamic = "force-static";

export function GET() {
  return discoveryJson(getProtectedResourceMetadata());
}
