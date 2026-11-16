import { API_RESOURCE } from "@/lib/oauth";
import { MCP_ENDPOINT } from "@/lib/mcp";
import { profile, SITE_URL } from "@/lib/profile";

/** Auth.md for agents: there is nothing to register for, and it says so. */
export function renderAuthMd(): string {
  return `# gelolaus.com auth.md

Agent registration and authentication for ${SITE_URL}.

## Audience

AI agents and automated clients that read the public profile of ${profile.name} (@${profile.handle}).

## Registration

None. There is no registration endpoint, no account, and no credential to obtain. Every endpoint is public and read-only.

## Authentication

- Protected resource: \`${API_RESOURCE}\`
- MCP server: \`${MCP_ENDPOINT}\`
- Send no \`Authorization\` header. Requests with one are treated like any other.

## Metadata

- Protected resource metadata: ${SITE_URL}/.well-known/oauth-protected-resource
- Authorization server metadata: ${SITE_URL}/.well-known/oauth-authorization-server (no grant types, because no tokens are issued)

## Limits

- ${SITE_URL}/api/v1 allows 60 requests per 60 seconds per client. See the \`RateLimit\` response headers.

## Contact

${profile.email}
`;
}
