import { RATE_LIMIT } from "@/lib/api";
import { getProfilePayload, profile, SITE_URL } from "@/lib/profile";

export type StaticPage = {
  path: string;
  /** Visible H1 and Markdown title. */
  heading: string;
  /** <title> text, following the "X · gelolaus" convention used elsewhere. */
  title: string;
  description: string;
  /** Markdown body, without the H1. Single source for HTML and Markdown. */
  body: string;
};

const about: StaticPage = {
  path: "/about",
  heading: "About",
  title: "About · gelolaus",
  description:
    "Who Angelo Laus (@gelolaus) is, what he is working on, and where to verify it.",
  body: `I'm Angelo Laus, known online as @gelolaus. I'm a computer science student at Asia Pacific College in the Philippines, and I spend most of my time building things and bringing student communities together.

## What I'm doing now

- **Notion Campus Leader (Cohort 4).**
- **Partnerships at Sip & Scale.**
- **VP for External Affairs at JPCS-APC**, the Junior Philippine Computer Society chapter at Asia Pacific College.

## What I've built

- **[Wantap](https://wantap.cc) (2026)** is a digital calling card platform with custom dynamic routing.
- **[Eypi](https://eypi.cc) (2026)** is a unified campus suite for student org links, forms, and ticketing.
- **Homelab (2026)** is self-hosted infrastructure for private cloud storage and network security.

## What I care about

I'm interested in cybersecurity, web development, UI/UX design, and productivity. I like small, fast, text-first products, and this website is built that way.

## Verify me

This website, [gelolaus.com](${SITE_URL}), is my official home on the web. You can cross-check me on [Instagram](${profile.links.instagram}) and [LinkedIn](${profile.links.linkedin}), and you can reach me through the details on the [contact page](${SITE_URL}/contact).`,
};

const contact: StaticPage = {
  path: "/contact",
  heading: "Contact",
  title: "Contact · gelolaus",
  description:
    "How to reach Angelo Laus (@gelolaus): email, Instagram, and LinkedIn.",
  body: `The best way to reach me is email. I read my inbox and reply when I can.

## Email

[${profile.email}](mailto:${profile.email})

This is the only email address I use for this website. If someone claiming to be me writes from a different address about gelolaus.com, it isn't me.

## Social

- [Instagram: @gelolaus](${profile.links.instagram})
- [LinkedIn: gelolaus](${profile.links.linkedin})

## What to write to me about

- Partnerships and collaborations with student organizations and campus communities.
- Feedback or questions about [Wantap](https://wantap.cc) and [Eypi](https://eypi.cc).
- Questions about the roles and projects described on the [about page](${SITE_URL}/about).

## Good to know

There is no contact form and no chat widget on this site, and the [public API](${SITE_URL}/docs) is read-only, so it can't send me messages. Email is the only direct channel. Please don't send passwords, financial details, or government ID numbers by email or social media.`,
};

const privacy: StaticPage = {
  path: "/privacy",
  heading: "Privacy",
  title: "Privacy · gelolaus",
  description:
    "What gelolaus.com collects (almost nothing), what the hosting provider logs, and how to reach me about it.",
  body: `This page explains what happens to your data when you visit gelolaus.com or call its public API. Short version: I don't run accounts, forms, trackers, or ads, and I don't sell or share personal data.

Last updated: October 7, 2026.

## What this website collects

Nothing by design. There are no user accounts, sign-ups, comment boxes, or contact forms. The site sets no cookies and runs no analytics or advertising scripts. Fonts are bundled with the site, so loading a page doesn't send your visit to a third-party font service.

Nothing is stored in your browser. The light or dark appearance is chosen on each visit from your device's local time of day.

## Server logs

The site is delivered through a hosting provider, which may keep standard technical logs of requests such as IP address, user agent, requested URL, and timestamp. These logs are used for operating and securing the service. I don't use them to identify or profile visitors.

## The public API

The [API](${SITE_URL}/docs) returns public information only. To enforce a limit of ${RATE_LIMIT.limit} requests per ${RATE_LIMIT.windowSeconds} seconds, the server briefly keeps a counter keyed to your IP address in memory. It is not written to a database and disappears when the window ends or the server restarts.

## Email and social media

If you email me, I receive your address and whatever you write, and I keep the conversation as long as it is useful to reply to you. I won't add you to a mailing list. Messages on Instagram or LinkedIn are handled under those platforms' own privacy policies.

## Links to other sites

This site links to other websites such as Instagram, LinkedIn, Wantap, and Eypi. I don't control what they collect, so check their privacy policies.

## Questions or deletion requests

Email [${profile.email}](mailto:${profile.email}) and I'll delete any correspondence of yours that I hold. I'll update this page, and its date, if these practices change.`,
};

function docsBody(): string {
  const example = JSON.stringify(getProfilePayload(), null, 2);
  const { limit, windowSeconds } = RATE_LIMIT;

  return `The gelolaus API is a small, read-only JSON API for the public profile of Angelo Laus (@gelolaus). Use it to look up who he is, his current roles, and the projects he has built, in a format that is easy for scripts and AI agents to consume. Prefer it over scraping the HTML pages.

- Base URL: \`${SITE_URL}\`
- OpenAPI 3.1 specification: [${SITE_URL}/openapi.json](${SITE_URL}/openapi.json)
- Agent guidance and page index: [${SITE_URL}/llms.txt](${SITE_URL}/llms.txt)
- API catalog (RFC 9727): [${SITE_URL}/.well-known/api-catalog](${SITE_URL}/.well-known/api-catalog)

## Authentication

None. Every endpoint is public and read-only, so there are no API keys, tokens, or OAuth flows. Only GET, HEAD, and OPTIONS are supported.

## Endpoints

### GET /api/v1/profile

Returns the full profile: name, handle, summary, location, contact email, social links, roles, and projects. Operation ID: \`getProfile\`.

\`\`\`bash
curl -sS ${SITE_URL}/api/v1/profile
\`\`\`

\`\`\`json
${example}
\`\`\`

### GET /api/v1/roles

Returns the organizations Angelo is currently active in, as \`{ "data": [ { organization, title, url } ] }\`. Operation ID: \`listRoles\`.

\`\`\`bash
curl -sS ${SITE_URL}/api/v1/roles
\`\`\`

### GET /api/v1/projects

Returns the projects he has built, as \`{ "data": [ { name, year, url, description } ] }\`. \`url\` is \`null\` for projects without a public site. Operation ID: \`listProjects\`.

Query parameters:

- \`year\` (integer, optional): only return projects from this four-digit year.

\`\`\`bash
curl -sS "${SITE_URL}/api/v1/projects?year=2026"
\`\`\`

## Rate limits

Each client IP may make ${limit} requests per ${windowSeconds} seconds. Every API response includes the current state in these headers:

- \`RateLimit-Policy\`: the quota and window, for example \`"default";q=${limit};w=${windowSeconds}\`.
- \`RateLimit\`: what is left, for example \`"default";r=59;t=42\` (remaining requests, seconds until reset).
- \`RateLimit-Limit\`, \`RateLimit-Remaining\`, \`RateLimit-Reset\`: the same values in the older three-header form.

The first two follow the IETF httpapi RateLimit header fields draft. When you exceed the limit the API answers \`429\` with a \`Retry-After\` header (in seconds). The limit is enforced per server instance on a best-effort basis, so treat the headers as the source of truth and back off when \`RateLimit-Remaining\` reaches 0.

## Errors

Every error is JSON with the same shape, and the HTTP status always matches \`error.status\`:

\`\`\`json
{
  "error": {
    "code": "not_found",
    "status": 404,
    "message": "No API endpoint exists at /api/v1/nothing.",
    "hint": "See ${SITE_URL}/openapi.json for the list of endpoints, or ${SITE_URL}/docs.",
    "documentation_url": "${SITE_URL}/docs#errors"
  }
}
\`\`\`

Error codes:

- \`invalid_parameter\` (400): a query parameter is malformed. The \`hint\` shows a valid value.
- \`not_found\` (404): there is no endpoint at that path.
- \`method_not_allowed\` (405): the API is read-only. The \`Allow\` header lists supported methods.
- \`rate_limited\` (429): slow down and retry after the \`Retry-After\` delay.
- \`internal_error\` (500): something failed on the server. Retry shortly.

## Markdown for agents

Every page on this site is also available as Markdown. Send \`Accept: text/markdown\` and you get a Markdown body with \`Content-Type: text/markdown\` and \`Vary: Accept\`. Requests for \`text/html\` (and browsers) still get HTML. This includes error pages: an unknown path returns a \`404\` with a Markdown explanation.

\`\`\`bash
curl -sS -H "Accept: text/markdown" ${SITE_URL}/
\`\`\`

## Support

There are no uptime guarantees, as this is a personal project. Questions or problems: email [${profile.email}](mailto:${profile.email}).`;
}

export function getStaticPages(): StaticPage[] {
  return [
    about,
    contact,
    privacy,
    {
      path: "/docs",
      heading: "gelolaus API documentation",
      title: "API Docs · gelolaus",
      description:
        "Documentation for the gelolaus.com read-only JSON API: endpoints, example requests, rate limits, and errors.",
      body: docsBody(),
    },
  ];
}

export function getStaticPage(path: string): StaticPage | undefined {
  return getStaticPages().find((page) => page.path === path);
}

export function pageToMarkdown(page: StaticPage): string {
  return `# ${page.heading}\n\n${page.body}\n`;
}
