import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { ScrollNav } from "@/components/ScrollNav";
import { Cursor } from "@/components/Cursor";
import { BlogList } from "@/components/blog/BlogList";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Journal · gelolaus",
  description: "Thoughts on tech, community, and building things that matter.",
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

export default function BlogPage() {
  const posts = getAllPosts();
  return (
    <>
      <Cursor />
      <Nav />
      <ScrollNav />
      <BlogList posts={posts} />
    </>
  );
}
