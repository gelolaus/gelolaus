import type { MetadataRoute } from "next";

const pages = [
  { path: "", priority: 1 },
  { path: "/about", priority: 0.6 },
  { path: "/contact", priority: 0.6 },
  { path: "/docs", priority: 0.6 },
  { path: "/privacy", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority }) => ({
    url: `https://gelolaus.com${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority,
  }));
}
