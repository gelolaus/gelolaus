import { discoveryJson } from "@/lib/discovery";
import { getMcpServerCard } from "@/lib/mcp-card";

export const dynamic = "force-static";

export function GET() {
  return discoveryJson(getMcpServerCard());
}
