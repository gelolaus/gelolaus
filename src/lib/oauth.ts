import { SITE_URL } from "@/lib/profile";

export const AUTH_MD_URL = `${SITE_URL}/auth.md`;

/**
 * RFC 9728 protected resource metadata for the whole origin. The API is public and read-only, so
 * no authorization server issues tokens for it. `profile:read` only names the access
 * the public endpoints already grant without a token.
 */
export function getProtectedResourceMetadata(origin: string = SITE_URL) {
  return {
    resource: origin,
    authorization_servers: [SITE_URL],
    scopes_supported: ["profile:read"],
    bearer_methods_supported: ["header"],
    resource_name: "gelolaus.com API",
    resource_documentation: `${SITE_URL}/docs`,
  };
}

/**
 * RFC 8414 authorization server metadata. It advertises no grant types and no
 * endpoints on purpose: nothing here requires a token, and listing endpoints
 * that do not exist would mislead clients.
 */
export function getAuthorizationServerMetadata() {
  return {
    issuer: SITE_URL,
    response_types_supported: [] as string[],
    grant_types_supported: [] as string[],
    token_endpoint_auth_methods_supported: ["none"],
    service_documentation: `${SITE_URL}/docs`,
    agent_auth: {
      skill: AUTH_MD_URL,
      registration_required: false,
    },
  };
}
