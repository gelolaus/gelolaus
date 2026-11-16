import { discoveryJson } from "@/lib/discovery";
import { getPoppyManifest } from "@/lib/poppy";

export const dynamic = "force-static";

export function GET() {
  return discoveryJson(getPoppyManifest());
}
