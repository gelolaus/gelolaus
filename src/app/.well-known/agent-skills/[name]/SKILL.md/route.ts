import { discoveryText } from "@/lib/discovery";
import { findSkill, renderSkillMd, skills } from "@/lib/skills";

export const dynamicParams = false;

export function generateStaticParams() {
  return skills.map(({ name }) => ({ name }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const skill = findSkill((await params).name);
  if (!skill) return new Response("Not found", { status: 404 });
  return discoveryText(renderSkillMd(skill), "text/markdown; charset=utf-8");
}
