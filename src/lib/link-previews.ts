import generatedData from "@/lib/link-previews.generated.json";
import { previewOverrides } from "@/lib/profile";

export type LinkPreview = {
  title: string;
  description: string;
  domain: string;
  image: string;
};

type PreviewMap = Record<string, Partial<LinkPreview>>;

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const pathname = u.pathname.replace(/\/+$/, "");
    return `${u.protocol}//${host}${pathname}${u.search}`;
  } catch {
    return url.trim().toLowerCase().replace(/\/+$/, "");
  }
}

function lookup(map: PreviewMap, key: string): Partial<LinkPreview> | undefined {
  for (const [url, value] of Object.entries(map)) {
    if (normalizeUrl(url) === key) return value;
  }
  return undefined;
}

export function getPreview(
  url: string,
  generated: PreviewMap = generatedData as PreviewMap,
  overrides: PreviewMap = previewOverrides,
): LinkPreview | null {
  const key = normalizeUrl(url);
  const merged = { ...lookup(generated, key), ...lookup(overrides, key) };
  if (!merged.title || !merged.image) return null;
  const domain = merged.domain || new URL(key).hostname;
  return {
    title: merged.title,
    description: merged.description ?? "",
    domain,
    image: merged.image,
  };
}
