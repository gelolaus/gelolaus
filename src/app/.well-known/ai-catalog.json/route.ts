import { getAiCatalog } from "@/lib/ai-catalog";
import { discoveryJson } from "@/lib/discovery";

export const dynamic = "force-static";

export function GET() {
  return discoveryJson(getAiCatalog());
}
