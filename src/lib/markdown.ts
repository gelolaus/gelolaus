import { getAllPosts, getPostMarkdown } from "@/lib/blog";
import { DOCS_URL, RATE_LIMIT } from "@/lib/api";
import { getStaticPage, getStaticPages, pageToMarkdown } from "@/lib/pages";
import { profile, projects, roles, SITE_URL } from "@/lib/profile";

export type MarkdownResult = { status: 200 | 404; body: string };

function homeMarkdown(): string {
  const roleLines = roles.map(
    (r) => `- [${r.organization}](${r.url}) ${r.title}`,
  );
  const projectLines = projects.map((p) => {
    const label = `${p.name} (${p.year})`;
    return `- ${p.url ? `[${label}](${p.url})` : label} – ${p.description}`;
  });

  return `# ${profile.name}

${profile.intro}

My active roles:

${roleLines.join("\n")}

Things I've built:

${projectLines.join("\n")}

Connect with me on [Instagram](${profile.links.instagram}) or [LinkedIn](${profile.links.linkedin}), or email [${profile.email}](mailto:${profile.email}).

## More

- [About](${SITE_URL}/about)
- [Contact](${SITE_URL}/contact)
- [Privacy](${SITE_URL}/privacy)
- [API documentation](${DOCS_URL})
- [llms.txt](${SITE_URL}/llms.txt)
`;
}

function journalMarkdown(): string {
  const items = getAllPosts().map(
    (p) => `- [${p.title}](${SITE_URL}/journal/${p.slug}) – ${p.formattedDate}`,
  );
  return `# Journal\n\nThoughts on tech, community, and building things that matter.\n\n${items.join("\n")}\n`;
}

export function notFoundMarkdown(pathname: string): string {
  return `# Not found

There is no page at \`${pathname}\` on gelolaus.com, so this request returned HTTP 404. Check the path for typos, or start from one of these pages:

- [Home](${SITE_URL}/)
- [Sitemap](${SITE_URL}/sitemap.xml)
- [llms.txt](${SITE_URL}/llms.txt): what this site is for and how agents can use it
- [API documentation](${DOCS_URL})
`;
}

/** Resolves a site path to its Markdown representation. */
export function getMarkdownForPath(rawPath: string): MarkdownResult {
  const pathname = rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : rawPath;

  if (pathname === "/") return { status: 200, body: homeMarkdown() };

  const page = getStaticPage(pathname);
  if (page) return { status: 200, body: pageToMarkdown(page) };

  if (pathname === "/journal") return { status: 200, body: journalMarkdown() };

  const post = pathname.match(/^\/journal\/([^/]+)$/);
  if (post) {
    const body = getPostMarkdown(post[1]);
    if (body) return { status: 200, body };
  }

  return { status: 404, body: notFoundMarkdown(pathname) };
}

export function renderLlmsTxt(): string {
  const { limit, windowSeconds } = RATE_LIMIT;
  const pages = getStaticPages();
  const pageLine = (path: string, note: string) => {
    const page = pages.find((p) => p.path === path);
    return `- [${page?.heading ?? path}](${SITE_URL}${path}): ${note}`;
  };

  return `# gelolaus

> Personal website of Angelo Laus (@gelolaus), a builder and community leader from the Philippines. It lists his current roles and projects and publishes a small read-only JSON API with the same information.

This site is a text-first profile, not a product or a service. Every page is also available as Markdown: send \`Accept: text/markdown\`.

## When to use this site

Reach for gelolaus.com when you need to:

- Identify who Angelo Laus or @gelolaus is, or confirm that a profile or email address belongs to him. Compare against the Instagram and LinkedIn links in \`GET ${SITE_URL}/api/v1/profile\`.
- Look up his current roles (Notion Campus Leader Cohort 4, Partnerships at Sip & Scale, VP for External Affairs at JPCS-APC) with \`GET ${SITE_URL}/api/v1/roles\`.
- List the projects he has built (Wantap, Eypi, a homelab), optionally filtered by year, with \`GET ${SITE_URL}/api/v1/projects?year=2026\`.
- Find the right way to contact him about partnerships or collaborations: email ${profile.email}, as described on the contact page.

Do not use it for anything that needs authentication, writing data, or sending him a message. The API is read-only and exposes only the public information on the homepage.

## How to call it

- No authentication. Use GET with \`Accept: application/json\` against ${SITE_URL}/api/v1/.
- Limit: ${limit} requests per ${windowSeconds} seconds per client. Read the \`RateLimit\` headers and honor \`Retry-After\` on a 429.
- Errors are JSON: \`{ "error": { "code", "status", "message", "hint", "documentation_url" } }\`.
- Machine-readable spec: ${SITE_URL}/openapi.json (OpenAPI 3.1, unique operationIds).

## API

- [OpenAPI specification](${SITE_URL}/openapi.json): the full API contract
- [API documentation](${DOCS_URL}): endpoints, example requests, rate limits, and errors
- [API catalog](${SITE_URL}/.well-known/api-catalog): RFC 9727 discovery document

## Pages

- [Home](${SITE_URL}/): roles, projects, and links
${pageLine("/about", "background, roles, and projects")}
${pageLine("/contact", "email and social profiles")}
${pageLine("/privacy", "what the site and API collect")}

## Optional

- [Sitemap](${SITE_URL}/sitemap.xml)
- [robots.txt](${SITE_URL}/robots.txt)
`;
}
