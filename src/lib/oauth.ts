import { SITE_URL } from "@/lib/profile";

export const API_RESOURCE = `${SITE_URL}/api/v1`;
export const AUTH_MD_URL = `${SITE_URL}/auth.md`;

/**
 * RFC 9728 protected resource metadata. The API is public and read-only, so
 * no authorization server issues tokens for it and no scopes exist.
 */
export function getProtectedResourceMetadata() {
  return {
    resource: API_RESOURCE,
    authorization_servers: [SITE_URL],
    scopes_supported: [] as string[],
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
