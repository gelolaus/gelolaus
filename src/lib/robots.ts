import { SITE_URL } from "@/lib/profile";

type Rule = { userAgent: string; allow?: string; disallow?: string };

/** AI crawlers that are asked to stay away entirely. */
const BLOCKED_AI_CRAWLERS = [
  "GPTBot", // OpenAI
  "ChatGPT-User",
  "OAI-SearchBot",
  "CCBot", // Common Crawl (used by many LLMs)
  "anthropic-ai", // Anthropic
  "ClaudeBot",
  "Claude-Web",
  "Google-Extended", // Google AI training opt-out
  "PerplexityBot",
  "Cohere-ai",
  "Bytespider", // ByteDance / TikTok
  "Diffbot",
  "FacebookBot", // Meta AI
  "Applebot-Extended", // Apple AI training
];

export const robotsRules: Rule[] = [
  { userAgent: "*", allow: "/" },
  ...BLOCKED_AI_CRAWLERS.map((userAgent) => ({ userAgent, disallow: "/" })),
];

export function renderRobotsTxt(): string {
  const groups = robotsRules.map((rule) =>
    [
      `User-Agent: ${rule.userAgent}`,
      rule.allow ? `Allow: ${rule.allow}` : null,
      rule.disallow ? `Disallow: ${rule.disallow}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return `${groups.join("\n\n")}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}
