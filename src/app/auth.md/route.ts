import { renderAuthMd } from "@/lib/auth-md";
import { discoveryText } from "@/lib/discovery";

export const dynamic = "force-static";

export function GET() {
  return discoveryText(renderAuthMd(), "text/markdown; charset=utf-8");
}
