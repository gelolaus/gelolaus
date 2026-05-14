import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import readingTime from "reading-time";

const CONTENT_DIR = path.join(process.cwd(), "content", "journal");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  formattedDate: string;
  coverImage: string;
  excerpt: string;
  readTime: string;
};

export type Post = PostMeta & { contentHtml: string };

function slugFromFilename(filename: string): string {
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/\.md$/, "");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"));

  return files
    .map((filename) => {
      const slug = slugFromFilename(filename);
      const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf-8");
      const { data, content } = matter(raw);
      const rt = readingTime(content);
      return {
        slug,
        title: data.title as string,
        date: data.date as string,
        formattedDate: formatDate(data.date as string),
        coverImage: (data.coverImage as string) ?? "",
        excerpt: data.excerpt as string,
        readTime: rt.text,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!fs.existsSync(CONTENT_DIR)) return null;
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"));
  const filename = files.find((f) => slugFromFilename(f) === slug);
  if (!filename) return null;

  const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf-8");
  const { data, content } = matter(raw);
  const rt = readingTime(content);
  const contentHtml = marked.parse(content, { gfm: true }) as string;

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    formattedDate: formatDate(data.date as string),
    coverImage: (data.coverImage as string) ?? "",
    excerpt: data.excerpt as string,
    readTime: rt.text,
    contentHtml,
  };
}
