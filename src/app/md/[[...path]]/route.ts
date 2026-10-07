import { getMarkdownForPath } from "@/lib/markdown";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await params;
  const { status, body } = getMarkdownForPath(`/${path.join("/")}`);

  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
