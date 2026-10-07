import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { getStaticPage } from "@/lib/pages";
import { SITE_URL } from "@/lib/profile";
import { renderMarkdown } from "@/lib/render";

export function staticPageMetadata(path: string): Metadata {
  const page = getStaticPage(path);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${SITE_URL}${path}`,
      siteName: "gelolaus",
      images: [{ url: "/avatar.png" }],
    },
  };
}

export function StaticPage({ path }: { path: string }) {
  const page = getStaticPage(path);
  if (!page) notFound();

  return (
    <main className="page">
      <Link href="/" className="back">
        &larr; gelolaus.com
      </Link>

      <h1>{page.heading}</h1>

      <div
        className="prose static-prose"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }}
      />

      <SiteFooter />
    </main>
  );
}
