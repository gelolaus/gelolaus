import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Journal · gelolaus",
  description: "Thoughts on tech, community, and building things that matter.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/journal" },
  openGraph: {
    title: "Journal · gelolaus",
    description: "Thoughts on tech, community, and building things that matter.",
    url: "https://gelolaus.com/journal",
    siteName: "gelolaus",
    images: [{ url: "/avatar.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Journal · gelolaus",
    images: ["/avatar.png"],
  },
};

export default function JournalPage() {
  const posts = getAllPosts();
  return (
    <main className="page">
      <Link href="/" className="back">
        &larr; gelolaus.com
      </Link>

      <h1>Journal</h1>
      <p className="muted">Thoughts on tech, community, and building things that matter.</p>

      <ul className="journal-list">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/journal/${post.slug}`}>{post.title}</Link>
            <span className="meta">{post.formattedDate}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
