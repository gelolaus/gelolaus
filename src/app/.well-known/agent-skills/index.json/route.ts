import { discoveryJson } from "@/lib/discovery";
import { getSkillsIndex } from "@/lib/skills";

export const dynamic = "force-static";

export function GET() {
  return discoveryJson(getSkillsIndex());
}
