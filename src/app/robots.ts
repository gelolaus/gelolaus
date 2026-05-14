import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // ── AI training crawlers ──────────────────────────────────────────
      { userAgent: "GPTBot", disallow: "/" },           // OpenAI
      { userAgent: "ChatGPT-User", disallow: "/" },
      { userAgent: "OAI-SearchBot", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },            // Common Crawl (used by many LLMs)
      { userAgent: "anthropic-ai", disallow: "/" },     // Anthropic
      { userAgent: "ClaudeBot", disallow: "/" },
      { userAgent: "Claude-Web", disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },  // Google AI training opt-out
      { userAgent: "PerplexityBot", disallow: "/" },
      { userAgent: "Cohere-ai", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },       // ByteDance / TikTok
      { userAgent: "Diffbot", disallow: "/" },
      { userAgent: "FacebookBot", disallow: "/" },      // Meta AI
      { userAgent: "Applebot-Extended", disallow: "/" },// Apple AI training
    ],
    sitemap: "https://gelolaus.com/sitemap.xml",
  };
}
