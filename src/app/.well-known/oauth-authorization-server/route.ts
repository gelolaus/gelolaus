import { discoveryJson } from "@/lib/discovery";
import { getAuthorizationServerMetadata } from "@/lib/oauth";

export const dynamic = "force-static";

export function GET() {
  return discoveryJson(getAuthorizationServerMetadata());
}
