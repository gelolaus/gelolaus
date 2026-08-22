import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} · gelolaus`,
    description: post.excerpt,
    alternates: { canonical: `/journal/${slug}` },
    openGraph: {
      title: `${post.title} · gelolaus`,
      description: post.excerpt,
      url: `https://gelolaus.com/journal/${slug}`,
      siteName: "gelolaus",
      images: post.coverImage ? [{ url: post.coverImage }] : [{ url: "/avatar.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} · gelolaus`,
      images: post.coverImage ? [post.coverImage] : ["/avatar.png"],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="page">
      <Link href="/journal" className="back">
        &larr; Journal
      </Link>

      <header className="article-header">
        <h1>{post.title}</h1>
        <p className="meta">
          {post.formattedDate} &middot; {post.readTime}
        </p>
      </header>

      {post.coverImage && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={post.coverImage} alt={post.title} className="article-cover" />
      )}

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </main>
  );
}
