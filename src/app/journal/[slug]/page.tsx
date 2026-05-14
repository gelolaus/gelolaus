import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { ScrollNav } from "@/components/ScrollNav";
import { Cursor } from "@/components/Cursor";
import { BlogPost } from "@/components/blog/BlogPost";
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
    <>
      <Cursor />
      <Nav />
      <ScrollNav />
      <BlogPost post={post} />
    </>
  );
}
